# Pricing launch emails

Drafts of the three customer emails for the message-based pricing launch. **Nothing here sends on its own, and every send needs Arun's approval.**

| Email | Goes to | When |
|---|---|---|
| `launch` | Everyone in an org with a live trial, minus former payers and exclusions | Launch day, after the website is live |
| `winback` | First user of each org with a cancelled paid PayPal plan | Launch + 2 days |
| `free_change` | Everyone in an org still on `Free (legacy)` | 17 Jan 2027. The sender refuses earlier dates |

## Files

- `emails.py`: the copy. `blocks.py`: layout, on top of enterprise's `email_templates/base.py`.
- `catalog.py`: every price and limit comes from the catalog, none from the copy. `campaign.json`: dates, the offer and links.
- `audience.py`: screening. `send.py`: the sender. `export/*.sql`: recipient and catalog exports.
- `previews/`: every variant, with fictional people. Open `previews/index.html`.
- `data/`: real people, send logs and exclusions. Git ignores it, because this repo is public.

```bash
python3 render_previews.py
```

```bash
python3 -m unittest
```

## Sending

Run on the prod host with plain `python3`, never inside a container. The scripts use only the standard library.

1. Copy this folder to the host. Set `EMAIL_BASE_PY` to the deployed `backend/app/enterprise/services/email_templates/base.py`.
2. Create `data/exclusions.json` from `samples/exclusions.sample.json`. Add internal orgs, test accounts and anyone who asked support to unsubscribe.
3. Export. Run each of `catalog`, `launch`, `winback` and `free_change` as needed. An export over 24 hours old is refused, so recent unsubscribes count.

   ```bash
   docker exec -i chattermate-db-1 psql -U postgres -d chattermate -At < export/launch.sql > data/launch.json
   ```

4. Dry run, and read the list. It prints every recipient, every skip, and the exact `--confirm` value.

   ```bash
   python3 send.py launch data/launch.json --catalog data/catalog.json
   ```

5. Send one to yourself. This needs the SMTP env listed in `send.py`.

   ```bash
   python3 send.py launch data/launch.json --catalog data/catalog.json --offer-is-live --test-to admin@chattermate.chat
   ```

6. With Arun's go-ahead, send under `nohup`:

   ```bash
   nohup python3 send.py launch data/launch.json --catalog data/catalog.json --offer-is-live --send --confirm launch:212 > data/launch.out 2>&1 &
   ```

**Daily limit.** Brevo allows 300 emails a day across everything we send, app email included. Campaigns share 100 of those (`--daily-limit`, default 100), counted from every `data/sent.*.log` for today (UTC). A list longer than that goes out over several days: export again and run the same command each day. The dry run prints today's batch and the `--confirm` value for it.

`data/sent.<campaign>.log` is written after each send. Running again skips those addresses, and the dry run's count drops to match.

## Check before each send

**Launch**
- The comps script and launch trials script have run, and the website's pricing page is live.
- Former payers are not in the list. If TRIAL30 isn't working at live checkout, use `--without-offer`.

**Win-back**
- The launch trials script gives these orgs 14 days too. Set their trial to 30 days by hand first: the sender skips anyone with under 28 days left.
- `old_price` comes from `unit_price`. Check it against what they really paid. An old price below Growth gets the other subject and body automatically.
- The line about their setup still being there only appears when `knowledge_sources` is above 0.

**Free change**
- `free_change.sql` counts the previous calendar month, so export on the send date.

Unsubscribe links use the same `lifecycle` flag as setup emails, and the exports leave those users out. The page says "Unsubscribe from setup emails".
