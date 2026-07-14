# Help Center hosting — infrastructure runbook

The public help center is served by the backend itself (host-dispatched SSR —
see `backend/app/core/help_center_host.py`). This runbook covers the
deploy-time pieces that live **outside** the repo: DNS, TLS and the host
nginx on the production VPS. `frontend/nginx.conf` and the docker-compose
files need **no changes**.

> **As deployed on the ChatterMate cloud VPS (2026-07-14):** the base domain is
> **`help.chattermate.chat`** (orgs serve at `{slug}.help.chattermate.chat`), not
> the `chattermate.help` this doc originally planned — that domain was never
> registered, and the org only owns `chattermate.chat`. DNS is **Route53**, so the
> wildcard cert is issued and auto-renewed with the `dns-route53` plugin.
> Placeholders (`<VPS_IPV4>`, `<ZONE_ID>`, …) stand in for the live values; the
> real ones live on the VPS and in ops notes, not in this public repo.

## 1. One-time platform setup

### DNS (Route53)
Point a wildcard under the domain you own at the VPS. On the cloud box this is
the `chattermate.chat` hosted zone (`<ZONE_ID>`):
- `*.help.chattermate.chat.  A     <VPS_IPV4>`
- `*.help.chattermate.chat.  AAAA  <VPS_IPV6>`

One wildcard record covers every org — no per-org DNS. Create them via the API:
```bash
aws route53 change-resource-record-sets --hosted-zone-id <ZONE_ID> \
  --change-batch file://wildcard.json   # UPSERT A + AAAA for *.help.<domain>
```

Backend env (`backend.env` on the VPS):
```
HELP_CENTER_BASE_DOMAIN=help.chattermate.chat
HELP_CENTER_TARGET_IPS=["<VPS_IPV4>"]   # JSON array — see gotcha below
```
> **Gotcha:** `HELP_CENTER_TARGET_IPS` is a `frozenset` setting, so
> pydantic-settings JSON-parses the env value. A bare IP or comma list
> (`<VPS_IPV4>`) fails validation and crash-loops the backend at startup —
> it **must** be a JSON array: `["<VPS_IPV4>"]`. (Powers the per-org
> custom-domain A-record verification in §2; unused by the wildcard site.)

### Wildcard certificate (DNS-01 via Route53)
HTTP-01 cannot issue wildcards. A dedicated IAM user with the standard certbot
Route53 policy (`route53:ListHostedZones` + `GetChange` on `*`,
`ChangeResourceRecordSets` on the zone) has its creds at `~/.aws/credentials`
(mode 600) on the box. Issue once:
```bash
docker run --rm \
  -v ~/chattermate/certbot/conf:/etc/letsencrypt \
  -v ~/.aws:/root/.aws:ro \
  certbot/dns-route53 certonly --dns-route53 \
  -d '*.help.chattermate.chat' -d 'help.chattermate.chat' \
  --cert-name help.chattermate.chat \
  --non-interactive --agree-tos -m <ops-email>
```

**Auto-renewal:** the compose `certbot` service (in
`docker-compose.hostinger.yml`) runs `certbot renew` on a loop. It uses the
`certbot/dns-route53` image and mounts `/home/chattermate/.aws:/root/.aws:ro`,
so the wildcard renews unattended (the renewal conf remembers
`authenticator = dns-route53`). Existing HTTP-01 webroot certs still renew —
the dns-route53 image is a superset of `certbot/certbot`.

### Host nginx server block
Lives at `~/chattermate/nginx/conf.d/help-center.conf` (mounted read-only into
the `chattermate-nginx-1` container). `proxy_set_header Host $host` is what
makes backend host-dispatch resolve the org. Upstream is the compose service
name `backend:8000` (nginx shares the `chattermate-network`), not a published
host port.

```nginx
# {slug}.help.chattermate.chat
server {
    listen 443 ssl http2;
    server_name *.help.chattermate.chat help.chattermate.chat;
    ssl_certificate     /etc/letsencrypt/live/help.chattermate.chat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/help.chattermate.chat/privkey.pem;
    include /etc/nginx/conf.d/ssl-params.conf;

    location / {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name *.help.chattermate.chat help.chattermate.chat;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}
```

## 2. Per-customer custom domain (runbook step per domain)

Customers add two records (shown in their FAQ admin UI). On the cloud box the
CNAME target `cname.chattermate.chat` is **not** provisioned, so verification
falls back to an A record pointing at `HELP_CENTER_TARGET_IPS` — either form
works:
- `CNAME  help.customer.com  →  cname.chattermate.chat`  *(or)*  `A  help.customer.com  →  <VPS_IPV4>`
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
1. `curl -sS -o /dev/null -w '%{http_code}\n' https://<slug>.help.chattermate.chat/` → `200` (and `http://` → `301`).
2. `https://<slug>.help.chattermate.chat` in a browser → published FAQs render, widget loads; an article at `/a/<faq-slug>` returns `200`.
3. `docker exec chattermate-backend-1 printenv HELP_CENTER_BASE_DOMAIN` → `help.chattermate.chat` (and the backend is `healthy`, not crash-looping on `HELP_CENTER_TARGET_IPS`).
4. API unaffected: `https://app.chattermate.chat` / `https://api.chattermate.chat/api/v1/...` still route normally.
5. `POST /ask` from the page returns an answer and appears in `help_center_queries`.

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
