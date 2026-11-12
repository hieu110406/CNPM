import os
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient
from ollama import ResponseError

from translat_bot import app, get_translation_model


class OllamaTranslationTest(unittest.TestCase):
    def test_configuration_does_not_require_openai_credentials(self):
        with patch.dict(os.environ, {
            "OLLAMA_MODEL": "qwen2.5:1.5b",
            "OLLAMA_BASE_URL": "http://localhost:11434",
        }, clear=True):
            model = get_translation_model()
        self.assertEqual(model.model, "qwen2.5:1.5b")
        self.assertEqual(model.format, "json")

    def test_script_translation_uses_native_ollama_and_preserves_api_shape(self):
        def respond(request):
            self.assertEqual(request.url.path, "/api/chat")
            return httpx.Response(200, json={
                "model": "test", "done": True,
                "message": {"role": "assistant", "content": '{"en":"Hello","zh":"你好"}'},
            })

        with patch.dict(os.environ, {}, clear=True):
            model = get_translation_model()
        model._client._client = httpx.Client(
            base_url="http://localhost:11434", transport=httpx.MockTransport(respond)
        )
        with patch("translat_bot.get_translation_model", return_value=model):
            response = TestClient(app).post("/translate-script", json={"script": "Xin chào"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"translations": {"en": "Hello", "zh": "你好"}})

    def test_missing_model_returns_safe_gateway_error(self):
        with patch("translat_bot.get_translation_model", side_effect=ResponseError("secret", 404)):
            response = TestClient(app).post("/translate-script", json={"script": "Xin chào"})
        self.assertEqual(response.status_code, 502)
        self.assertIn("OLLAMA_MODEL", response.json()["detail"])
        self.assertNotIn("secret", response.text)
