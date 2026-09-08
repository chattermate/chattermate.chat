"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

# Runtime patches for the pinned agno==1.7.6. Remove this module with the
# agno 2.x upgrade.
#
# agno 1.7.6 does not terminate a run when tool_call_limit is exceeded: it
# appends a tool-result message asking the model not to call the tool again
# and sends the conversation back to the model. Models that ignore the
# instruction (observed with gpt-4o-mini) then loop forever, re-sending an
# ever-growing payload on every iteration (issue #269).
#
# The first fix set stop_after_tool_call=True on the limit-error message, which
# breaks the response loop in agno.models.base. That ended the loop, but it ended
# it AT THE TOOL RESULT — before the model ever wrote an answer — so every run
# that reached the limit returned an empty turn and the visitor got the
# "I didn't quite catch that" fallback. In production that was most turns on any
# agent with a few knowledge sources.
#
# What we actually want is a bounded run that still answers: at the limit, stop
# offering tools and let the model reply from what it already retrieved. Clearing
# `tools` for the next completion does exactly that, and it also makes the runaway
# loop impossible — a model with no tools cannot call one.
#
# There is deliberately NO hard-stop backstop. An earlier version kept one for the
# case where withdrawal somehow failed, and it turned out to be the only remaining
# producer of empty replies: it fired occasionally and cost the visitor an answer
# every time. The hang it guarded against is already prevented by the
# AGENT_RUN_TIMEOUT wrapper around every agno run, which does not depend on this
# module patching the right entry points. Two locks on one door, and this was the
# lock that slammed on the user.

from agno.models.base import Model

from app.core.logger import get_logger
from app.utils.agno_eval_guard import install_eval_guard

logger = get_logger(__name__)

_PATCHED_FLAG = "_chattermate_answers_at_limit"

# Set on the Model instance once this run has spent its tool budget. Safe as
# instance state: create_model() builds a fresh Model per ChatAgent and ChatAgent
# is built per request, so it never outlives a single run.
#
# A model can request SEVERAL tools in one assistant message and agno walks that
# whole batch before calling the model again, so this is hit repeatedly within a
# single round. That is fine — setting it twice is a no-op. It mattered only while
# there was a backstop that had to tell a parallel sibling apart from a genuine
# repeat; without one, a plain flag is enough.
_EXHAUSTED = "_chattermate_tools_exhausted"

# Groq's structured output arrives as a tool call of this name rather than as
# text. Kept in step with app.agents.structured_output.build_groq_json_tool.
CAPTURE_TOOL_NAME = "json"

# Replaces agno's own limit-error text, which only tells the model it may not
# call the tool again. Left at that, gpt-4o-mini narrated the plumbing to the
# visitor ("I wasn't able to retrieve ... due to tool limitation") and then
# answered from general knowledge — which also contradicts the grounding rule the
# guardrail relies on. Say what to do instead: answer from what is already here,
# and if that is not enough, admit it rather than invent.
_LIMIT_INSTRUCTION = (
    "You have used all the tool calls available for this turn. Answer now, using "
    "only what the tools have already returned and what your instructions cover. "
    "Do not mention tools, searches, limits or any internal constraint — the "
    "visitor must not read about the plumbing. If what you have is not enough to "
    "answer properly, say plainly that you don't have that detail and offer to "
    "connect them with the team. Never fill the gap with general knowledge."
)


def _tool_name(tool) -> str:
    """Name out of a provider-format tool definition, whatever the nesting."""
    if not isinstance(tool, dict):
        return ""
    fn = tool.get("function")
    if isinstance(fn, dict):
        return fn.get("name") or ""
    return tool.get("name") or ""


def _strip_tools(self, kwargs: dict) -> dict:
    """Withdraw the action tools once the budget is spent — but never the tool
    the model answers THROUGH.

    On Groq the structured response is not text: it is a tool call named `json`
    whose arguments are the response fields (see app.agents.structured_output).
    Withdrawing every tool would take away the only way that model has to reply,
    so a Groq agent hitting the limit would return an empty turn every time —
    precisely the failure this patch exists to remove.
    """
    tools = kwargs.get("tools")
    if not getattr(self, _EXHAUSTED, False) or not tools:
        return kwargs

    kept = [t for t in tools if _tool_name(t) == CAPTURE_TOOL_NAME]
    if kept:
        # Leave tool_choice alone: the capture tool is how the answer is emitted,
        # so the model must still be allowed — or required — to call it.
        return {**kwargs, "tools": kept}
    return {**kwargs, "tools": None, "tool_choice": None}


def apply_agno_patches() -> None:
    """Apply all agno runtime patches. Safe to call more than once."""
    # Idempotent on its own, so it sits before the flag check: the guard must be
    # in place whichever call reaches here first.
    install_eval_guard()

    if getattr(Model.create_tool_call_limit_error_result, _PATCHED_FLAG, False):
        return

    original_limit_result = Model.create_tool_call_limit_error_result
    original_process = Model._process_model_response
    original_aprocess = Model._aprocess_model_response
    # Streaming is a separate pair of entry points that never touch the two
    # above. Patching only the non-streaming ones left the live chat — which
    # streams — with its tools intact after the limit, so the next round called a
    # tool again and hit the backstop. Verified against a real agent.
    original_stream = Model.process_response_stream
    original_astream = Model.aprocess_response_stream

    def create_tool_call_limit_error_result(self, function_call):
        message = original_limit_result(self, function_call)

        # Every over-budget call in the batch gets the instruction, not just the
        # first: the model reads all of the tool results, and leaving agno's
        # "tool call limit reached" text on the siblings was enough for it to keep
        # narrating the limit to the visitor.
        message.content = _LIMIT_INSTRUCTION

        if not getattr(self, _EXHAUSTED, False):
            setattr(self, _EXHAUSTED, True)
            logger.warning(
                "Tool call limit reached; answering without further tools "
                f"(tool={function_call.function.name})"
            )
        return message

    def _process_model_response(self, *args, **kwargs):
        return original_process(self, *args, **_strip_tools(self, kwargs))

    async def _aprocess_model_response(self, *args, **kwargs):
        return await original_aprocess(self, *args, **_strip_tools(self, kwargs))

    def process_response_stream(self, *args, **kwargs):
        yield from original_stream(self, *args, **_strip_tools(self, kwargs))

    async def aprocess_response_stream(self, *args, **kwargs):
        async for chunk in original_astream(self, *args, **_strip_tools(self, kwargs)):
            yield chunk

    setattr(create_tool_call_limit_error_result, _PATCHED_FLAG, True)
    Model.create_tool_call_limit_error_result = create_tool_call_limit_error_result
    Model._process_model_response = _process_model_response
    Model._aprocess_model_response = _aprocess_model_response
    Model.process_response_stream = process_response_stream
    Model.aprocess_response_stream = aprocess_response_stream
