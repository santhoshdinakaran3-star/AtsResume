"""AI ATS Resume Analyzer — FastAPI Backend Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, analyze, match, generate

app = FastAPI(
    title="AI ATS Resume Analyzer",
    description="Analyze resumes for ATS compatibility, match with job descriptions, and get improvement suggestions.",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(analyze.router, tags=["Analyze"])
app.include_router(match.router, tags=["Match"])
app.include_router(generate.router, tags=["Generate"])


@app.get("/")
async def root():
    return {
        "name": "AI ATS Resume Analyzer API",
        "version": "1.0.0",
        "endpoints": ["/upload", "/analyze", "/match"],
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
