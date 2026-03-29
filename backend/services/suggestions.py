"""Suggestion engine — generates detailed improvement tips based on analysis."""


def generate_suggestions(analysis: dict, extracted_data: dict) -> dict:
    """Generate comprehensive, actionable suggestions based on ATS analysis."""
    breakdown = analysis["breakdown"]
    skills = analysis.get("extracted_skills", [])
    sections = analysis.get("detected_sections", [])
    overall = analysis["overall_score"]

    missing_keywords = []
    improvement_tips = []
    rewrite_suggestions = []

    # Start with AI results if available
    if "suggestions" in analysis:
        ai_sug = analysis["suggestions"]
        missing_keywords.extend(ai_sug.get("missing_keywords", []))
        improvement_tips.extend(ai_sug.get("improvement_tips", []))
        # Add a placeholder for rewrite suggestions if AI provided refined bullets
        if analysis.get("improved_experience"):
            improvement_tips.append("Review AI-optimized bullet points for your experience section.")

    # --- Missing sections ---
    essential_sections = ["Summary", "Experience", "Education", "Skills"]
    for section in essential_sections:
        found = any(section.lower() in s.lower() for s in sections)
        if not found:
            missing_keywords.append(f"Missing '{section}' section")
            improvement_tips.append(
                f"Add a clearly labeled \"{section}\" section to your resume. "
                f"ATS systems specifically look for standard headings."
            )

    # --- Keyword suggestions ---
    if breakdown["keyword_match"] < 50:
        improvement_tips.append(
            "Your resume has few recognizable keywords. Add industry-standard "
            "skills, tools, and technologies relevant to your target role."
        )
        missing_keywords.extend([
            "Add specific technical skills (e.g., Python, JavaScript, SQL)",
            "Include soft skills (e.g., Leadership, Communication)",
            "Mention tools and platforms (e.g., AWS, Docker, Jira)",
        ])
    elif breakdown["keyword_match"] < 75:
        improvement_tips.append(
            "Your keyword coverage is moderate. Review job postings in your field "
            "and add any commonly requested skills you possess but haven't listed."
        )

    # --- Formatting tips ---
    if breakdown["formatting"] < 50:
        word_count = extracted_data.get("word_count", 0)
        if word_count < 300:
            improvement_tips.append(
                "Your resume seems too short. Aim for 400-800 words for a one-page resume. "
                "Expand your experience with specific achievements and impact."
            )
            rewrite_suggestions.append(
                "Expand bullet points: Instead of 'Managed projects', write "
                "'Managed 5+ cross-functional projects, delivering all on time and within budget.'"
            )
        elif word_count > 1200:
            improvement_tips.append(
                "Your resume may be too long. Keep it concise — 1-2 pages max. "
                "Recruiters spend an average of 7 seconds on initial screening."
            )
            rewrite_suggestions.append(
                "Trim older or less relevant experience. Focus on the last 10-15 years."
            )

        if not extracted_data.get("has_email"):
            improvement_tips.append("Add your email address to the contact section. This is essential.")

        if not extracted_data.get("has_phone"):
            improvement_tips.append("Add your phone number to the contact section.")

        if not extracted_data.get("has_linkedin"):
            improvement_tips.append(
                "Add your LinkedIn profile URL. Over 87% of recruiters use LinkedIn "
                "to verify candidates."
            )

        if extracted_data.get("bullet_count", 0) < 4:
            improvement_tips.append(
                "Use bullet points to list achievements and responsibilities. "
                "ATS systems parse bullet points more effectively than paragraphs."
            )
            rewrite_suggestions.append(
                "Convert paragraph-style descriptions to bullet-point lists starting with action verbs."
            )
    
    # --- Experience tips ---
    if breakdown["experience_relevance"] < 50:
        improvement_tips.append(
            "Strengthen your experience section with quantifiable achievements "
            "(e.g., 'Increased sales by 30%', 'Managed a team of 12')."
        )
        rewrite_suggestions.append(
            "For each role, use the STAR format: Situation, Task, Action, Result."
        )
    elif breakdown["experience_relevance"] < 75:
        improvement_tips.append(
            "Your experience section is decent. Try adding more measurable outcomes "
            "to make your impact clearer to recruiters."
        )

    # --- Section completeness tips ---
    if breakdown["section_presence"] < 80:
        improvement_tips.append(
            "Consider adding optional sections like Projects, Certifications, or Awards "
            "to strengthen your profile and improve ATS scoring."
        )

    # --- General tips based on overall score ---
    if overall < 40:
        improvement_tips.append(
            "Your ATS score is critically low. Consider a complete resume restructure "
            "aligned with ATS best practices."
        )
        rewrite_suggestions.extend([
            "Use a clean, single-column layout without tables, images, or graphics.",
            "Use standard section headings (Summary, Experience, Education, Skills).",
            "Save your resume as a .docx file — some ATS systems struggle with PDFs.",
            "Remove any headers/footers — many ATS systems cannot read them.",
        ])
    elif overall < 70:
        improvement_tips.append(
            "Your resume is decent but has room for improvement. "
            "Focus on the weakest score areas shown above."
        )
    else:
        improvement_tips.append(
            "Great job! Your resume meets most ATS standards. "
            "Fine-tune keywords for specific job postings to maximize your match rate."
        )

    # --- Professional rewrite suggestions (always useful) ---
    rewrite_suggestions.extend([
        "Start each bullet point with a strong action verb: Led, Developed, Implemented, "
        "Architected, Optimized, Streamlined, Delivered, Spearheaded.",
        "Tailor your resume for each application by incorporating keywords from the job description.",
        "Use the format: '[Action Verb] + [Task] + [Result/Impact]' for maximum ATS compatibility.",
        "Quantify achievements wherever possible: revenue, percentages, team sizes, or time saved.",
        "Keep your Professional Summary to 2-3 sentences highlighting your strongest qualifications.",
    ])

    # --- Skills-specific tips ---
    if len(skills) < 5:
        rewrite_suggestions.append(
            "Your skills section is thin. Create a dedicated 'Technical Skills' section "
            "and list 8-15 relevant skills organized by category."
        )
    
    if len(skills) >= 5 and len(skills) < 10:
        rewrite_suggestions.append(
            "Consider grouping your skills by category (e.g., Languages: Python, Java | "
            "Frameworks: React, Django | Tools: Docker, Git) for better readability."
        )

    return {
        "missing_keywords": missing_keywords,
        "improvement_tips": improvement_tips,
        "rewrite_suggestions": rewrite_suggestions,
    }
