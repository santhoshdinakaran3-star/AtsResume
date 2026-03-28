import os
import json
import time
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    api_key = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("models/gemini-2.0-flash")

def analyze_resume_with_ai(text: str, job_description: str = "") -> dict:
    """Use an Advanced AI Prompt to extract, score, and optimize resume data."""
    
    # If no JD provided, use a general professional standard
    jd = job_description if job_description.strip() else "A general high-quality professional matching standard."

    prompt = """
    You are an advanced ATS Resume Analyzer, Parser, and Optimizer.

    STRICT RULES:
    * Do NOT hallucinate or invent any information.
    * ONLY use information explicitly present in the input resume.
    * If information is missing, return "NOT_FOUND".
    * Do NOT assume metrics, numbers, or achievements.
    * Ensure all outputs are factually grounded in the input.
    * Be fully explainable and structured.

    TASKS (Perform ALL in a single response):

    1. PARSING (Robust to messy/unstructured text)
    * Extract and structure:
      * Personal Info (Name, Email, LinkedIn)
      * Skills (Technical, Soft)
      * Work Experience (Role, Company, Bullet Points)
      * Education
    * Detect sections even if formatting is broken or unordered.

    2. ATS SCORING (Explainable + Hybrid Logic)
       Evaluate and assign scores (0–100) for:
    * Keywords Match
    * Formatting Quality
    * Section Completeness
    * Relevance to Job Description

    IMPORTANT:
    * Scores must be logical and explainable (not random).
    * Base keyword scoring on presence/absence of JD terms.
    * Penalize missing sections and poor structure.

    3. KEYWORD MATCHING
    * Extract important keywords from Job Description.
    * Identify:
      * Matched Keywords
      * Missing Keywords (high priority only)

    4. CONTENT OPTIMIZATION (NO HALLUCINATION)
    * Rewrite experience bullet points:
      * Use strong action verbs
      * Improve clarity and impact
      * DO NOT add fake metrics or achievements
      * Keep meaning exactly same as original

    5. VALIDATION LAYER
    * Assess hallucination risk:
      * LOW / MEDIUM / HIGH
    * Provide confidence score (0–100)
    * Flag any potentially inferred or weak sections

    OUTPUT FORMAT (STRICT JSON ONLY):
    {{
    "personal_info": {{
    "name": "",
    "email": "",
    "linkedin": ""
    }},
    "skills": {{
    "technical": [],
    "soft": []
    }},
    "experience": [
    {{
    "role": "",
    "company": "",
    "original_bullets": [],
    "improved_bullets": []
    }}
    ],
    "education": [],
    "scores": {{
    "keywords": 0,
    "formatting": 0,
    "sections": 0,
    "relevance": 0
    }},
    "score_explanations": {{
    "keywords": "",
    "formatting": "",
    "sections": "",
    "relevance": ""
    }},
    "keywords": {{
    "matched": [],
    "missing": []
    }},
    "validation": {{
    "hallucination_risk": "",
    "confidence_score": 0,
    "notes": ""
    }}
    }}

    INPUT RESUME:
    {text}

    JOB DESCRIPTION:
    {jd}
    """.format(text=text, jd=jd)
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            
            # Extract JSON block using regex for robustness
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                clean_json = json_match.group(0)
                return json.loads(clean_json)
            else:
                print(f"No JSON found in raw text: {raw_text[:200]}")
                return {}
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                print(f"Gemini Rate Limit (429). Waiting 30s... (Attempt {attempt+1}/3)")
                time.sleep(30)
                continue
            print(f"Error calling Gemini: {e}")
            return {}
    return {}

def fix_resume_with_ai(original_data: dict) -> dict:
    """Use Gemini to rewrite and optimize resume content."""
    
    prompt = """
    You are a professional resume writer and ATS specialist. 
    Rewrite the following resume data to be highly impactful, using quantitive results and power verbs.
    
    ORIGINAL DATA:
    {data}
    
    TASK:
    1. Rewrite each 'extracted_experience' item into 2-3 powerful bullet points.
    2. Enhance the 'professional_summary' to be more compelling.
    3. Ensure all technical skills are professionally listed.
    
    RESPONSE FORMAT (JSON ONLY, must match the input structure):
    {{
        "professional_summary": "rewritten summary",
        "extracted_experience": ["rewritten job1", "rewritten job2"],
        "extracted_skills": ["Skill1", "Skill2"]
    }}
    """.format(data=json.dumps(original_data, indent=2))
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            clean_json = response.text.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                print(f"Gemini Fix Rate Limit (429). Waiting 30s for quota reset... (Attempt {attempt+1}/3)")
                time.sleep(30)
                continue
            print(f"Error calling Gemini Fix: {e}")
            return original_data
    return original_data
