import json
import logging
import os
from pathlib import Path
from typing import Literal, TypeVar

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from openai import OpenAIError
from pydantic import BaseModel, Field, ValidationError, field_validator

load_dotenv(Path(__file__).with_name(".env"))

logger = logging.getLogger(__name__)
app = FastAPI(title="POI Translation Agent")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("AGENT_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class PoiDescriptions(BaseModel):
    short: str = Field(min_length=1, max_length=180)
    detail: str = Field(min_length=1)

    @field_validator("short", "detail", mode="before")
    @classmethod
    def reject_blank_descriptions(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Mô tả không được để trống")
        return value.strip()


class PoiFields(BaseModel):
    name: str = Field(min_length=1)
    zone: str = Field(min_length=1)
    category: str = Field(min_length=1)
    status: str = Field(min_length=1)

    @field_validator("name", "zone", "category", "status", mode="before")
    @classmethod
    def reject_blank_context(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Giá trị không được để trống")
        return value.strip()


class PoiTranslationRequest(BaseModel):
    poi: PoiFields
    descriptionsVi: PoiDescriptions


class LanguageTranslation(BaseModel):
    short: str = Field(min_length=1)
    detail: str = Field(min_length=1)

    @field_validator("short", "detail", mode="before")
    @classmethod
    def reject_blank_translation(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Bản dịch không được để trống")
        return value.strip()


class LocalizedPoiField(BaseModel):
    en: str = Field(min_length=1)
    zh: str = Field(min_length=1)

    @field_validator("en", "zh", mode="before")
    @classmethod
    def reject_blank_translation(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Bản dịch không được để trống")
        return value.strip()


class TranslatedPoiFields(BaseModel):
    name: LocalizedPoiField
    zone: LocalizedPoiField


class PoiTranslationResponse(BaseModel):
    poi: TranslatedPoiFields
    en: LanguageTranslation
    zh: LanguageTranslation


class ScriptTranslationRequest(BaseModel):
    script: str = Field(min_length=1, max_length=5000)

    @field_validator("script", mode="before")
    @classmethod
    def reject_blank_script(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Kịch bản không được để trống")
        return value.strip()


class ScriptTranslations(BaseModel):
    en: str = Field(min_length=1)
    zh: str = Field(min_length=1)

    @field_validator("en", "zh", mode="before")
    @classmethod
    def reject_blank_translation(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Bản dịch không được để trống")
        return value.strip()


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    language: Literal["vi", "en", "zh"]

    @field_validator("text", mode="before")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Kịch bản không được để trống")
        return value.strip()


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


def get_translation_model() -> ChatOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")
    model_name = os.getenv("OPENAI_MODEL")
    if not api_key or not base_url or not model_name:
        raise HTTPException(
            status_code=503,
            detail="Thiếu cấu hình model dịch OPENAI_API_KEY, OPENAI_BASE_URL hoặc OPENAI_MODEL.",
        )
    return ChatOpenAI(
        model=model_name,
        base_url=base_url,
        api_key=api_key,
        temperature=0,
    )


ResponseModel = TypeVar("ResponseModel", bound=BaseModel)


def parse_json_response(
    content: str,
    response_model: type[ResponseModel],
) -> ResponseModel:
    content = content.strip()
    if content.startswith("```"):
        lines = content.splitlines()
        if len(lines) >= 3 and lines[-1].startswith("```"):
            content = "\n".join(lines[1:-1]).strip()
    try:
        return response_model.model_validate(json.loads(content))
    except (json.JSONDecodeError, ValidationError) as error:
        raise HTTPException(
            status_code=502,
            detail="Agent trả về nội dung dịch không đúng định dạng.",
        ) from error


@app.post("/translate-poi")
def translate_poi(request: PoiTranslationRequest) -> dict[str, dict[str, dict[str, str]]]:
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """Bạn là biên dịch viên chuyên nghiệp tiếng Việt, tiếng Anh và tiếng Trung giản thể.
Dịch tất cả nội dung có ngôn ngữ sang tiếng Anh (en) và tiếng Trung giản thể (zh):
- Tên POI và khu vực: trả về bên dưới poi.name và poi.zone.
- Mô tả ngắn và chi tiết: trả về bên dưới en và zh.
Không dịch mã POI, danh mục, tọa độ, bán kính hoặc trạng thái; các giá trị này được giữ nguyên hoặc định dạng tại ứng dụng.
Giữ nguyên ý nghĩa, tên riêng và thông tin thực tế. Không tự thêm thông tin.
Chỉ trả về một đối tượng JSON hợp lệ, không markdown hay lời dẫn, theo cấu trúc:
{{"poi":{{"name":{{"en":"...","zh":"..."}},"zone":{{"en":"...","zh":"..."}}}},"en":{{"short":"...","detail":"..."}},"zh":{{"short":"...","detail":"..."}}}}""",
            ),
            (
                "human",
                """Thông tin POI tiếng Việt (danh mục và trạng thái là mã, không dịch):
Tên: {name}
Khu vực: {zone}
Dữ liệu khác: {poi_metadata}
Mô tả ngắn: {short}
Mô tả chi tiết: {detail}""",
            ),
        ]
    )
    try:
        result = (prompt | get_translation_model()).invoke(
            {
                "name": request.poi.name,
                "zone": request.poi.zone,
                "poi_metadata": json.dumps(
                    {
                        "category": request.poi.category,
                        "status": request.poi.status,
                    },
                    ensure_ascii=False,
                ),
                "short": request.descriptionsVi.short,
                "detail": request.descriptionsVi.detail,
            }
        )
    except OpenAIError as error:
        logger.exception("Translation model request failed")
        raise HTTPException(
            status_code=502,
            detail=f"Không gọi được model dịch ({type(error).__name__}); kiểm tra cấu hình agent trên Render.",
        ) from error

    if not isinstance(result.content, str):
        raise HTTPException(status_code=502, detail="Agent trả về kết quả không phải văn bản")

    translations = parse_json_response(result.content, PoiTranslationResponse)

    return {"translations": translations.model_dump()}


@app.post("/translate-script")
def translate_script(request: ScriptTranslationRequest) -> dict[str, dict[str, str]]:
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """Bạn là biên dịch viên kịch bản thuyết minh chuyên nghiệp.
Dịch kịch bản tiếng Việt sang tiếng Anh tự nhiên và tiếng Trung giản thể tự nhiên, phù hợp để đọc thành lời.
Giữ nguyên tên riêng, dữ kiện và ý nghĩa; không thêm lời dẫn hoặc ghi chú.
Chỉ trả về JSON hợp lệ theo cấu trúc: {{"en":"...","zh":"..."}}.""",
            ),
            ("human", "{script}"),
        ]
    )
    try:
        result = (prompt | get_translation_model()).invoke({"script": request.script})
    except OpenAIError as error:
        logger.exception("Audio script translation request failed")
        raise HTTPException(
            status_code=502,
            detail=f"Không gọi được model dịch ({type(error).__name__}); kiểm tra cấu hình model trên Render.",
        ) from error

    if not isinstance(result.content, str):
        raise HTTPException(status_code=502, detail="Agent trả về kết quả không phải văn bản")

    translations = parse_json_response(result.content, ScriptTranslations)
    return {"translations": translations.model_dump()}


@app.post("/text-to-speech")
def text_to_speech(request: SpeechRequest) -> Response:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv(f"ELEVENLABS_VOICE_ID_{request.language.upper()}")
    if not api_key or not voice_id:
        raise HTTPException(
            status_code=503,
            detail=f"Thiếu ELEVENLABS_API_KEY hoặc voice ID cho ngôn ngữ {request.language}.",
        )

    try:
        response = httpx.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            params={"output_format": "mp3_44100_128"},
            headers={
                "xi-api-key": api_key,
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
            },
            json={
                "text": request.text,
                "model_id": "eleven_multilingual_v2",
            },
            timeout=90,
        )
    except httpx.TimeoutException as error:
        logger.warning("ElevenLabs TTS request timed out for language %s", request.language)
        raise HTTPException(status_code=504, detail="ElevenLabs xử lý quá lâu; vui lòng thử lại.") from error
    except httpx.RequestError as error:
        logger.exception("ElevenLabs TTS request failed")
        raise HTTPException(status_code=502, detail="Không kết nối được tới ElevenLabs.") from error

    if not response.is_success:
        logger.error("ElevenLabs returned HTTP %s", response.status_code)
        if response.status_code in (401, 403):
            detail = "ElevenLabs từ chối API key; kiểm tra ELEVENLABS_API_KEY trên Render."
        elif response.status_code == 429:
            detail = "ElevenLabs giới hạn hoặc hết quota; kiểm tra gói dịch vụ."
        else:
            detail = f"ElevenLabs trả lỗi HTTP {response.status_code}; kiểm tra voice ID và nội dung kịch bản."
        raise HTTPException(status_code=502, detail=detail)

    return Response(
        content=response.content,
        media_type="audio/mpeg",
        headers={"Content-Disposition": f'attachment; filename="poi-{request.language}.mp3"'},
    )
