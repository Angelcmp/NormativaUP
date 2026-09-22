import pytest
from langchain_core.documents import Document

from app.config.settings import OPENAI_MODEL
from services.rag import LLMError, RAGService


def _doc(score: float, titulo: str = "LeyOrganica_UP") -> Document:
    return Document(
        page_content="Articulo 1. La Universidad de Panama es una entidad autonoma.",
        metadata={"titulo": titulo, "numero": "29", "anio": "2002", "tipo": "Ley", "score": score},
    )


def test_confidence_no_documents():
    conf = RAGService().calculate_confidence([])
    assert conf.level == "bajo"
    assert conf.percentage == 0
    assert conf.source_count == 0


def test_confidence_high():
    conf = RAGService().calculate_confidence([_doc(0.1), _doc(0.2)])
    assert conf.level == "alto"
    assert 0 <= conf.percentage <= 100


def test_confidence_medium():
    conf = RAGService().calculate_confidence([_doc(0.6)])
    assert conf.level == "medio"


def test_confidence_low():
    conf = RAGService().calculate_confidence([_doc(0.8)])
    assert conf.level == "bajo"


def test_confidence_percentage_clamped():
    conf = RAGService().calculate_confidence([_doc(5.0)])
    assert 0 <= conf.percentage <= 100


def test_format_sources_maps_doc_id():
    sources = RAGService().format_sources([_doc(0.1)])
    assert len(sources) == 1
    assert sources[0].doc_id == 3
    assert sources[0].numero == "29"


def test_build_messages_delimits_documents_without_query_in_system():
    messages = RAGService()._build_messages("Que es la autonomia?", [_doc(0.1)], "es")
    assert messages[0]["role"] == "system"
    assert "Que es la autonomia?" not in messages[0]["content"]
    assert messages[1]["role"] == "user"
    assert "<documentos>" in messages[1]["content"]
    assert "Que es la autonomia?" in messages[1]["content"]


def test_resolve_model_fallback():
    service = RAGService()
    assert service._resolve_model("gpt-4o") == "gpt-4o"
    assert service._resolve_model("no-existe") == OPENAI_MODEL


def test_generate_raises_without_client():
    service = RAGService()
    with pytest.raises(LLMError):
        service.generate("consulta", [_doc(0.1)])


def test_generate_stream_raises_without_client():
    service = RAGService()
    with pytest.raises(LLMError):
        list(service.generate_stream("consulta", [_doc(0.1)]))
