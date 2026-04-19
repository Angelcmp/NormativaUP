"""
Cargador de documentos PDF de leyes panameñas
Gaceta Oficial de Panamá - Procesamiento de documentos legales
"""
from pathlib import Path
from typing import List, Optional
import re
from datetime import datetime

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from loguru import logger


class DocumentoLegal:
    """Clase para representar un documento legal de Panamá."""
    
    def __init__(
        self,
        titulo: str,
        numero: str,
        anio: str,
        tipo: str,
        institucion: str,
        contenido: str,
        ruta_archivo: str
    ):
        self.titulo = titulo
        self.numero = numero
        self.anio = anio
        self.tipo = tipo
        self.institucion = institucion
        self.contenido = contenido
        self.ruta_archivo = ruta_archivo
        self.fecha_carga = datetime.now().isoformat()
    
    def __repr__(self):
        return f"DocumentoLegal({self.numero}/{self.anio} - {self.titulo[:50]}...)"


class CargadorDocumentosLegales:
    """Cargador de documentos legales desde PDF."""
    
    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\nARTÍCULO",
                "\n\nSECCIÓN",
                "\n\nCAPÍTULO",
                "\n\nTÍTULO",
                "\n\n",
                ".",
                " ",
                ""
            ]
        )
    
    def extraer_metadatos(self, texto: str, nombre_archivo: str) -> dict:
        """Extrae metadatos del documento legal."""
        metadatos = {
            "institucion": "Desconocida",
            "tipo": "Ley",
            "numero": "",
            "anio": "",
            "titulo": nombre_archivo.replace(".pdf", "")
        }
        
        patrones = {
            "ley": r"Ley\s+N[°]?\s*(\d+)",
            "decreto": r"Decreto\s+N[°]?\s*(\d+)",
            "resolucion": r"Resolución\s+N[°]?\s*(\d+)",
            "anio": r"(20\d{2})"
        }
        
        for key, patron in patrones.items():
            coincidencia = re.search(patron, texto[:2000])
            if coincidencia:
                if key == "anio":
                    metadatos["anio"] = coincidencia.group(1)
                else:
                    metadatos["numero"] = coincidencia.group(1)
                    metadatos["tipo"] = key.capitalize()
        
        if not metadatos["anio"]:
            try:
                anio_archivo = re.search(r"(20\d{2})", nombre_archivo)
                if anio_archivo:
                    metadatos["anio"] = anio_archivo.group(1)
            except Exception:
                metadatos["anio"] = str(datetime.now().year)
        
        return metadatos
    
    def cargar_pdf(self, ruta_pdf: Path) -> Optional[DocumentoLegal]:
        """Carga un archivo PDF y extrae su contenido."""
        try:
            reader = PdfReader(str(ruta_pdf))
            texto_completo = []
            
            for pagina in reader.pages:
                texto = pagina.extract_text()
                if texto:
                    texto_completo.append(texto)
            
            contenido = "\n\n".join(texto_completo)
            
            if len(contenido) < 100:
                logger.warning(f"Documento muy corto: {ruta_pdf.name}")
                return None
            
            metadatos = self.extraer_metadatos(contenido, ruta_pdf.name)
            
            return DocumentoLegal(
                titulo=metadatos["titulo"],
                numero=metadatos["numero"],
                anio=metadatos["anio"],
                tipo=metadatos["tipo"],
                institucion=metadatos["institucion"],
                contenido=contenido,
                ruta_archivo=str(ruta_pdf)
            )
            
        except Exception as e:
            logger.error(f"Error al cargar {ruta_pdf.name}: {str(e)}")
            return None
    
    def cargar_directorio(self, directorio: Path) -> List[DocumentoLegal]:
        """Carga todos los PDF de un directorio."""
        documentos = []
        archivos_pdf = list(directorio.glob("*.pdf"))
        
        logger.info(f"Cargando {len(archivos_pdf)} documentos PDF...")
        
        for archivo in archivos_pdf:
            documento = self.cargar_pdf(archivo)
            if documento:
                documentos.append(documento)
                logger.info(f"Cargado: {documento}")
        
        logger.info(f"Total de documentos cargados: {len(documentos)}")
        return documentos
    
    def crear_chunks(self, documentos: List[DocumentoLegal]) -> List[Document]:
        """Crea chunks de texto para embeddings."""
        documentos_langchain = []
        
        for doc in documentos:
            metadata = {
                "titulo": doc.titulo,
                "numero": doc.numero,
                "anio": doc.anio,
                "tipo": doc.tipo,
                "institucion": doc.institucion,
                "ruta_archivo": doc.ruta_archivo,
                "fecha_carga": doc.fecha_carga
            }
            
            documento_lc = Document(
                page_content=doc.contenido,
                metadata=metadata
            )
            documentos_langchain.append(documento_lc)
        
        chunks = self.text_splitter.split_documents(documentos_langchain)
        
        logger.info(f"Creados {len(chunks)} chunks de {len(documentos)} documentos")
        return chunks


def cargar_documentos(directorio: str = "data/raw") -> List[Document]:
    """Función de conveniencia para cargar documentos."""
    loader = CargadorDocumentosLegales()
    path = Path(directorio)
    documentos = loader.cargar_directorio(path)
    chunks = loader.crear_chunks(documentos)
    return chunks


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        directorio = sys.argv[1]
        chunks = cargar_documentos(directorio)
        print(f"Se cargaron {len(chunks)} chunks")
    else:
        print("Uso: python document_loader.py <directorio>")