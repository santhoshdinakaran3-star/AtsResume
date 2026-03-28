"""Text extraction service for PDF and DOCX files."""

import io
import re
from typing import Optional


SECTION_HEADERS = [
    "summary", "objective", "profile", "about",
    "experience", "work experience", "employment", "professional experience",
    "education", "academic", "qualifications",
    "skills", "technical skills", "core competencies", "competencies",
    "certifications", "certificates", "licenses",
    "projects", "portfolio",
    "awards", "honors", "achievements",
    "publications", "research",
    "references", "volunteer", "interests", "hobbies",
    "languages", "contact", "personal information",
]


def extract_from_pdf(file_bytes: bytes) -> dict:
    """Extract text from PDF using PyMuPDF."""
    import fitz  # PyMuPDF

    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    full_text = ""
    for page in doc:
        text = page.get_text()
        pages.append(text)
        full_text += text + "\n"
    doc.close()

    return _structure_text(full_text, len(pages))


def extract_from_docx(file_bytes: bytes) -> dict:
    """Extract text from DOCX using python-docx."""
    from docx import Document

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = "\n".join(paragraphs)

    return _structure_text(full_text, 1)


def _structure_text(full_text: str, page_count: int) -> dict:
    """Structure extracted text with section detection."""
    lines = full_text.split("\n")
    sections = _detect_sections(lines)
    word_count = len(full_text.split())
    bullet_count = len(re.findall(r"^[\s]*[•\-\*▪►●○◆]\s", full_text, re.MULTILINE))
    has_email = bool(re.search(r"[\w\.\-]+@[\w\.\-]+\.\w+", full_text))
    has_phone = bool(re.search(r"[\+]?[\d\s\-\(\)]{7,15}", full_text))
    has_linkedin = bool(re.search(r"linkedin\.com", full_text, re.IGNORECASE))

    return {
        "full_text": full_text.strip(),
        "page_count": page_count,
        "word_count": word_count,
        "line_count": len(lines),
        "bullet_count": bullet_count,
        "detected_sections": sections,
        "has_email": has_email,
        "has_phone": has_phone,
        "has_linkedin": has_linkedin,
    }


def _detect_sections(lines: list[str]) -> list[str]:
    """Detect resume sections from lines."""
    found = []
    for line in lines:
        clean = line.strip().lower()
        # Remove common formatting chars
        clean = re.sub(r"[:\-—_|#*]+$", "", clean).strip()
        for header in SECTION_HEADERS:
            if clean == header or clean.startswith(header + " ") or clean.endswith(header):
                normalized = header.replace(" ", "_").title().replace("_", " ")
                if normalized not in found:
                    found.append(normalized)
                break
    return found
