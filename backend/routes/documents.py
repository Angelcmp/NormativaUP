"""
Documents endpoint — /api/documents
"""
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pypdf import PdfReader

from services.rag import rag_service
from app.config.settings import RAW_DATA_DIR
from app.src.document_data import DOCUMENTS_DATA

logger = logging.getLogger("normativaup.documents")

router = APIRouter(tags=["documents"])


@router.get("/documents")
async def get_documents():
    if rag_service.vector_db and rag_service.vector_db.vectorstore:
        try:
            stats = rag_service.vector_db.obtener_estadisticas()
            return {"documents": DOCUMENTS_DATA, "stats": stats}
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
    return {"documents": DOCUMENTS_DATA, "stats": None}


@router.get("/documents/{doc_id}/pdf")
async def get_document_pdf(doc_id: int):
    doc = next((d for d in DOCUMENTS_DATA if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    pdf_path = Path(RAW_DATA_DIR) / doc["archivo"]
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=doc["archivo"],
        headers={"Content-Disposition": f'inline; filename="{doc["archivo"]}"'},
    )


@router.get("/documents/{doc_id}/content")
async def get_document_content(doc_id: int):
    doc = next((d for d in DOCUMENTS_DATA if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    pdf_path = Path(RAW_DATA_DIR) / doc["archivo"]
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    try:
        reader = PdfReader(str(pdf_path))
        pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages.append({"page": i + 1, "content": text.strip()})

        full_text = "\n\n".join(p["content"] for p in pages)
        total_pages = len(pages)

        return {
            "id": doc["id"],
            "titulo": doc["titulo"],
            "numero": doc["numero"],
            "anio": doc["anio"],
            "tipo": doc["tipo"],
            "total_pages": total_pages,
            "content": full_text[:50000],
            "pages": pages[:200],
        }
    except Exception as e:
        logger.error(f"Error reading PDF {pdf_path.name}: {e}")
        raise HTTPException(status_code=500, detail="Error al leer el documento")
