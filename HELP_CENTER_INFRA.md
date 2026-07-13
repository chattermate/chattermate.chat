# Help Center hosting — infrastructure runbook

The public help center is served by the backend itself (host-dispatched SSR —
see `backend/app/core/help_center_host.py`). This runbook covers the
deploy-time pieces that live **outside** the repo: DNS, TLS and the host
nginx on the production VPS. `frontend/nginx.conf` and the docker-compose
files need **no changes**.

## 1. One-time platform setup

### DNS
1. Register `chattermate.help` (or set `HELP_CENTER_BASE_DOMAIN` to another
   zone) and point it at the VPS:
   - `*.chattermate.help.  A  <VPS_IP>`
2. Create the CNAME target customers point their own domains at:
   - `cname.chattermate.chat.  A  <VPS_IP>`
   (or set `HELP_CENTER_CNAME_TARGET` accordingly)
3. Backend env (`.env` on the VPS):
   ```
   HELP_CENTER_BASE_DOMAIN=chattermate.help
   HELP_CENTER_CNAME_TARGET=cname.chattermate.chat
   HELP_CENTER_TARGET_IPS=<VPS_IP>        # accepted for CNAME-flattened records
   ```

### Wildcard certificate (DNS-01)
HTTP-01 cannot issue wildcards; use the DNS provider's certbot plugin
(example for Cloudflare — pick the matching `certbot-dns-*` package):
```bash
sudo apt install certbot python3-certbot-dns-cloudflare
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/cf.ini \
  -d '*.chattermate.help' -d 'chattermate.help'
```
Renewal is automatic via the standard certbot timer.

### Host nginx server blocks
Add to the host nginx (alongside the existing chattermate.chat block).
`proxy_set_header Host $host` is what makes backend host-dispatch work.
`<BACKEND_PORT>` is the published port of the backend container (the same
one the existing API proxy uses).

```nginx
# {slug}.chattermate.help
server {
    listen 443 ssl;
    server_name *.chattermate.help;
    ssl_certificate     /etc/letsencrypt/live/chattermate.help/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chattermate.help/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:<BACKEND_PORT>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

server {
    listen 80;
    server_name *.chattermate.help;
    return 301 https://$host$request_uri;
}
```

## 2. Per-customer custom domain (runbook step per domain)

Customers add two records (shown in their FAQ admin UI):
- `CNAME  help.customer.com  →  cname.chattermate.chat`
- `TXT    _chattermate.help.customer.com  →  cm-verify=<token>`

After they click **Verify domain** (DNS checks pass, `ssl_status` becomes
`pending`), issue the certificate on the VPS — HTTP-01 works because the
CNAME already routes to us:

```bash
sudo certbot --nginx -d help.customer.com
```

Add (or let certbot's nginx installer create) a server block identical to the
wildcard one but with `server_name help.customer.com;` and the new cert
paths. Reload nginx. The backend's SSL probe (`https://<domain>/healthz`)
flips `ssl_status` to `active` on the customer's next verify/status check.

> Cloudflare-proxied ("orange cloud") CNAMEs hide the record from DNS lookups
> and terminate TLS at Cloudflare — customers must grey-cloud (DNS-only) the
> record for verification, or the CNAME check will fail.

### Automation (later)
When manual certbot becomes a burden: a host cron that polls a token-guarded
admin endpoint for verified-but-unprovisioned domains and runs
`certbot --nginx -d <domain>` — or move edge TLS to Caddy with on-demand TLS
(`ask` endpoint). Deferred because Caddy would have to own port 443 for the
whole VPS.

## 3. Verification checklist after deploy
1. `curl -H "Host: <slug>.chattermate.help" http://127.0.0.1:<BACKEND_PORT>/healthz` → `{"status":"ok"}`
2. `https://<slug>.chattermate.help` in a browser → published FAQs render, widget loads.
3. API unaffected: `https://chattermate.chat/api/v1/...` still routes to the SPA/API.
4. `POST /ask` from the page returns an answer and appears in `help_center_queries`.

## 4. Enterprise (cloud) rollout prerequisite

The feature is gated by the `help_center` plan flag, which lives in the
**enterprise submodule** (separate repo/PR — required before cloud rollout):

- add `"help_center": True` to PRO and ENTERPRISE in
  `enterprise/models/plan.py::get_default_features` (FREE/BASE: `False`);
- backfill existing plan rows' `features` JSON with the same values;
- extend the message-limit check to add the org's period
  `help_center_queries` count (`HelpCenterQueryRepository.count_for_period`)
  to the bot-message count when the org runs on the ChatterMate-hosted model.

Until that PR deploys, cloud orgs see the upgrade lock (`plan_allowed:
false`); self-hosted/OSS installs are unrestricted immediately.

## 5. Tunables (backend env)

`HELP_CENTER_RESERVED_SLUGS` (labels never claimable as slugs — must mirror
real infra records on the base domain), `FAQ_MAX_PAGES_PER_SOURCE` (300),
`FAQ_MAX_BATCH_CHARS` (15000), `FAQ_IMPORT_MAX_PAGE_CHARS` (100000),
`FAQ_IMPORT_FETCH_TIMEOUT` (30s) — the FAQ_* caps bound LLM spend per
generation run.
