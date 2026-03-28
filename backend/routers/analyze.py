"""Analyze router — runs ATS analysis on uploaded resume."""

from fastapi import APIRouter, HTTPException
from models import AnalyzeRequest, AnalyzeResponse
from database import get_resume, store_analysis
from services.analyzer import analyze_resume
from services.suggestions import generate_suggestions

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Analyze a previously uploaded resume and return ATS score."""

    resume_data = await get_resume(request.resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found. Upload first.")

    extracted = resume_data.get("extracted", {})
    if not extracted.get("full_text"):
        raise HTTPException(status_code=422, detail="No text found in resume.")

    # Run AI 2.0 Analysis
    analysis_result = analyze_resume(extracted, request.job_description)
    analysis_result["resume_id"] = request.resume_id

    # Generate rich suggestions from the suggestions engine
    rich_suggestions = generate_suggestions(analysis_result, extracted)
    analysis_result["suggestions"] = rich_suggestions

    # Store results
    await store_analysis(request.resume_id, analysis_result)

    return AnalyzeResponse(**analysis_result)
