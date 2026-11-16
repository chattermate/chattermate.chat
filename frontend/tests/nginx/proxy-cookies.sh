#!/bin/sh
# Smoke test: the frontend nginx /api/ proxy must pass a backend response that
# carries full-size auth cookies (access_token, refresh_token, user_info).
# With nginx's default buffers it answers 502 "upstream sent too big header".
#
#   frontend/tests/nginx/proxy-cookies.sh                  # nginx:alpine + repo nginx.conf
#   FRONTEND_IMAGE=chattermate/frontend:x ... proxy-cookies.sh   # a built image
set -eu

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
# Under the repo, not /tmp: Docker VMs (Colima, Docker Desktop) only share home.
WORK=$(mktemp -d "$ROOT/.nginx-smoke.XXXXXX")
NET=cm-nginx-smoke-$$
FRONT=$NET-front
BACK=$NET-back
cleanup() {
  docker rm -f "$FRONT" "$BACK" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

# Stub backend: replies 200 with three cookies sized like the real ones.
cat > "$WORK/stub.py" <<'PY'
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        for name, size in (("access_token", 1200), ("refresh_token", 1200), ("user_info", 3500)):
            self.send_header("Set-Cookie", f"{name}={'x' * size}; Path=/; HttpOnly; SameSite=lax")
        self.end_headers()
        self.wfile.write(b'{"ok":true}')
    do_GET = do_POST

HTTPServer(("0.0.0.0", 8000), H).serve_forever()
PY

docker network create "$NET" >/dev/null
docker run -d --name "$BACK" --network "$NET" --network-alias backend \
  -v "$WORK/stub.py:/stub.py:ro" python:3-alpine python /stub.py >/dev/null

if [ -n "${FRONTEND_IMAGE:-}" ]; then
  docker run -d --name "$FRONT" --network "$NET" -p 127.0.0.1:0:80 "$FRONTEND_IMAGE" >/dev/null
else
  # Same startup as the image: docker-entrypoint.sh renders BACKEND_HOST/PORT
  # into a writable copy of the repo's nginx.conf.
  cp "$ROOT/nginx.conf" "$WORK/default.conf"
  cp "$ROOT/docker-entrypoint.sh" "$WORK/entrypoint.sh"
  docker run -d --name "$FRONT" --network "$NET" -p 127.0.0.1:0:80 \
    -v "$WORK/default.conf:/etc/nginx/conf.d/default.conf" \
    -v "$WORK/entrypoint.sh:/entrypoint.sh:ro" \
    --entrypoint sh nginx:alpine /entrypoint.sh nginx -g 'daemon off;' >/dev/null
fi

PORT=$(docker port "$FRONT" 80/tcp | head -n1 | sed 's/.*://')
i=0
until curl -s -o /dev/null "http://127.0.0.1:$PORT/" \
  && docker exec "$BACK" python -c "import urllib.request as u; u.urlopen('http://127.0.0.1:8000/')" 2>/dev/null; do
  i=$((i + 1)); [ "$i" -gt 30 ] && { echo "frontend did not start"; docker logs "$FRONT"; exit 1; }
  sleep 1
done

FAIL=0
for path in /api/v1/users/login /api/v1/organizations; do
  CODE=$(curl -s -o /dev/null -D "$WORK/h" -w '%{http_code}' -X POST "http://127.0.0.1:$PORT$path")
  COOKIES=$(grep -ci '^set-cookie:' "$WORK/h" || true)
  if [ "$CODE" = 200 ] && [ "$COOKIES" = 3 ]; then
    echo "PASS $path -> $CODE with $COOKIES cookies"
  else
    echo "FAIL $path -> $CODE with $COOKIES cookies"; FAIL=1
  fi
done
[ "$FAIL" = 0 ] || docker logs "$FRONT" 2>&1 | tail -n5
exit "$FAIL"
