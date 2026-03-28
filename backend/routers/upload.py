"""Upload router — handles file upload and text extraction."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from models import UploadResponse
from database import generate_id, store_resume
from services.extractor import extract_from_pdf, extract_from_docx

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume (PDF or DOCX) and extract text."""

    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '.{ext}'. Allowed: PDF, DOCX.",
        )

    # Read file
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10 MB.")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    # Extract text
    try:
        if ext == "pdf":
            extracted = extract_from_pdf(content)
        else:
            extracted = extract_from_docx(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text: {str(e)}")

    if not extracted.get("full_text", "").strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract any text from the file. It may be image-based or corrupted.",
        )

    # Store
    resume_id = generate_id()
    await store_resume(resume_id, {
        "filename": file.filename,
        "extracted": extracted,
    })

    return UploadResponse(resume_id=resume_id, filename=file.filename)
