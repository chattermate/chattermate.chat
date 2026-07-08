"""
Standalone lead-capture prompt test.

Purpose: isolate whether the *prompt* makes the model actually ask for the
visitor's contact details (and set request_lead_capture), independent of all the
widget/socket/DB plumbing. It hits the real OpenAI model (gpt-4o-mini) using the
exact production stack — agno Agent + ChatResponse structured output — with a
HARDCODED system prompt and a scripted conversation.

Run:  python scripts/test_lead_capture_prompt.py
      (uses the active org's decrypted OpenAI key from the DB by default;
       or set OPENAI_API_KEY to override.)
"""
import os
import sys
import asyncio

# Make `app` importable when run from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agno.agent import Agent
from app.utils.agno_utils import create_model
from app.models.schemas.chat import ChatResponse

MODEL_NAME = "gpt-4o-mini"
# Org that owns the "Lead generation" agent — used to fetch a real decrypted key.
DEFAULT_ORG_ID = "12da4eb2-b351-4669-8cc8-ef9c83a23998"

# --- HARDCODED SYSTEM PROMPT -------------------------------------------------
# This mirrors what ChatAgent.__init__ assembles for a lead-capture agent with
# transfer disabled, ask_for_rating=off, lead capture enabled + consent required,
# lead NOT yet captured (lead_pending = True). Edit this block to experiment with
# wording — that's the whole point of this test.
SYSTEM_PROMPT = """Be concise, friendly, and empathetic. Answer questions using the knowledge base. Escalate billing or account issues to a human agent.

You have access to the knowledge search tool. Only use the tool if required, dont use it for general greeting. Dont hallucinate information.

Keep your responses concise and focused. Provide clear, actionable information in 2-4 sentences unless a detailed explanation is specifically requested. Avoid unnecessary elaboration.

Transfer to human is disabled for this agent. You should not transfer the conversation to a human.

LEAD CAPTURE (IMPORTANT): This is a lead-generation agent — collecting the visitor's contact details is a primary goal. Help and deliver value first, then PROACTIVELY ask for their details at a natural moment (a great time is right after you have answered their question or given them something useful). Ask conversationally, one detail at a time — never on the very first message, never mid-answer. Collect these details, asking naturally one at a time. REQUIRED: email. ALSO TRY TO COLLECT (optional — they enrich the lead; genuinely ask for each one, but do not insist if the visitor skips or declines): name, company, phone. Ask for these optional details EARLY, while collecting — do not skip straight to recording after only getting the email. Ask for each optional field AT MOST ONCE. As you learn each standard detail, set the matching response field: email in lead_email, name in lead_name, company in lead_company, phone in lead_phone. Only fill a field with what the visitor ACTUALLY told you — never guess or infer a value (e.g. do not use the company as the name); leave a field empty if they did not give it. EMAIL VALIDATION: a valid email must contain an '@' and a domain with a dot (e.g. jane@acme.com). If what the visitor gives is NOT a valid email (e.g. 'arun.com', a bare domain, or just a name), do NOT accept it, do NOT set lead_email, and do NOT claim you recorded it — politely point out it looks incomplete and ask again for a full email address. ORDER: ask for the email and the other details first, and ask for consent LAST. CONSENT REQUIRED: before recording you MUST get the visitor's explicit agreement to be contacted (a clear yes). If the visitor clearly agrees to be contacted (e.g. 'yes', 'yes you can contact me', 'sure, go ahead'), treat that as consent immediately — set lead_consent=true and do NOT ask for consent again. RECORD NOW — the MOMENT you have a valid email (in lead_email) AND consent, you MUST in that SAME response (1) make sure lead_email holds the exact email the visitor gave, (2) set request_lead_capture to true, (3) set lead_consent to true, and (4) write a short lead_summary qualifying this lead. Do this even if OPTIONAL fields are still missing — NEVER keep asking for an optional field once you have a valid email AND consent, and never ask for the same field twice. Required fields above DO gate recording: keep asking for a required field until you have it (or the visitor clearly refuses). CRITICAL: request_lead_capture=true is INVALID unless lead_email is set. Confirm back what you captured (e.g. 'Great — I'll have someone reach out at jane@acme.com'). Make ONE genuine attempt overall; if they decline to share details, respect it and keep helping.

END CHAT (lead-capture pending): You have NOT yet collected this visitor's contact details, so do NOT set end_chat=true yet — not even if the conversation seems to be wrapping up or the visitor says "thank you", "thanks", "bye", or "that's all". If the visitor is wrapping up and you have not asked yet, reply by asking for their contact details now (see LEAD CAPTURE above) instead of ending. You may set end_chat=true ONLY after you have recorded their details (request_lead_capture=true) OR they have clearly declined to share them. When you do end, also generate a closing message in the message field, e.g: Thank you for your time. Have a great day!"""

# --- SCRIPTED CONVERSATIONS --------------------------------------------------
# Each scenario is a list of visitor turns. After each turn we print the model's
# structured output and flag whether it asked for the lead / captured it.
SCENARIOS = {
    "buying-then-thanks": [
        "Hi",
        "I am looking to buy the product",
        "thank you i will make the purchase",
    ],
    "gives-details": [
        "Hi",
        "I want a demo of your product",
        "sure, my email is jane@acme.com, I'm from Acme",
        "yes you can contact me",
    ],
    # Visitor gives ONLY the email — the agent should then ask for the optional
    # details (name/company/phone) before recording, not skip straight to it.
    "email-only": [
        "Hi",
        "I want a demo",
        "my email is bob@corp.com",
        "Bob, from Corp Inc",
        "yes, you can contact me",
    ],
    "declines": [
        "Hi",
        "how much does it cost?",
        "no thanks, I'd rather not share my details",
        "bye",
    ],
    # Visitor gives an INVALID email first — the agent must reject it and re-ask,
    # not claim it recorded 'arun.com'. Then a valid one is accepted.
    "invalid-email": [
        "Hi",
        "I want pricing info",
        "arun.com",
        "ok, arun@example.com",
        "yes you can contact me",
    ],
}


def _asks_for_contact(msg: str) -> bool:
    m = (msg or "").lower()
    keywords = ["email", "e-mail", "phone", "contact", "reach you", "get in touch",
                "your name", "company", "follow up", "follow-up", "details"]
    return any(k in m for k in keywords)


def get_model_config():
    """Return (model_type, api_key, model_name). Prefers OPENAI_API_KEY env,
    else the active AI config for the lead-gen org (real decrypted key)."""
    env_key = os.environ.get("OPENAI_API_KEY")
    if env_key:
        print("Using OPENAI_API_KEY from environment.\n")
        return "OPENAI", env_key, MODEL_NAME
    from app.database import SessionLocal
    from app.repositories.ai_config import AIConfigRepository
    from app.core.security import decrypt_api_key
    org_id = os.environ.get("ORG_ID", DEFAULT_ORG_ID)
    with SessionLocal() as db:
        cfg = AIConfigRepository(db).get_active_config(org_id)
        if not cfg:
            raise SystemExit(f"No active AI config for org {org_id}; set OPENAI_API_KEY.")
        print(f"Using decrypted key from org {org_id} "
              f"(model_type={cfg.model_type}, model={cfg.model_name}).\n")
        return cfg.model_type, decrypt_api_key(cfg.encrypted_api_key), cfg.model_name


def build_agent(model_type: str, api_key: str, model_name: str) -> Agent:
    # Same construction shape as production: create_model() (agno OpenAIChat for
    # OPENAI/CHATTERMATE) + ChatResponse response_model + structured outputs. No
    # tools/knowledge here — we're testing the conversational lead-ask behaviour.
    return Agent(
        model=create_model(model_type, api_key, model_name, max_tokens=1000),
        description=SYSTEM_PROMPT,
        response_model=ChatResponse,
        structured_outputs=True,
        add_history_to_messages=True,
        num_history_responses=10,
    )


async def run_scenario(name: str, turns: list, model_cfg: tuple):
    print("=" * 90)
    print(f"SCENARIO: {name}")
    print("=" * 90)
    agent = build_agent(*model_cfg)  # fresh agent = fresh conversation history
    asked = False
    captured = False
    for turn in turns:
        print(f"\n  VISITOR: {turn}")
        run = await agent.arun(turn)
        r: ChatResponse = run.content
        flag = _asks_for_contact(r.message)
        asked = asked or flag
        # A capture is only real if the model both flags it AND provides the email.
        if r.request_lead_capture and r.lead_email:
            captured = True
        print(f"  BOT    : {r.message}")
        print(f"    request_lead_capture={r.request_lead_capture} "
              f"lead_consent={r.lead_consent} end_chat={r.end_chat}")
        print(f"    lead_email={r.lead_email!r} lead_name={r.lead_name!r} "
              f"lead_company={r.lead_company!r} lead_phone={r.lead_phone!r}")
        print(f"    lead_summary={r.lead_summary}")
        print(f"    [asks-for-contact this turn: {flag}]")
    print(f"\n  RESULT → asked_for_lead={asked}  recorded_lead_with_email={captured}")
    return asked, captured


async def main():
    model_cfg = get_model_config()
    only = sys.argv[1] if len(sys.argv) > 1 else None
    results = {}
    for name, turns in SCENARIOS.items():
        if only and name != only:
            continue
        results[name] = await run_scenario(name, turns, model_cfg)
    print("\n" + "=" * 90)
    print("SUMMARY")
    print("=" * 90)
    for name, (asked, captured) in results.items():
        print(f"  {name:24s}  asked={asked!s:5s}  recorded={captured}")


if __name__ == "__main__":
    asyncio.run(main())
