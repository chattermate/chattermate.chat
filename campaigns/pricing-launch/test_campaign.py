"""Run with: python3 -m unittest (from this folder). No network, no database."""
import json
import os
import tempfile
import time
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest import mock

import audience
import send
from catalog import load_settings
from emails import CAMPAIGNS, free_change, launch, winback

SAMPLES = Path(__file__).resolve().parent / "samples"
TODAY = date(2026, 11, 4)
UNSUB = "https://api.example.test/unsub?t=x"
USER = "11111111-2222-3333-4444-555555555555"
CFG = load_settings()
NO_OFFER = load_settings(with_offer=False)
SMTP_ENV = {"SMTP_SERVER": "smtp.test", "SMTP_PORT": "587", "SMTP_USERNAME": "u", "SMTP_PASSWORD": "p",
            "FROM_EMAIL": "assistant@chattermate.chat", "UNSUBSCRIBE_SECRET": "s"}


def launch_row(**overrides):
    return {"user_id": USER, "email": "a@shop.test", "full_name": "Priya Nair", "org_id": USER, "org_name": "Acme",
            "trial_end": "2026-11-18", "legacy_free": True, **overrides}


def winback_row(**overrides):
    return {"user_id": USER, "email": "a@shop.test", "full_name": "Dana Moore", "org_id": USER, "org_name": "Club",
            "old_plan": "Pro", "old_price": 9.99, "trial_end": "2026-12-06", "knowledge_sources": 3, **overrides}


def free_row(**overrides):
    return {"user_id": USER, "email": "a@shop.test", "full_name": "Ana Silva", "org_id": USER, "org_name": "Shop",
            "last_month_replies": 12, "has_channels": False, **overrides}


def every_variant():
    yield launch(launch_row(), CFG, UNSUB)
    yield launch(launch_row(legacy_free=False), NO_OFFER, UNSUB)
    yield winback(winback_row(), CFG, UNSUB)
    yield winback(winback_row(old_plan="Base", old_price=3.99), CFG, UNSUB)
    for replies in (0, 1, 40, 41):
        for channels in (False, True):
            yield free_change(free_row(last_month_replies=replies, has_channels=channels), CFG, UNSUB)


class CopyRules(unittest.TestCase):
    def test_no_variant_breaks_a_copy_rule(self):
        banned = ("seat", "per agent", "cheap", "budget", "arun", "whatsapp stops", "whatsapp is paused",
                  "channels stop", "last year", "stays up to date")
        for email in every_variant():
            body = f"{email.subject}\n{email.preheader}\n{email.text}".lower()
            for phrase in banned:
                self.assertNotIn(phrase, body, f"{email.variant}: {phrase}")

    def test_every_variant_is_signed_runix_and_can_unsubscribe(self):
        for email in every_variant():
            self.assertIn("Runix\nChatterMate", email.text)
            self.assertIn(UNSUB, email.html)
            self.assertIn(UNSUB, email.text)

    def test_card_shrinks_on_a_phone(self):
        self.assertIn('style="width:100%; max-width:600px;', launch(launch_row(), CFG, UNSUB).html)

    def test_recipient_text_is_escaped(self):
        email = launch(launch_row(org_name="<script>x</script>", full_name="<b>Bo</b>"), CFG, UNSUB)
        self.assertNotIn("<script>x", email.html)
        self.assertNotIn("<b>Bo", email.html)


class BaseLoader(unittest.TestCase):
    def test_base_loads_brand_without_starting_the_app(self):
        import sys
        import blocks
        with tempfile.TemporaryDirectory() as tmp:
            app = Path(tmp) / "app"
            (app / "core").mkdir(parents=True)
            (app / "enterprise/services/email_templates").mkdir(parents=True)
            (app / "__init__.py").write_text("raise RuntimeError('app started')\n")
            (app / "core/brand.py").write_text("BRAND_COLORS = {'ink': '#12150E'}\n")
            base = app / "enterprise/services/email_templates/base.py"
            base.write_text("from app.core.brand import BRAND_COLORS\nINK = BRAND_COLORS['ink']\n")
            saved = {name: sys.modules.pop(name) for name in list(sys.modules) if name.split('.')[0] == 'app'}
            try:
                with mock.patch.dict(os.environ, {"EMAIL_BASE_PY": str(base)}):
                    self.assertEqual(blocks._load_base().INK, "#12150E")
            finally:
                for name in [n for n in sys.modules if n.split('.')[0] == 'app']:
                    sys.modules.pop(name)
                sys.modules.update(saved)


class Launch(unittest.TestCase):
    def test_leads_with_the_pitch(self):
        email = launch(launch_row(), CFG, UNSUB)
        self.assertIn("Pay for what your AI answers", email.text)
        self.assertIn("Unlimited team members", email.text)
        self.assertEqual(email.subject, "Our new plans, and 14 days of Growth on us")

    def test_legacy_line_only_for_legacy_free(self):
        self.assertIn("300 AI replies", launch(launch_row(), CFG, UNSUB).text)
        email = launch(launch_row(legacy_free=False), CFG, UNSUB)
        self.assertNotIn("300", email.text)
        self.assertIn("50 AI replies", email.text)

    def test_offer_can_be_left_out(self):
        self.assertIn("TRIAL30", launch(launch_row(), CFG, UNSUB).text)
        self.assertIn("billed yearly", launch(launch_row(), CFG, UNSUB).text)
        self.assertNotIn("TRIAL30", launch(launch_row(), NO_OFFER, UNSUB).text)

    def test_entry_plan_line_follows_the_catalog(self):
        self.assertNotIn("help center", launch(launch_row(), CFG, UNSUB).text)
        plans = json.loads(json.dumps(CFG.plans))
        plans["Starter"]["features"].update(help_center=True, ai_ticketing=True)
        text = launch(launch_row(), CFG._replace(plans=plans), UNSUB).text
        self.assertIn("with live chat, help center and tickets included", text)

    def test_prices_come_from_the_catalog(self):
        plans = json.loads(json.dumps(CFG.plans))
        plans["Starter"].update(usd=6.5, inr=1500)
        cfg = CFG._replace(plans=plans)
        self.assertIn("Plans from $6.50 a month,", launch(launch_row(), cfg, UNSUB).text)
        india = launch_row(org_timezone="Asia/Kolkata")
        self.assertIn("Plans from ₹1,500 + GST a month,", launch(india, cfg, UNSUB).text)

    def test_one_currency_per_org(self):
        for zone in ("Asia/Kolkata", "Asia/Calcutta"):
            text = launch(launch_row(org_timezone=zone), CFG, UNSUB).text
            self.assertIn("₹", text)
            self.assertNotIn("$", text)
        for zone in ("UTC", "America/New_York", "Asia/Dubai", None, ""):
            text = launch(launch_row(org_timezone=zone), CFG, UNSUB).text
            self.assertIn("$", text)
            self.assertNotIn("₹", text)

    def test_hero_and_its_alt_text_use_the_orgs_currency(self):
        dollars = launch(launch_row(), CFG, UNSUB).html
        self.assertIn(CFG.hero_urls["USD"], dollars)
        self.assertNotIn(CFG.hero_urls["INR"], dollars)
        self.assertIn('alt="New plans: Free, Starter $4.99', dollars)
        rupees = launch(launch_row(org_timezone="Asia/Kolkata"), CFG, UNSUB).html
        self.assertIn(CFG.hero_urls["INR"], rupees)
        self.assertNotIn(CFG.hero_urls["USD"], rupees)
        self.assertNotIn("$", rupees)

    def test_hero_links_to_the_plans_and_stays_out_of_the_text(self):
        email = launch(launch_row(), CFG, UNSUB)
        self.assertIn(f'<a href="{CFG.plans_url}" target="_blank"><img src="{CFG.hero_urls["USD"]}"', email.html)
        self.assertNotIn(".png", email.text)

    def test_light_page_with_the_logo(self):
        for email in every_variant():
            self.assertIn(CFG.logo_url, email.html)
            self.assertIn('content="light"', email.html)
            self.assertNotIn("#07080B", email.html)

    def test_placeholder_org_reads_as_a_sentence(self):
        email = launch(launch_row(org_name="asdf", full_name="test"), CFG, UNSUB)
        self.assertIn("Your workspace is on Growth", email.text)
        self.assertIn("Hi there,", email.text)


class Winback(unittest.TestCase):
    def test_same_price(self):
        email = winback(winback_row(), CFG, UNSUB)
        self.assertEqual((email.subject, email.variant), ("Your old price is back", "same-price"))

    def test_old_price_below_growth_never_claims_it_is_back(self):
        email = winback(winback_row(old_plan="Base", old_price=3.99), CFG, UNSUB)
        self.assertEqual(email.variant, "below-growth")
        self.assertNotIn("is back", f"{email.subject} {email.text}")
        self.assertIn("Starter at $4.99", email.text)

    def test_says_knowledge_is_there_only_when_it_is(self):
        self.assertIn("still there", winback(winback_row(), CFG, UNSUB).text)
        self.assertNotIn("still there", winback(winback_row(knowledge_sources=0), CFG, UNSUB).text)


class FreeChange(unittest.TestCase):
    def test_threshold(self):
        at = free_change(free_row(last_month_replies=40), CFG, UNSUB)
        above = free_change(free_row(last_month_replies=41), CFG, UNSUB)
        self.assertEqual((at.variant, above.variant), ("fits", "upsell"))
        self.assertNotIn("Starter", at.text)
        self.assertIn("Starter is $4.99", above.text)

    def test_counts_read_naturally(self):
        self.assertIn("didn't use any", free_change(free_row(last_month_replies=0), CFG, UNSUB).text)
        self.assertIn("used 1 AI reply.", free_change(free_row(last_month_replies=1), CFG, UNSUB).text)
        self.assertIn("used 2 AI replies.", free_change(free_row(last_month_replies=2), CFG, UNSUB).text)

    def test_channel_orgs_are_pointed_at_growth(self):
        email = free_change(free_row(has_channels=True, last_month_replies=46), CFG, UNSUB)
        self.assertEqual(email.variant, "channels")
        self.assertIn("Growth is $9.99", email.text)
        self.assertIn("stay connected", email.text)
        self.assertNotIn("Starter", email.text)

    def test_says_the_inbox_keeps_working(self):
        self.assertIn("Your inbox keeps working", free_change(free_row(), CFG, UNSUB).text)


class Screening(unittest.TestCase):
    rules = audience.Exclusions({"chattermate.chat"}, {"gone@shop.test"}, ("tester+",), {"internal org"})

    def run_screen(self, rows, required=(), min_days=None):
        return audience.screen(rows, self.rules, required, TODAY, min_days)

    def test_drops_what_it_should(self):
        rows = [launch_row(email=address) for address in (
            "x@yopmail.com", "me@chattermate.chat", "gone@shop.test", "tester+1@gmail.com", "bad", "",
        )] + [launch_row(email="a@shop.test", org_name="Internal Org")]
        queue, skipped = self.run_screen(rows)
        self.assertEqual(queue, [])
        self.assertEqual(len(skipped), 7)

    def test_duplicates_differ_only_by_case(self):
        queue, skipped = self.run_screen([launch_row(email="A@Shop.test"), launch_row(email="a@shop.test")])
        self.assertEqual([row["email"] for row in queue], ["a@shop.test"])
        self.assertEqual(skipped, [("a@shop.test", "duplicate")])

    def test_needs_a_user_for_the_unsubscribe_link(self):
        _, skipped = self.run_screen([launch_row(user_id="nope")])
        self.assertIn("user_id", skipped[0][1])

    def test_missing_field_and_trial_checks(self):
        _, skipped = self.run_screen([launch_row(trial_end=None)], required=("trial_end",), min_days=1)
        self.assertIn("missing trial_end", skipped[0][1])
        _, skipped = self.run_screen([launch_row(trial_end="2026-11-04")], min_days=1)
        self.assertIn("0 days left", skipped[0][1])
        _, skipped = self.run_screen([launch_row(trial_end="soon")], min_days=1)
        self.assertIn("trial_end", skipped[0][1])

    def test_a_false_flag_is_not_a_missing_field(self):
        queue, _ = self.run_screen([free_row(last_month_replies=0, has_channels=False)],
                                   required=("last_month_replies", "has_channels"))
        self.assertEqual(len(queue), 1)

    def test_names(self):
        self.assertEqual(audience.first_name({"full_name": "priya nair"}), "Priya")
        self.assertEqual(audience.first_name({"full_name": "McKay Lee"}), "McKay")
        for junk in ("test", "", None, "me@x.io", "12345"):
            self.assertEqual(audience.first_name({"full_name": junk}), "there")
        self.assertEqual(audience.workspace({"org_name": "Test"}), "your workspace")


class Sender(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.dir = Path(folder.name)
        self.exclusions = self.dir / "exclusions.json"
        self.exclusions.write_text("{}", encoding="utf-8")
        self.recipients = self.dir / "launch.json"
        self.write_rows([launch_row(), launch_row(email="b@shop.test")])
        self.catalog = self.dir / "catalog.json"
        real = json.loads((SAMPLES / "catalog.sample.json").read_text(encoding="utf-8"))
        real.pop("sample")
        self.catalog.write_text(json.dumps(real), encoding="utf-8")
        for patcher in (mock.patch.object(send, "DATA_DIR", self.dir), mock.patch.object(send.time, "sleep")):
            patcher.start()
            self.addCleanup(patcher.stop)

    def write_rows(self, rows):
        self.recipients.write_text(json.dumps(rows), encoding="utf-8")

    def run_send(self, *extra, campaign="launch", today=TODAY, env=SMTP_ENV):
        argv = [campaign, str(self.recipients), "--exclusions", str(self.exclusions), *extra]
        with mock.patch.object(send.smtplib, "SMTP") as smtp, mock.patch("builtins.print"):
            code = send.main(argv, environ=env, today=today)
        return code, smtp

    def live(self, count=2, *extra):
        return ("--catalog", str(self.catalog), "--offer-is-live", "--send", "--confirm", f"launch:{count}", *extra)

    def test_dry_run_is_the_default_and_opens_no_connection(self):
        code, smtp = self.run_send(env={})
        self.assertEqual(code, 0)
        smtp.assert_not_called()

    def test_send_needs_the_exact_count(self):
        for confirm in ("launch:1", "winback:2"):
            code, smtp = self.run_send("--catalog", str(self.catalog), "--offer-is-live", "--send", "--confirm", confirm)
            self.assertEqual(code, 2)
            smtp.assert_not_called()

    def test_send_without_confirm_is_refused(self):
        code, smtp = self.run_send("--send")
        self.assertEqual(code, 2)
        smtp.assert_not_called()

    def test_sample_catalog_is_refused(self):
        code, smtp = self.run_send("--offer-is-live", "--send", "--confirm", "launch:2")
        self.assertEqual(code, 2)
        smtp.assert_not_called()

    def test_offer_must_be_declared_live(self):
        code, smtp = self.run_send("--catalog", str(self.catalog), "--send", "--confirm", "launch:2")
        self.assertEqual(code, 2)
        smtp.assert_not_called()
        code, smtp = self.run_send("--catalog", str(self.catalog), "--without-offer", "--send", "--confirm", "launch:2")
        self.assertEqual(code, 0)

    def test_stale_export_is_refused(self):
        old = time.time() - 25 * 3600
        os.utime(self.recipients, (old, old))
        code, smtp = self.run_send(*self.live())
        self.assertEqual(code, 2)
        smtp.assert_not_called()

    def test_free_change_waits_for_its_date(self):
        self.write_rows([free_row()])
        args = ("--catalog", str(self.catalog), "--send", "--confirm", "free_change:1")
        code, smtp = self.run_send(*args, campaign="free_change", today=date(2027, 1, 16))
        self.assertEqual(code, 2)
        smtp.assert_not_called()
        code, smtp = self.run_send(*args, campaign="free_change", today=date(2027, 1, 17))
        self.assertEqual(code, 0)

    def test_missing_secrets_stop_a_send(self):
        with self.assertRaises(SystemExit):
            self.run_send(*self.live(), env={**SMTP_ENV, "UNSUBSCRIBE_SECRET": ""})

    def test_send_logs_and_a_rerun_skips_who_got_it(self):
        code, smtp = self.run_send(*self.live())
        self.assertEqual(code, 0)
        self.assertEqual(smtp.return_value.send_message.call_count, 2)
        code, smtp = self.run_send(*self.live(0))
        self.assertEqual(code, 0)
        smtp.return_value.send_message.assert_not_called()

    def stamp_sent_today(self, count, campaign="winback"):
        stamp = f"{TODAY.isoformat()}T09:00:00+00:00"
        lines = "".join(f"x{n}@other.test\t{stamp}\n" for n in range(count))
        (self.dir / f"sent.{campaign}.log").write_text(lines, encoding="utf-8")

    def test_daily_limit_sends_part_and_the_rest_next_day(self):
        code, smtp = self.run_send(*self.live(1, "--daily-limit", "1"))
        self.assertEqual(code, 0)
        self.assertEqual(smtp.return_value.send_message.call_count, 1)
        # same day: the limit is spent
        code, smtp = self.run_send(*self.live(0, "--daily-limit", "1"))
        self.assertEqual(code, 2)
        smtp.return_value.send_message.assert_not_called()
        # next day: the one left goes, nobody twice
        code, smtp = self.run_send(*self.live(1, "--daily-limit", "1"), today=TODAY + timedelta(days=1))
        self.assertEqual(code, 0)
        self.assertEqual(smtp.return_value.send_message.call_count, 1)
        self.assertEqual(len(send.read_sent(self.dir / "sent.launch.log")), 2)

    def test_daily_limit_counts_every_campaign_sent_today(self):
        self.stamp_sent_today(99)
        code, smtp = self.run_send(*self.live(1))
        self.assertEqual(code, 0)
        self.assertEqual(smtp.return_value.send_message.call_count, 1)

    def test_confirm_is_todays_batch_not_the_whole_list(self):
        self.stamp_sent_today(99)
        code, smtp = self.run_send(*self.live(2))
        self.assertEqual(code, 2)
        smtp.assert_not_called()

    def test_yesterdays_sends_do_not_count(self):
        self.stamp_sent_today(100)
        code, smtp = self.run_send(*self.live(2), today=TODAY + timedelta(days=1))
        self.assertEqual(code, 0)
        self.assertEqual(smtp.return_value.send_message.call_count, 2)

    def test_failed_address_does_not_stop_the_batch_and_can_be_retried(self):
        with mock.patch.object(send.smtplib, "SMTP") as smtp, mock.patch("builtins.print"):
            smtp.return_value.send_message.side_effect = [send.smtplib.SMTPRecipientsRefused({}), None]
            code = send.main(["launch", str(self.recipients), "--exclusions", str(self.exclusions), *self.live()],
                             environ=SMTP_ENV, today=TODAY)
        self.assertEqual(code, 1)
        self.assertEqual(send.read_sent(self.dir / "sent.launch.log"), {"b@shop.test"})
        code, smtp = self.run_send(*self.live(1))
        self.assertEqual(smtp.return_value.send_message.call_count, 1)

    def test_dropped_connection_reconnects_once(self):
        with mock.patch.object(send.smtplib, "SMTP") as smtp, mock.patch("builtins.print"):
            smtp.return_value.send_message.side_effect = [send.smtplib.SMTPServerDisconnected(), None, None]
            code = send.main(["launch", str(self.recipients), "--exclusions", str(self.exclusions), *self.live()],
                             environ=SMTP_ENV, today=TODAY)
        self.assertEqual(code, 0)
        self.assertEqual(smtp.call_count, 2)

    def test_test_send_goes_only_to_the_test_address(self):
        code, smtp = self.run_send("--test-to", "me@chattermate.chat")
        message = smtp.return_value.send_message.call_args[0][0]
        self.assertEqual(smtp.return_value.send_message.call_count, 1)
        self.assertEqual(message["To"], "me@chattermate.chat")
        self.assertTrue(message["Subject"].startswith("[TEST] "))
        self.assertFalse((self.dir / "sent.launch.log").exists())

    def test_headers(self):
        rendered = launch(launch_row(), CFG, UNSUB)
        message = send.build_message(rendered, "a@shop.test", "assistant@chattermate.chat", UNSUB)
        self.assertIn("Runix", str(message["From"]))
        self.assertEqual(message["Reply-To"], "support@chattermate.chat")
        self.assertEqual(message["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click")
        self.assertIn(UNSUB, message["List-Unsubscribe"])
        self.assertEqual({part.get_content_type() for part in message.iter_parts()}, {"text/plain", "text/html"})

    def test_unsubscribe_link_matches_the_backend(self):
        # Made by app.enterprise.services.unsubscribe with UNSUBSCRIBE_SECRET=test-secret.
        self.assertEqual(
            send.unsubscribe_url(USER, "test-secret", "https://api.chattermate.chat/"),
            "https://api.chattermate.chat/api/v1/enterprise/email/unsubscribe"
            "?t=11111111222233334444555555555555.op0DeA2Fe3dEdEpvbr8YUA",
        )

    def test_samples_cover_every_campaign(self):
        for name in CAMPAIGNS:
            self.assertTrue((SAMPLES / f"{name}.sample.json").exists())


if __name__ == "__main__":
    unittest.main()
