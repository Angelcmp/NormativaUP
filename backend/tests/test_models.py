import pytest
from pydantic import ValidationError

from models import ALLOWED_MODELS, ChatRequest


def test_defaults():
    req = ChatRequest(query="Que dice la ley organica?")
    assert req.language is None
    assert req.model == "gpt-4o"


def test_language_none_is_allowed():
    req = ChatRequest(query="consulta valida", language=None)
    assert req.language is None


@pytest.mark.parametrize("language", ["es", "en"])
def test_language_valid(language):
    req = ChatRequest(query="consulta valida", language=language)
    assert req.language == language


def test_language_invalid_rejected():
    with pytest.raises(ValidationError):
        ChatRequest(query="consulta valida", language="fr")


def test_query_too_short_rejected():
    with pytest.raises(ValidationError):
        ChatRequest(query="ab")


def test_query_strips_html():
    req = ChatRequest(query="  <b>Ley</b> organica  ")
    assert req.query == "Ley organica"


def test_query_only_html_rejected():
    with pytest.raises(ValidationError):
        ChatRequest(query="<b></b> <i></i>")


def test_model_none_defaults_to_gpt4o():
    req = ChatRequest(query="consulta valida", model=None)
    assert req.model == "gpt-4o"


@pytest.mark.parametrize("model", sorted(ALLOWED_MODELS))
def test_model_allowed(model):
    req = ChatRequest(query="consulta valida", model=model)
    assert req.model == model


def test_model_invalid_rejected():
    with pytest.raises(ValidationError):
        ChatRequest(query="consulta valida", model="gpt-3.5-turbo")
