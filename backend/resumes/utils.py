import os
from typing import Optional


def extract_text_from_pdf(file_path: str) -> str:
    try:
        from pypdf import PdfReader
    except Exception:
        # Fallback import for older package name
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except Exception:
            return ""
    try:
        reader = PdfReader(file_path)
        texts = []
        for page in getattr(reader, 'pages', []):
            try:
                txt = page.extract_text() or ""
            except Exception:
                txt = ""
            if txt:
                texts.append(txt)
        return "\n".join(texts)
    except Exception:
        return ""


def extract_text_from_docx(file_path: str) -> str:
    try:
        from docx import Document  # python-docx
    except Exception:
        return ""
    try:
        doc = Document(file_path)
        parts = []
        for p in getattr(doc, 'paragraphs', []):
            if p.text:
                parts.append(p.text)
        # Optionally extract tables
        for table in getattr(doc, 'tables', []):
            for row in table.rows:
                row_text = "\t".join(cell.text.strip() for cell in row.cells)
                if row_text:
                    parts.append(row_text)
        return "\n".join(parts).strip()
    except Exception:
        return ""


def extract_text_from_file(file_path: str, ext: Optional[str]) -> str:
    ext = (ext or "").lower().lstrip('.')
    if ext == 'pdf':
        return extract_text_from_pdf(file_path)
    if ext in ('docx',):
        return extract_text_from_docx(file_path)
    return ""
