import pytest
from fastapi.testclient import TestClient

import main
from services.rag import rag_service


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(rag_service, "initialize", lambda: None)
    with TestClient(main.app) as test_client:
        yield test_client


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "NormativaUP API"
    assert body["status"] == "ok"


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()


def test_security_headers(client):
    response = client.get("/")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "SAMEORIGIN"


def test_rate_limit_returns_429(client, monkeypatch):
    monkeypatch.setattr(main, "RATE_LIMIT_REQUESTS", 2)
    main.RATE_LIMIT_STORE.clear()
    assert client.get("/api/categories").status_code == 200
    assert client.get("/api/categories").status_code == 200
    assert client.get("/api/categories").status_code == 429
    main.RATE_LIMIT_STORE.clear()
