import unittest

from langchain_core.messages import AIMessage, ToolMessage

from copilotkit_compat import ResponsesSafeCopilotKitMiddleware
from main import model


class ModelConfigurationTests(unittest.TestCase):
    def test_tool_calling_uses_responses_api(self) -> None:
        self.assertIs(model.use_responses_api, True)


class ResponsesSafeCopilotKitMiddlewareTests(unittest.TestCase):
    def test_removes_an_unanswered_responses_function_call_block(self) -> None:
        messages = [
            AIMessage(
                content=[
                    {"type": "reasoning", "summary": []},
                    {
                        "type": "function_call",
                        "call_id": "call_frontend",
                        "name": "focus_map",
                        "arguments": "{}",
                    },
                ],
                tool_calls=[
                    {
                        "name": "focus_map",
                        "args": {},
                        "id": "call_frontend",
                        "type": "tool_call",
                    }
                ],
            )
        ]

        ResponsesSafeCopilotKitMiddleware._fix_messages_for_bedrock(messages)

        self.assertEqual(messages[0].tool_calls, [])
        self.assertEqual(messages[0].content, [{"type": "reasoning", "summary": []}])

    def test_preserves_a_responses_function_call_block_with_an_answer(self) -> None:
        function_call = {
            "type": "function_call",
            "call_id": "call_backend",
            "name": "get_elevation",
            "arguments": "{}",
        }
        messages = [
            AIMessage(
                content=[function_call],
                tool_calls=[
                    {
                        "name": "get_elevation",
                        "args": {},
                        "id": "call_backend",
                        "type": "tool_call",
                    }
                ],
            ),
            ToolMessage(content="1 metre", tool_call_id="call_backend"),
        ]

        ResponsesSafeCopilotKitMiddleware._fix_messages_for_bedrock(messages)

        self.assertEqual(messages[0].tool_calls[0]["id"], "call_backend")
        self.assertEqual(messages[0].content, [function_call])


if __name__ == "__main__":
    unittest.main()
