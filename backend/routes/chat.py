"""
Chat endpoint — /api/chat
"""
import logging
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config.settings import OPENAI_MODELS
from models import ChatRequest, ChatResponse
from services.rag import rag_service

logger = logging.getLogger("normativaup.chat")

router = APIRouter(tags=["chat"])

CATEGORIES = [
    {"label": "Educacion", "query": "educacion beca universidad IFARHU", "icon": "\U0001F4DA"},
    {"label": "Trabajo", "query": "trabajo laboral empleo salario", "icon": "\u2696\uFE0F"},
    {"label": "Salud", "query": "salud seguridad social hospital", "icon": "\U0001F3E5"},
    {"label": "Gobierno", "query": "gobierno digital servicio publico", "icon": "\U0001F3DB\uFE0F"},
    {"label": "Transito", "query": "transito vehiculos licencia", "icon": "\U0001F697"},
    {"label": "Ambiente", "query": "ambiente ecologia recursos naturales", "icon": "\U0001F33F"},
    {"label": "Tributos", "query": "tributos impuestos ISR renta", "icon": "\U0001F4B0"},
    {"label": "Datos personales", "query": "datos personales proteccion habeas data", "icon": "\U0001F512"},
]


def detect_language(query: str, preference: str) -> str:
    if preference in ("en", "es"):
        return preference
    
    import re
    q = query.lower()
    
    es_indicators = len(re.findall(r'\b(como|que|donde|cuando|por\s*que|ley|requisitos|puede|debe|articulo|sobre|cual|es|esta|son|esta|esta)\b', q))
    en_indicators = len(re.findall(r'\b(how|what|where|when|why|law|requirements|can|must|article|about|which|is|are|this|these)\b', q))
    
    if es_indicators > en_indicators:
        return "es"
    elif en_indicators > es_indicators:
        return "en"
    
    has_es_chars = bool(re.search(r'[áéíóúñü]', q))
    has_en_chars = bool(re.search(r'[a-z]', q))
    
    if has_es_chars and not has_en_chars:
        return "es"
    
    return "es"


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not rag_service.initialized:
        raise HTTPException(status_code=503, detail="RAG service not initialized")
    if not rag_service.vector_db or not rag_service.vector_db.vectorstore:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    logger.info(f"Chat request: query='{request.query[:50]}...' lang={request.language}")

    try:
        language = detect_language(request.query, request.language)
        model = request.model or "gpt-4o"
        documents = rag_service.search(request.query)
        answer = rag_service.generate(request.query, documents, language, model)
        confidence = rag_service.calculate_confidence(documents)
        sources = rag_service.format_sources(documents)

        logger.info(f"Chat response: level={confidence.level} sources={confidence.source_count}")
        return ChatResponse(
            answer=answer,
            sources=sources,
            confidence=confidence,
            language=language,
        )
    except Exception as e:
        logger.error(f"Chat error: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing query: {type(e).__name__}: {e}")


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    if not rag_service.initialized:
        raise HTTPException(status_code=503, detail="RAG service not initialized")
    if not rag_service.vector_db or not rag_service.vector_db.vectorstore:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    logger.info(f"Chat stream request: query='{request.query[:50]}...' lang={request.language}")

    try:
        language = detect_language(request.query, request.language)
        model = request.model or "gpt-4o"
        documents = rag_service.search(request.query)
        confidence = rag_service.calculate_confidence(documents)
        sources = rag_service.format_sources(documents)

        def event_stream():
            full_response = ""
            for chunk in rag_service.generate_stream(request.query, documents, language, model):
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            yield f"data: {json.dumps({'done': True, 'sources': sources, 'confidence': confidence})}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    except Exception as e:
        logger.error(f"Chat stream error: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing query: {type(e).__name__}: {e}")


@router.get("/categories")
async def get_categories():
    return CATEGORIES


@router.get("/models")
async def get_models():
    return OPENAI_MODELS