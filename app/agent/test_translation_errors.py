import unittest
import httpx

from translation_errors import translation_error_detail


class TranslationErrorsTest(unittest.TestCase):
    def test_status_errors_identify_the_configuration_to_check(self):
        for status, expected in [(401, "OLLAMA_BASE_URL"), (404, "OLLAMA_BASE_URL"),
                                 (429, "quá tải"), (503, "Máy chủ")]:
            with self.subTest(status=status):
                error = Exception("secret-provider-response")
                error.status_code = status
                detail = translation_error_detail(error)
                self.assertIn(str(status), detail)
                self.assertIn(expected, detail)
                self.assertNotIn("secret-provider-response", detail)

    def test_network_errors_do_not_expose_url_or_credentials(self):
        error_type = httpx.ConnectError
        detail = translation_error_detail(error_type("https://private-host?token=secret"))
        self.assertIn("OLLAMA_BASE_URL", detail)
        self.assertNotIn("private-host", detail)
        self.assertNotIn("secret", detail)

    def test_unknown_errors_are_safe(self):
        self.assertNotIn("secret", translation_error_detail(Exception("secret")))


if __name__ == "__main__":
    unittest.main()
