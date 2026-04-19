"""
Documents endpoint — /api/documents
"""
import logging
from fastapi import APIRouter

from services.rag import rag_service

logger = logging.getLogger("normativaup.documents")

router = APIRouter(tags=["documents"])

DOCUMENTS = [
    {"titulo": "Ley 6 de 2002 — Transparencia y Acceso a la Informacion", "numero": "6", "anio": "2002", "tipo": "Ley"},
    {"titulo": "Ley 29 de 2002 — Regimen Juridico de la Universidad de Panama", "numero": "29", "anio": "2002", "tipo": "Ley"},
    {"titulo": "Ley Organica de la Universidad de Panama", "numero": "Ley Organica", "anio": "2005", "tipo": "Ley Organica"},
    {"titulo": "Ley 42 de 2012 — Sistema Penitenciario", "numero": "42", "anio": "2012", "tipo": "Ley"},
    {"titulo": "DE 356 de 2020 — Reglamento de Teletrabajo", "numero": "356", "anio": "2020", "tipo": "Decreto Ejecutivo"},
    {"titulo": "Ley 187 de 2020 — Proteccion de Datos Personales", "numero": "187", "anio": "2020", "tipo": "Ley"},
]


@router.get("/documents")
async def get_documents():
    if rag_service.vector_db and rag_service.vector_db.vectorstore:
        try:
            stats = rag_service.vector_db.obtener_estadisticas()
            return {"documents": DOCUMENTS, "stats": stats}
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
    return {"documents": DOCUMENTS, "stats": None}