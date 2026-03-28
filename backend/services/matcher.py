"""Job description matching via TF-IDF + cosine similarity."""

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


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

    # TF-IDF vectorization
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_clean, jd_clean])
    except ValueError:
        return {
            "match_score": 0.0,
            "matched_keywords": [],
            "missing_keywords": [],
            "suggestions": ["Could not extract meaningful features from the texts."],
        }

    # Cosine similarity
    # We still use TF-IDF for the broad similarity signal
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    similarity_score = round(similarity * 100, 1)

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
