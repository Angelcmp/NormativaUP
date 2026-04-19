"""
NormativaUP — FastAPI Backend
El Jurisconsulto Digital — Universidad de Panama
"""
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from routes import chat, documents

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("normativaup")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


RATE_LIMIT_STORE: dict[str, list] = {}
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api"):
            client_ip = request.client.host if request.client else "unknown"
            now = __import__("time").time()
            requests = RATE_LIMIT_STORE.get(client_ip, [])
            requests = [t for t in requests if now - t < RATE_LIMIT_WINDOW]
            if len(requests) >= RATE_LIMIT_REQUESTS:
                logger.warning(f"Rate limit exceeded for {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Demasiadas solicitudes. Intente de nuevo en un momento."},
                )
            requests.append(now)
            RATE_LIMIT_STORE[client_ip] = requests
        return await call_next(request)


app = FastAPI(
    title="NormativaUP API",
    description="API de consulta legal para leyes de Panama con RAG",
    version="1.0.0",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://normativaup.onrender.com",
        "https://normativaup-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(documents.router, prefix="/api")


@app.on_event("startup")
async def startup():
    from services.rag import rag_service
    rag_service.initialize()
    logger.info("NormativaUP API started — RAG service initialized")


@app.get("/")
async def root():
    return {"name": "NormativaUP API", "version": "1.0.0", "status": "ok"}


@app.get("/health")
async def health():
    from services.rag import rag_service
    return {
        "status": "ok" if rag_service.vector_db and rag_service.vector_db.vectorstore else "degraded",
        "vector_store": rag_service.vector_db is not None,
        "llm": rag_service.client is not None,
    }