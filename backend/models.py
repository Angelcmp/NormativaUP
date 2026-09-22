"""
Pydantic models for the NormativaUP API
"""
import re
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.config.settings import OPENAI_MODELS

ALLOWED_MODELS = {m["id"] for m in OPENAI_MODELS}


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000, description="Consulta legal del usuario")
    language: Optional[str] = Field(default=None, pattern=r"^(es|en)$")
    model: Optional[str] = Field(default="gpt-4o")

    @field_validator("model")
    @classmethod
    def validate_model(cls, v: Optional[str]) -> str:
        if v is None:
            return "gpt-4o"
        if v not in ALLOWED_MODELS:
            raise ValueError(f"Modelo no soportado: {v}")
        return v

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str) -> str:
        v = v.strip()
        v = re.sub(r"<[^>]+>", "", v)
        v = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v).strip()
        if len(v) < 3:
            raise ValueError("La consulta debe tener al menos 3 caracteres utiles")
        return v


class SourceInfo(BaseModel):
    titulo: str = Field(..., max_length=500)
    numero: str = Field(..., max_length=50)
    anio: str = Field(..., max_length=10)
    tipo: str = Field(..., max_length=100)
    fragmento: str = Field(..., max_length=500)
    doc_id: int = Field(default=0, ge=0)
    pagina: Optional[int] = Field(default=None, ge=1)


class ConfidenceInfo(BaseModel):
    level: str = Field(..., pattern=r"^(alto|medio|bajo)$")
    percentage: int = Field(..., ge=0, le=100)
    source_count: int = Field(..., ge=0)


class ChatResponse(BaseModel):
    answer: str = Field(..., max_length=10000)
    sources: List[SourceInfo]
    confidence: ConfidenceInfo
    language: str


class DocumentInfo(BaseModel):
    titulo: str = Field(..., max_length=500)
    numero: str = Field(..., max_length=50)
    anio: str = Field(..., max_length=10)
    tipo: str = Field(..., max_length=100)


class CategoryInfo(BaseModel):
    label: str = Field(..., max_length=100)
    query: str = Field(..., max_length=500)
    icon: str = Field(..., max_length=10)


class ErrorResponse(BaseModel):
    detail: str = Field(..., max_length=500)