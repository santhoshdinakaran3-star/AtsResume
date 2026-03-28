"""ATS Analysis Engine — skill extraction, scoring, section analysis."""

import re
from typing import Optional
from services.ai_service import analyze_resume_with_ai

# Common technical skills for ATS matching
COMMON_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "swift",
    "react", "angular", "vue", "node.js", "express", "django", "flask", "fastapi", "spring",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
    "git", "github", "gitlab", "bitbucket",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "data analysis", "pandas", "numpy", "scipy", "matplotlib", "tableau", "power bi",
    "agile", "scrum", "kanban", "jira", "confluence",
    "rest api", "graphql", "microservices", "api design",
    "linux", "unix", "bash", "powershell",
    "figma", "sketch", "adobe", "photoshop", "illustrator",
    "communication", "leadership", "teamwork", "problem solving", "critical thinking",
    "project management", "time management", "analytical skills",
]

REQUIRED_SECTIONS = ["Summary", "Experience", "Education", "Skills"]
OPTIONAL_SECTIONS = ["Projects", "Certifications", "Awards", "Publications", "Languages"]

# Experience-related keywords
EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*years?\s+(?:of\s+)?experience",
    r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]+\d{4}\s*[-–—]\s*(present|\w+[\s,]+\d{4})",
    r"\d{4}\s*[-–—]\s*(present|\d{4})",
]

EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "doctorate", "associate", "diploma",
    "b.s.", "b.a.", "m.s.", "m.a.", "mba", "b.tech", "m.tech", "b.e.", "m.e.",
    "bsc", "msc", "bca", "mca",
    "university", "college", "institute", "school",
    "gpa", "cgpa", "honors", "cum laude", "magna cum laude",
]


def analyze_resume(extracted_data: dict, job_description: str = "") -> dict:
    """Run full ATS analysis using AI with regex fallback."""
    text = extracted_data["full_text"]
    text_lower = text.lower()
    
    # Try AI-powered analysis first
    ai_data = analyze_resume_with_ai(text, job_description)
    
    # Check if AI returned valid data
    ai_ok = ai_data and ai_data.get("scores") and ai_data.get("scores", {}).get("keywords", 0) > 0
    
    if ai_ok:
        # Use AI results
        scores = ai_data.get("scores", {})
        skills_data = ai_data.get("skills", {})
        skills = skills_data.get("technical", []) + skills_data.get("soft", [])
        experience_raw = ai_data.get("experience", [])
        experience_list = [f"{exp.get('role', '')} at {exp.get('company', '')}" for exp in experience_raw if isinstance(exp, dict)]
        improved_experience = experience_raw
        education = ai_data.get("education", [])
        detected_sections = list(set(["Summary", "Experience", "Education", "Skills"]))
        
        overall = round(
            scores.get("keywords", 0) * 0.30 +
            scores.get("formatting", 0) * 0.20 +
            scores.get("sections", 0) * 0.25 +
            scores.get("relevance", 0) * 0.25,
            1
        )
        
        return {
            "resume_id": "",
            "overall_score": overall,
            "breakdown": {
                "keyword_match": scores.get("keywords", 0),
                "formatting": scores.get("formatting", 0),
                "section_presence": scores.get("sections", 0),
                "experience_relevance": scores.get("relevance", 0),
            },
            "extracted_skills": skills,
            "extracted_experience": experience_list,
            "improved_experience": improved_experience,
            "extracted_education": education,
            "detected_sections": detected_sections,
            "score_explanations": ai_data.get("score_explanations"),
            "validation": ai_data.get("validation"),
            "suggestions": {
                "missing_keywords": ai_data.get("keywords", {}).get("missing", []),
                "improvement_tips": ["AI-powered analysis completed successfully."]
            }
        }
    else:
        # FALLBACK: Use regex-based extraction
        print("AI failed or returned empty. Using regex fallback.")
        skills = _extract_skills(text_lower)
        experience = _extract_experience(text)
        education = _extract_education(text_lower)
        detected_sections = extracted_data.get("detected_sections", [])
        
        keyword_score = _score_keywords(skills)
        formatting_score = _score_formatting(extracted_data)
        section_score = _score_sections(detected_sections)
        experience_score = _score_experience(experience, education)
        
        overall = round(
            keyword_score * 0.30 +
            formatting_score * 0.20 +
            section_score * 0.25 +
            experience_score * 0.25,
            1
        )
        
        return {
            "resume_id": "",
            "overall_score": overall,
            "breakdown": {
                "keyword_match": round(keyword_score, 1),
                "formatting": round(formatting_score, 1),
                "section_presence": round(section_score, 1),
                "experience_relevance": round(experience_score, 1),
            },
            "extracted_skills": skills,
            "extracted_experience": experience,
            "improved_experience": [],
            "extracted_education": education,
            "detected_sections": detected_sections,
            "score_explanations": None,
            "validation": None,
            "suggestions": {
                "missing_keywords": [],
                "improvement_tips": ["AI was unavailable. Scores are based on keyword matching."]
            }
        }


def _extract_skills(text_lower: str) -> list[str]:
    """Extract skills found in the resume text."""
    found = []
    for skill in COMMON_SKILLS:
        # Word boundary match
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill.title() if len(skill) > 3 else skill.upper())
    return found


def _extract_experience(text: str) -> list[str]:
    """Extract experience-related information."""
    experiences = []
    for pattern in EXPERIENCE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                experiences.append(" ".join(match).strip())
            else:
                experiences.append(match.strip())
    # Deduplicate
    return list(dict.fromkeys(experiences))


def _extract_education(text_lower: str) -> list[str]:
    """Extract education-related keywords found."""
    found = []
    for keyword in EDUCATION_KEYWORDS:
        if keyword in text_lower:
            found.append(keyword.title() if len(keyword) > 3 else keyword.upper())
    return list(dict.fromkeys(found))


def _score_keywords(skills: list[str]) -> float:
    """Score based on number of skills found."""
    if len(skills) >= 15:
        return 100.0
    elif len(skills) >= 10:
        return 85.0
    elif len(skills) >= 5:
        return 65.0
    elif len(skills) >= 3:
        return 45.0
    elif len(skills) >= 1:
        return 25.0
    return 5.0


def _score_formatting(data: dict) -> float:
    """Score based on formatting quality."""
    score = 0.0
    word_count = data.get("word_count", 0)

    # Word count check (300-1000 ideal)
    if 300 <= word_count <= 1000:
        score += 30
    elif 200 <= word_count <= 1500:
        score += 20
    elif word_count > 0:
        score += 10

    # Bullet points
    bullet_count = data.get("bullet_count", 0)
    if bullet_count >= 8:
        score += 25
    elif bullet_count >= 4:
        score += 15
    elif bullet_count >= 1:
        score += 8

    # Contact info
    if data.get("has_email"):
        score += 15
    if data.get("has_phone"):
        score += 15
    if data.get("has_linkedin"):
        score += 15

    return min(score, 100.0)


def _score_sections(detected_sections: list[str]) -> float:
    """Score based on section presence."""
    required_found = 0
    for section in REQUIRED_SECTIONS:
        for detected in detected_sections:
            if section.lower() in detected.lower():
                required_found += 1
                break

    optional_found = 0
    for section in OPTIONAL_SECTIONS:
        for detected in detected_sections:
            if section.lower() in detected.lower():
                optional_found += 1
                break

    base = (required_found / len(REQUIRED_SECTIONS)) * 80
    bonus = min(optional_found * 5, 20)
    return min(base + bonus, 100.0)


def _score_experience(experience: list, education: list) -> float:
    """Score based on experience and education relevance."""
    score = 0.0

    if len(experience) >= 3:
        score += 50
    elif len(experience) >= 1:
        score += 30
    else:
        score += 10

    if len(education) >= 3:
        score += 50
    elif len(education) >= 1:
        score += 30
    else:
        score += 10

    return min(score, 100.0)
