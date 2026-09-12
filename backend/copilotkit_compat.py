"""Compatibility fixes for CopilotKit frontend tools on OpenAI Responses."""

from typing import Any

from copilotkit import CopilotKitMiddleware
from langchain_core.messages import AIMessage


class ResponsesSafeCopilotKitMiddleware(CopilotKitMiddleware):
    """Remove Responses API call blocks that no longer have a tool call."""

    @staticmethod
    def _fix_messages_for_bedrock(messages: list[Any]) -> list[Any]:
        CopilotKitMiddleware._fix_messages_for_bedrock(messages)

        for message in messages:
            if not isinstance(message, AIMessage) or not isinstance(message.content, list):
                continue

            retained_call_ids = {
                tool_call.get("id")
                for tool_call in message.tool_calls or []
                if isinstance(tool_call, dict) and tool_call.get("id")
            }
            message.content = [
                block
                for block in message.content
                if not (
                    isinstance(block, dict)
                    and block.get("type") == "function_call"
                    and block.get("call_id") not in retained_call_ids
                )
            ]

        return messages
