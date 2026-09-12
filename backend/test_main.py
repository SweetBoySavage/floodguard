import unittest

from main import model


class ModelConfigurationTests(unittest.TestCase):
    def test_tool_calling_uses_responses_api(self) -> None:
        self.assertIs(model.use_responses_api, True)


if __name__ == "__main__":
    unittest.main()
