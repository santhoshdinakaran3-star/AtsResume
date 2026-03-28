"""Match router — compare resume with job description."""

from fastapi import APIRouter, HTTPException
from models import MatchRequest, MatchResponse
from database import get_resume
from services.matcher import match_resume_to_job

router = APIRouter()


@router.post("/match", response_model=MatchResponse)
async def match(request: MatchRequest):
    """Match a resume against a job description using cosine similarity."""

    resume_data = await get_resume(request.resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found. Upload first.")

    extracted = resume_data.get("extracted", {})
    resume_text = extracted.get("full_text", "")
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="No text found in resume.")

    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    # Run matching
    result = match_resume_to_job(resume_text, request.job_description)

    return MatchResponse(
        resume_id=request.resume_id,
        match_score=result["match_score"],
        matched_keywords=result["matched_keywords"],
        missing_keywords=result["missing_keywords"],
        suggestions=result["suggestions"],
    )
