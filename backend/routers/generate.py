
"""Generate router — returns ATS-optimized DOCX file."""

from fastapi import APIRouter, HTTPException, Response
from database import get_resume, get_analysis
from services.generator import generate_optimized_resume
import io

router = APIRouter()

@router.post("/generate/{resume_id}")
async def generate_resume_file(resume_id: str):
    """Generate and return an ATS-optimized DOCX resume."""
    
    # 1. Fetch data
    resume_data = await get_resume(resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    analysis_data = await get_analysis(resume_id)
    if not analysis_data:
        # If not analyzed, run a quick one or error
        raise HTTPException(status_code=404, detail="Resume analysis not found. Analyze first.")
        
    extracted = resume_data.get("extracted", {})
    
    # 2. Generate DOCX
    try:
        docx_bytes = generate_optimized_resume(analysis_data, extracted)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate DOCX: {str(e)}")
        
    # 3. Return as downloadable file
    # Force .docx extension regardless of original extension
    base_name = resume_data.get('filename', 'Resume').rsplit('.', 1)[0]
    filename = f"ATS_Optimized_{base_name}.docx"
        
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
