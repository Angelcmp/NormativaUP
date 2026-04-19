"""
Pydantic models for the NormativaUP API
"""
import re
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000, description="Consulta legal del usuario")
    language: Optional[str] = Field(default="es", pattern=r"^(es|en)$")

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str) -> str:
        v = v.strip()
        v = re.sub(r"<[^>]+>", "", v)
        v = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v)
        if not v:
            raise ValueError("La consulta no puede estar vacia")
        return v


class SourceInfo(BaseModel):
    titulo: str = Field(..., max_length=500)
    numero: str = Field(..., max_length=50)
    anio: str = Field(..., max_length=10)
    tipo: str = Field(..., max_length=100)
    fragmento: str = Field(..., max_length=500)


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