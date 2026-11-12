import json
import os
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient
from ollama import ResponseError

from translat_bot import app, get_translation_model


class OllamaTranslationTest(unittest.TestCase):
    def test_poi_descriptions_are_translated_without_place_metadata(self):
        calls = []
        descriptions = {
            "en": {"short": "Hello, is there anything here?", "detail": "No, brother."},
            "zh": {"short": "喂，这里有什么吗？", "detail": "没有，哥。"},
        }
        fields = {"name": {"en": "Restroom", "zh": "洗手间"},
                  "zone": {"en": "Zone A", "zh": "A区"}}

        def respond(request):
            body = json.loads(request.content)
            source = json.loads(body["messages"][-1]["content"])
            calls.append(source)
            self.assertIsInstance(body["format"], dict)
            if len(calls) == 1:
                self.assertEqual(source, {"short": "alo có cái gì ở đây không ?", "detail": "không anh ơi"})
                result = descriptions
            else:
                self.assertEqual(source, {"name": "Nhà vệ sinh", "zone": "Khu A"})
                result = fields
            return httpx.Response(200, json={"model": "test", "done": True,
                "message": {"role": "assistant", "content": json.dumps(result)}})

        with patch.dict(os.environ, {}, clear=True):
            model = get_translation_model()
        model._client._client = httpx.Client(
            base_url="http://localhost:11434", transport=httpx.MockTransport(respond)
        )
        with patch("translat_bot.get_translation_model", return_value=model):
            response = TestClient(app).post("/translate-poi", json={
                "poi": {"name": "Nhà vệ sinh", "zone": "Khu A", "category": "restroom", "status": "active"},
                "descriptionsVi": {"short": "alo có cái gì ở đây không ?", "detail": "không anh ơi"},
            })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(calls), 2)
        self.assertEqual(response.json(), {"translations": {"poi": fields, **descriptions}})

    def test_configuration_does_not_require_openai_credentials(self):
        with patch.dict(os.environ, {
            "OLLAMA_MODEL": "llama3.2:3b",
            "OLLAMA_BASE_URL": "http://localhost:11434",
        }, clear=True):
            model = get_translation_model()
        self.assertEqual(model.model, "llama3.2:3b")
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
