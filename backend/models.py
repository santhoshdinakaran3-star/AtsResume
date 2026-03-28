"""Pydantic models for request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional


class UploadResponse(BaseModel):
    resume_id: str
    filename: str
    message: str = "Resume uploaded and text extracted successfully."


class AnalyzeRequest(BaseModel):
    resume_id: str
    job_description: str = ""


class ScoreBreakdown(BaseModel):
    keyword_match: float = Field(..., ge=0, le=100)
    formatting: float = Field(..., ge=0, le=100)
    section_presence: float = Field(..., ge=0, le=100)
    experience_relevance: float = Field(..., ge=0, le=100)


class ScoreExplanations(BaseModel):
    keywords: str
    formatting: str
    sections: str
    relevance: str


class ValidationLayer(BaseModel):
    hallucination_risk: str
    confidence_score: float = Field(..., ge=0, le=100)
    notes: str


class AnalyzeResponse(BaseModel):
    resume_id: str
    overall_score: float = Field(..., ge=0, le=100)
    breakdown: ScoreBreakdown
    extracted_skills: list[str]
    extracted_experience: list[str]
    improved_experience: list[dict] = []  # Role, Company, Improved Bullets
    extracted_education: list[str]
    detected_sections: list[str]
    score_explanations: Optional[ScoreExplanations] = None
    validation: Optional[ValidationLayer] = None
    suggestions: dict


class MatchRequest(BaseModel):
    resume_id: str
    job_description: str


class MatchResponse(BaseModel):
    resume_id: str
    match_score: float = Field(..., ge=0, le=100)
    matched_keywords: list[str]
    missing_keywords: list[str]
    suggestions: list[str]
