#!/usr/bin/env bash
# Runs the ChatterMate e2e stack natively (no Docker): a throwaway Postgres DB,
# the backend, a production build of the dashboard and the fake LLM — all on
# 127.0.0.1 ports that never collide with a dev stack on localhost.
#
#   stack.sh up            start everything in the background, wait until healthy
#   stack.sh down          stop what `up` started
#   stack.sh reset         fresh database (restarts the backend)
#   stack.sh logs [name]   tail backend | frontend | fake-llm logs
#   stack.sh tick <worker> one pass of a background worker against the stack's DB:
#                          crm-sync | knowledge | ticket-lifecycle (tests call this
#                          instead of waiting on always-on workers' poll intervals)
#   stack.sh backend|frontend|fake-llm|fake-externals|fake-mcp|fake-sso|customer-site|mail   run one service in the foreground
#                                        (what playwright.config.ts webServer calls)
#   stack.sh python ARGS...  run python with the stack's backend settings (one-off jobs a test needs)
#
# Knobs (all optional):
#   E2E_EDITION=oss|enterprise   oss (default) blocks the enterprise submodule even if present;
#                                enterprise also applies the private suite's .env.e2e overlay
#                                and seed.sql (frontend/src/modules/enterprise/e2e)
#   E2E_PG_URL                   admin URL of a Postgres with pgvector, no db name
#                                (default postgresql://$USER@127.0.0.1:5432)
#   E2E_PYTHON                   python with backend deps (default backend/venv/bin/python, else python3)
#   E2E_FRONTEND_NODE_MODULES    frontend node_modules to build with (default frontend/node_modules)
#   E2E_REDIS_URL                run with Redis on (webhook dedupe, rate limits, socket.io fan-out),
#                                as production does. Use a database of its own, e.g. redis://127.0.0.1:6379/5:
#                                the stack shares its cors:origins cache with anything else on it
#   E2E_BACKEND_WORKERS          run the backend under gunicorn (--preload, as scripts/start.sh does)
#                                with this many workers, instead of a single uvicorn process
#   E2E_WIDGET_FRAME_URL         the widget frame's own cookieless host, as production runs it
#                                (default http://localhost:18000: not the dashboard's 127.0.0.1, so
#                                no dashboard cookies). Set it empty to frame the widget on the
#                                API's own origin, as a self-host without WIDGET_FRAME_URL does
#   FASTEMBED_CACHE_PATH         where the embedding model is cached (default e2e/.cache/fastembed;
#                                fastembed's own default is the OS temp dir, which macOS purges)
set -euo pipefail

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$E2E_DIR/.." && pwd)"
STATE_DIR="$E2E_DIR/.stack"
ENTERPRISE_E2E_DIR="$REPO_DIR/frontend/src/modules/enterprise/e2e"
CACHE_DIR="$E2E_DIR/.cache"
export FASTEMBED_CACHE_PATH="${FASTEMBED_CACHE_PATH:-$CACHE_DIR/fastembed}"

EDITION="${E2E_EDITION:-oss}"
DB_NAME="chattermate_e2e"
TPL_NAME="${DB_NAME}_tpl"
PG_URL="${E2E_PG_URL:-postgresql://${USER}@127.0.0.1:5432}"
PG_URL="${PG_URL%/}"

BACKEND_PORT=18000
FRONTEND_PORT=15173
FAKE_LLM_PORT=14010
FAKE_EXTERNALS_PORT=14020
FAKE_MCP_PORT=14030
FAKE_SSO_PORT=14040
CUSTOMER_SITE_PORT=13000
# The same site with the last release's loader; the only customer-site origin in CORS_ORIGINS
CUSTOMER_SITE_LEGACY_PORT=13001
MAIL_SMTP_PORT=11025
MAIL_WEB_PORT=18025

if [[ -z "${E2E_PYTHON:-}" ]]; then
  if [[ -x "$REPO_DIR/backend/venv/bin/python" ]]; then E2E_PYTHON="$REPO_DIR/backend/venv/bin/python"; else E2E_PYTHON="python3"; fi
fi
NODE_MODULES="${E2E_FRONTEND_NODE_MODULES:-$REPO_DIR/frontend/node_modules}"

log() { printf '\033[36m[e2e]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[31m[e2e]\033[0m %s\n' "$*" >&2; exit 1; }

case "$EDITION" in oss|enterprise) ;; *) die "E2E_EDITION must be oss or enterprise, got '$EDITION'";; esac
if [[ "$EDITION" == enterprise && ! -d "$ENTERPRISE_E2E_DIR" ]]; then
  die "E2E_EDITION=enterprise needs the enterprise_frontend submodule (with its e2e/ folder) checked out"
fi
# The suite drops and recreates this database on every run. Refuse anything that
# is not obviously a throwaway, so a typo can never point it at a dev DB.
[[ "$DB_NAME" == *_e2e ]] || die "refusing to manage database '$DB_NAME': name must end in _e2e"

psql_admin() { psql "$PG_URL/postgres" -v ON_ERROR_STOP=1 -qtA "$@"; }
# SQLAlchemy needs the driver in the scheme; psql accepts both spellings.
db_url() { local base="${PG_URL#postgres://}"; base="${base#postgresql://}"; echo "postgresql+psycopg://$base/$1"; }

backend_env() {
  export ENV_FILE="$E2E_DIR/.env.e2e"
  export WIDGET_FRAME_URL="${E2E_WIDGET_FRAME_URL-http://localhost:$BACKEND_PORT}"
  export DATABASE_URL; DATABASE_URL="$(db_url "$1")"
  if [[ "$EDITION" == oss ]]; then
    export NO_ENTERPRISE=1
  else
    unset NO_ENTERPRISE
    # Enterprise-only settings (SMTP to Mailpit, default AI key, …) live with the
    # private suite; exported values override the shared .env.e2e.
    if [[ -f "$ENTERPRISE_E2E_DIR/.env.e2e" ]]; then set -a; source "$ENTERPRISE_E2E_DIR/.env.e2e"; set +a; fi
  fi
  if [[ -n "${E2E_REDIS_URL:-}" ]]; then
    export REDIS_ENABLED=true REDIS_URL="$E2E_REDIS_URL"
  fi
}

# Fingerprint of everything that shapes the schema: migration contents + edition.
# Contents, not names — amending an unmerged migration must rebuild the template.
schema_fingerprint() {
  {
    echo "$EDITION"
    cat "$REPO_DIR"/backend/alembic/versions/*.py
    if [[ "$EDITION" == enterprise ]]; then
      cat "$REPO_DIR"/backend/app/enterprise/migrations/versions/*.py "$ENTERPRISE_E2E_DIR/seed.sql" 2>/dev/null || true
    fi
  } | shasum | cut -c1-16
}

# The template DB holds a freshly migrated schema; every run clones it, which takes
# a second instead of re-running every migration.
ensure_template() {
  local fp current
  fp="$(schema_fingerprint)"
  current="$(psql_admin -c "SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = '$TPL_NAME'")"
  if [[ "$current" == "$fp" ]]; then return; fi

  log "building template database $TPL_NAME (schema changed or first run)"
  psql_admin -c "DROP DATABASE IF EXISTS $TPL_NAME"
  psql_admin -c "CREATE DATABASE $TPL_NAME"
  psql "$PG_URL/$TPL_NAME" -v ON_ERROR_STOP=1 -q -c "CREATE EXTENSION IF NOT EXISTS vector"
  (
    backend_env "$TPL_NAME"
    cd "$REPO_DIR/backend"
    "$E2E_PYTHON" -m alembic upgrade head
    if [[ "$EDITION" == enterprise ]]; then
      "$E2E_PYTHON" -m alembic -c app/enterprise/migrations/alembic.ini upgrade head
    fi
  ) >&2
  if [[ "$EDITION" == enterprise && -f "$ENTERPRISE_E2E_DIR/seed.sql" ]]; then
    psql "$PG_URL/$TPL_NAME" -v ON_ERROR_STOP=1 -q -f "$ENTERPRISE_E2E_DIR/seed.sql"
  fi
  psql_admin -c "COMMENT ON DATABASE $TPL_NAME IS '$fp'"
}

fresh_database() {
  ensure_template
  psql_admin -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid()" >/dev/null
  psql_admin -c "DROP DATABASE IF EXISTS $DB_NAME"
  psql_admin -c "CREATE DATABASE $DB_NAME TEMPLATE $TPL_NAME"
  log "fresh database $DB_NAME"
}

run_backend() {
  fresh_database
  backend_env "$DB_NAME"
  # The frontend step builds the widget into this dir; the backend only needs it to exist.
  export WIDGET_ASSETS_DIR; WIDGET_ASSETS_DIR="$(widget_assets_dir)"
  mkdir -p "$WIDGET_ASSETS_DIR"
  cd "$REPO_DIR/backend"
  if [[ -n "${E2E_BACKEND_WORKERS:-}" ]]; then
    # The same server and flags as production (scripts/start.sh). On macOS, a
    # preloaded app that forks trips the Objective-C fork-safety abort.
    if [[ "$(uname)" == Darwin ]]; then export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES; fi
    log "backend ($EDITION, gunicorn × $E2E_BACKEND_WORKERS${E2E_REDIS_URL:+, redis}) on http://127.0.0.1:$BACKEND_PORT"
    exec "$E2E_PYTHON" -m gunicorn app.main:app --workers "$E2E_BACKEND_WORKERS" \
      --worker-class uvicorn.workers.UvicornWorker --bind "127.0.0.1:$BACKEND_PORT" \
      --timeout 120 --keep-alive 5 --access-logfile - --error-logfile - --preload
  fi
  log "backend ($EDITION${E2E_REDIS_URL:+, redis}) on http://127.0.0.1:$BACKEND_PORT"
  exec "$E2E_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port "$BACKEND_PORT"
}

# Python with the running stack's backend settings (database, ENV_FILE, edition),
# for one-off jobs a test needs - e.g. one run of the setup-email sender.
run_python() {
  backend_env "$DB_NAME"
  cd "$REPO_DIR/backend"
  exec "$E2E_PYTHON" "$@"
}

# Copies frontend/ into the cache so e2e builds never touch the developer's dist/,
# .env or the committed widget/loader bundles, and so the OSS edition can leave out
# the enterprise module. Prints rsync's change list (empty = nothing changed).
sync_frontend_copy() {
  local dest="$1"
  [[ -d "$NODE_MODULES" ]] || die "no frontend node_modules at $NODE_MODULES (run npm ci in frontend/, or set E2E_FRONTEND_NODE_MODULES)"
  mkdir -p "$dest"
  # The loader bundle is generated inside the copy (build_loader), so keep rsync off it.
  local excludes=(--exclude node_modules --exclude 'dist*' --exclude '.env*' --exclude e2e --exclude coverage
                  --exclude public/webclient/chattermate.min.js)
  if [[ "$EDITION" == oss ]]; then excludes+=(--exclude src/modules/enterprise); fi
  rsync -a --delete -i "${excludes[@]}" "$REPO_DIR/frontend/" "$dest/"
  ln -sfn "$NODE_MODULES" "$dest/node_modules"
}

widget_assets_dir() { echo "$CACHE_DIR/widget-assets-$EDITION"; }

# The widget bundle the backend serves at /assets, built from the current source
# (backend/assets holds the committed production build, which may lag the source).
build_widget() {
  local src="$1" out
  out="$(widget_assets_dir)"
  (cd "$src" && node_modules/.bin/vite build --config vite.widget.config.ts --outDir "$out" --emptyOutDir --logLevel warn) >&2
  # Same post-steps as scripts/build-widget.ts: the stylesheet can land in unused/,
  # and only widget.js + widget.css belong in the assets dir (vite also copies public/).
  if [[ ! -f "$out/widget.css" ]]; then cp "$(ls "$out"/unused/*.css | head -n 1)" "$out/widget.css"; fi
  find "$out" -mindepth 1 -maxdepth 1 ! -name widget.js ! -name widget.css -exec rm -rf {} +
}

# The embed loader (chattermate.min.js), built from source into the dashboard copy's
# public/ so vite ships it in the build — what build-webclient-*.ts does.
build_loader() {
  local src="$1"
  (cd "$src" && node_modules/.bin/esbuild src/webclient/chattermate.js --bundle --minify --format=iife \
    --target=es2015 --loader:.svg=text --log-level=warning \
    --define:process.env.NODE_ENV='"production"' \
    --define:__CHATTERMATE_API_URL__="\"http://127.0.0.1:$BACKEND_PORT/api/v1\"" \
    --outfile=public/webclient/chattermate.min.js) >&2
}

# One copy of frontend/ feeds all three builds: loader, widget, dashboard.
build_frontend() {
  local src="$CACHE_DIR/frontend-$EDITION" out="$CACHE_DIR/dist-$EDITION" changes
  changes="$(sync_frontend_copy "$src")"
  if [[ -n "$changes" || ! -f "$out/index.html" || ! -f "$(widget_assets_dir)/widget.js" || -n "${E2E_REBUILD_FRONTEND:-}" ]]; then
    log "building loader, widget and dashboard ($EDITION)"
    build_loader "$src"
    build_widget "$src"
    (cd "$src" && node_modules/.bin/vite build --outDir "$out" --emptyOutDir --logLevel warn) >&2
  fi
  # Runtime config: what docker-entrypoint.sh writes in a real deployment.
  cat > "$out/config.js" <<EOF
self.APP_CONFIG = {
  API_URL: "http://127.0.0.1:$BACKEND_PORT/api/v1",
  WS_URL: "ws://127.0.0.1:$BACKEND_PORT",
  WIDGET_URL: "http://127.0.0.1:$BACKEND_PORT",
  NODE_ENV: "production"
};
EOF
}

run_frontend() {
  build_frontend
  cd "$CACHE_DIR/frontend-$EDITION"
  log "dashboard on http://127.0.0.1:$FRONTEND_PORT"
  exec node_modules/.bin/vite preview --outDir "$CACHE_DIR/dist-$EDITION" --host 127.0.0.1 --port "$FRONTEND_PORT" --strictPort
}

run_fake_llm() {
  cd "$E2E_DIR"
  exec node services/fake-llm/server.ts --port "$FAKE_LLM_PORT"
}

run_fake_externals() {
  cd "$E2E_DIR"
  exec node services/fake-externals/server.ts --port "$FAKE_EXTERNALS_PORT"
}

run_fake_mcp() {
  cd "$E2E_DIR"
  exec node services/fake-mcp/server.ts --port "$FAKE_MCP_PORT"
}

run_fake_sso() {
  cd "$E2E_DIR"
  exec node services/fake-sso/server.ts --port "$FAKE_SSO_PORT"
}

run_customer_site() {
  cd "$E2E_DIR"
  exec node services/customer-site/server.ts --port "$CUSTOMER_SITE_PORT" --legacy-port "$CUSTOMER_SITE_LEGACY_PORT" \
    --api "http://127.0.0.1:$BACKEND_PORT/api/v1" \
    --loader "http://127.0.0.1:$FRONTEND_PORT/webclient/chattermate.min.js"
}

# SMTP capture (Mailpit): everything the backend emails — email-channel replies,
# account emails, notifications — lands here, readable through its API
# (src/fakes/mailbox.ts).
run_mail() {
  command -v mailpit >/dev/null || die "mailpit not found (brew install mailpit, or see https://mailpit.axllent.org)"
  exec mailpit --smtp "127.0.0.1:$MAIL_SMTP_PORT" --listen "127.0.0.1:$MAIL_WEB_PORT" --disable-version-check --quiet
}

# One pass of a worker production runs on a loop (docker-compose's knowledge_processor,
# ticket_investigator, crm_sync), with the backend's exact environment.
run_tick() {
  local import
  case "${1:-}" in
    crm-sync) import="from app.workers.crm_sync import run_sync_pass as tick" ;;
    knowledge) import="from app.workers.knowledge_processor import run_processor as tick" ;;
    # Its main() routes socket emits through Redis and loads extensions first; so must a tick.
    ticket-lifecycle) import="from app.core.socketio import configure_socketio; configure_socketio(); from app.channels.app_hooks import load_extensions; load_extensions(); from app.workers.ticket_investigator import run_ticket_lifecycle as tick" ;;
    *) die "unknown worker '${1:-}' (crm-sync | knowledge | ticket-lifecycle)" ;;
  esac
  backend_env "$DB_NAME"
  export WIDGET_ASSETS_DIR; WIDGET_ASSETS_DIR="$(widget_assets_dir)"
  cd "$REPO_DIR/backend"
  "$E2E_PYTHON" -c "import asyncio; $import; asyncio.run(tick())"
}

wait_for() {
  local name="$1" url="$2" timeout="$3" i
  for ((i = 0; i < timeout; i++)); do
    if curl -fsS -o /dev/null "$url" 2>/dev/null; then log "$name is up"; return; fi
    if ! kill -0 "$(cat "$STATE_DIR/$name.pid")" 2>/dev/null; then
      tail -n 40 "$STATE_DIR/$name.log" >&2; die "$name exited during startup (log: $STATE_DIR/$name.log)"
    fi
    sleep 1
  done
  die "$name not healthy after ${timeout}s (log: $STATE_DIR/$name.log)"
}

start_bg() {
  local name="$1"
  if [[ -f "$STATE_DIR/$name.pid" ]] && kill -0 "$(cat "$STATE_DIR/$name.pid")" 2>/dev/null; then
    log "$name already running"; return
  fi
  "$0" "$name" >"$STATE_DIR/$name.log" 2>&1 &
  echo $! >"$STATE_DIR/$name.pid"
}

stop_bg() {
  local name="$1" pid
  [[ -f "$STATE_DIR/$name.pid" ]] || return 0
  pid="$(cat "$STATE_DIR/$name.pid")"
  # The service is exec'd, so this pid is the server itself; its children go with it.
  pkill -TERM -P "$pid" 2>/dev/null || true
  kill -TERM "$pid" 2>/dev/null || true
  rm -f "$STATE_DIR/$name.pid"
}

cmd_up() {
  mkdir -p "$STATE_DIR"
  start_bg fake-llm
  wait_for fake-llm "http://127.0.0.1:$FAKE_LLM_PORT/health" 30
  start_bg fake-externals
  wait_for fake-externals "http://127.0.0.1:$FAKE_EXTERNALS_PORT/health" 30
  start_bg fake-mcp
  wait_for fake-mcp "http://127.0.0.1:$FAKE_MCP_PORT/health" 30
  start_bg fake-sso
  wait_for fake-sso "http://127.0.0.1:$FAKE_SSO_PORT/health" 30
  start_bg customer-site
  wait_for customer-site "http://127.0.0.1:$CUSTOMER_SITE_PORT/health" 30
  wait_for customer-site "http://127.0.0.1:$CUSTOMER_SITE_LEGACY_PORT/health" 30
  start_bg mail
  wait_for mail "http://127.0.0.1:$MAIL_WEB_PORT/livez" 30
  start_bg backend
  wait_for backend "http://127.0.0.1:$BACKEND_PORT/health" 180
  start_bg frontend
  wait_for frontend "http://127.0.0.1:$FRONTEND_PORT/config.js" 300
  log "stack ready — dashboard http://127.0.0.1:$FRONTEND_PORT"
}

cmd_down() { for s in frontend backend customer-site fake-sso fake-mcp fake-externals fake-llm mail; do stop_bg "$s"; done; log "stack stopped"; }

wait_port_free() {
  local port="$1" i
  for ((i = 0; i < 30; i++)); do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 || return 0
    sleep 1
  done
  die "port $port still in use after 30s"
}

cmd_reset() {
  mkdir -p "$STATE_DIR"
  stop_bg backend
  wait_port_free "$BACKEND_PORT"
  start_bg backend
  wait_for backend "http://127.0.0.1:$BACKEND_PORT/health" 180
}

case "${1:-}" in
  up) cmd_up ;;
  down) cmd_down ;;
  reset) cmd_reset ;;
  logs) tail -n 100 -f "$STATE_DIR/${2:-backend}.log" ;;
  tick) run_tick "${2:-}" ;;
  backend) run_backend ;;
  frontend) run_frontend ;;
  fake-llm) run_fake_llm ;;
  fake-externals) run_fake_externals ;;
  fake-mcp) run_fake_mcp ;;
  fake-sso) run_fake_sso ;;
  customer-site) run_customer_site ;;
  mail) run_mail ;;
  python) shift; run_python "$@" ;;
  *) sed -n '2,21p' "$0"; exit 1 ;;
esac
