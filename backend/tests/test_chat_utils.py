from starlette.requests import Request

from main import get_client_ip
from routes.chat import detect_language


def _make_request(headers: dict | None = None, client: tuple | None = ("10.0.0.1", 1234)) -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/api/chat",
        "headers": [(k.lower().encode(), v.encode()) for k, v in (headers or {}).items()],
        "client": client,
    }
    return Request(scope)


def test_detect_language_explicit_preference():
    assert detect_language("hola", "en") == "en"
    assert detect_language("hello", "es") == "es"


def test_detect_language_english_auto():
    assert detect_language("What does the law say about this?", None) == "en"


def test_detect_language_spanish_auto():
    assert detect_language("Que dice la ley organica?", None) == "es"


def test_detect_language_defaults_to_spanish():
    assert detect_language("xyz", None) == "es"


def test_get_client_ip_prefers_forwarded_for():
    request = _make_request({"X-Forwarded-For": "203.0.113.9, 10.0.0.1"})
    assert get_client_ip(request) == "203.0.113.9"


def test_get_client_ip_uses_real_ip():
    request = _make_request({"X-Real-IP": "198.51.100.7"})
    assert get_client_ip(request) == "198.51.100.7"


def test_get_client_ip_falls_back_to_client():
    request = _make_request(client=("192.0.2.10", 5555))
    assert get_client_ip(request) == "192.0.2.10"
