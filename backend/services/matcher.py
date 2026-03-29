import re
import math
from collections import Counter


def match_resume_to_job(resume_text: str, job_description: str) -> dict:
    """Compare resume text with job description using TF-IDF cosine similarity."""

    # Clean both texts
    resume_clean = _clean_text(resume_text)
    jd_clean = _clean_text(job_description)

    if not resume_clean.strip() or not jd_clean.strip():
        return {
            "match_score": 0.0,
            "matched_keywords": [],
            "missing_keywords": [],
            "suggestions": ["Unable to analyze — one or both texts are empty."],
        }

    # 1. Tokenize
    resume_tokens = resume_clean.split()
    jd_tokens = jd_clean.split()
    
    # 2. Get Cosine Similarity
    # We use a simplified bag-of-words cosine similarity for performance and reliability
    similarity_score = round(_calculate_cosine_similarity(resume_tokens, jd_tokens) * 100, 1)

    # Keyword analysis

    # Keyword analysis
    # NEW: We extract keywords from JD using a more robust method for small N
    jd_keywords = _extract_keywords_robust(jd_clean)
    
    # We check which of those keywords exist in the clean resume text
    matched = [k for k in jd_keywords if k in resume_clean]
    missing = [k for k in jd_keywords if k not in resume_clean]

    # Hybrid scoring: 70% keyword match, 30% textual similarity
    skill_match_percent = (len(matched) / len(jd_keywords)) * 100 if jd_keywords else 0
    match_score = round((skill_match_percent * 0.7) + (similarity_score * 0.3), 1)

    # Generate suggestions
    suggestions = _generate_match_suggestions(match_score, matched, missing)

    return {
        "match_score": match_score,
        "matched_keywords": sorted(matched)[:30],
        "missing_keywords": sorted(missing)[:20],
        "suggestions": suggestions,
    }


def _calculate_cosine_similarity(tokens1, tokens2):
    """Calculate cosine similarity between two lists of tokens."""
    vec1 = Counter(tokens1)
    vec2 = Counter(tokens2)
    
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])

    sum1 = sum([vec1[x]**2 for x in vec1.keys()])
    sum2 = sum([vec2[x]**2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if not denominator:
        return 0.0
    return float(numerator) / denominator


def _clean_text(text: str) -> str:
    """Clean and normalize text."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\.]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _extract_keywords_robust(text: str) -> list[str]:
    """Extract keywords from a single document without needing a corpus."""
    # Use a simple bag-of-words approach with custom filtering
    # 1. Tokenize
    words = re.findall(r"\b[a-z]{3,}\b", text.lower())
    
    # 2. Filter out common English stop words (minimal list)
    STOPWORDS = {
        "and", "the", "with", "from", "for", "that", "this", "your", "their", 
        "will", "have", "been", "was", "were", "are", "experience", "skills",
        "work", "ability", "years", "environment", "team", "strong", "knowledge",
        "related", "field", "preferred", "requirements", "responsibilities",
        "looking", "role", "highly", "expert", "excellent", "plus", "must",
        "degree", "problem", "solving", "communication", "verbal", "written",
        "degree", "plus", "also", "preferred", "requirements", "including",
    }
    
    # 3. Filter and count
    from collections import Counter
    counts = Counter([w for w in words if w not in STOPWORDS])
    
    # 4. Get most common technical/relevant terms
    # We take the top 40 words as potential keywords
    return [word for word, count in counts.most_common(40)]


def _generate_match_suggestions(score: float, matched: list, missing: list) -> list[str]:
    """Generate actionable suggestions based on match results."""
    suggestions = []

    if score >= 80:
        suggestions.append("✅ Excellent match! Your resume aligns very well with this job description.")
    elif score >= 60:
        suggestions.append("🟡 Good match. Consider adding a few more relevant keywords to strengthen your application.")
    elif score >= 40:
        suggestions.append("🟠 Moderate match. Your resume needs more alignment with the job requirements.")
    else:
        suggestions.append("🔴 Low match. Significant tailoring is needed for this position.")

    if missing:
        top_missing = missing[:8]
        suggestions.append(
            f"📝 Consider adding these keywords from the job description: {', '.join(top_missing)}"
        )

    if len(matched) < 5:
        suggestions.append("💡 Try to mirror the exact language used in the job posting.")
    
    if score < 60:
        suggestions.append("🔄 Consider rewriting your summary/objective to reflect the target role.")
        suggestions.append("📋 Add specific metrics and achievements relevant to this position.")

    return suggestions
