import os
import requests
import json
import logging
from dotenv import load_dotenv

load_dotenv()

PHI_API_KEY = os.getenv("PHI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def call_llm(messages: list, model: str, api_type: str = "openrouter") -> str:
    """Universal LLM caller with multi-provider support"""
    if api_type == "openrouter":
        if not PHI_API_KEY: return ""
        headers = {
            "Authorization": f"Bearer {PHI_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "SkillBridge AI"
        }
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={"model": model, "messages": messages},
                timeout=20
            )
            if response.status_code == 200:
                return response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
            logger.error(f"OpenRouter Error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"OpenRouter Call Failed: {e}")
            
    elif api_type == "gemini":
        if not GEMINI_API_KEY: return ""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        # Convert messages to Gemini format
        contents = []
        for m in messages:
            contents.append({"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]})
        try:
            response = requests.post(url, headers={"Content-Type": "application/json"}, json={"contents": contents}, timeout=20)
            if response.status_code == 200:
                candidates = response.json().get("candidates", [])
                if candidates:
                    return candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            logger.error(f"Gemini Error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Gemini Call Failed: {e}")
            
    return ""

def call_phi_model(prompt: str) -> str:
    """Step 2: Fast Extraction (Phi-equivalent via OpenRouter)"""
    messages = [
        {"role": "system", "content": "You are an information extraction system. Extract skills and tools from the resume. Return ONLY JSON: {\"skills\": [\"skill1\", \"skill2\"]}. No talk."},
        {"role": "user", "content": prompt}
    ]
    # Primary: Fast Free Model
    res = call_llm(messages, "google/gemma-3-12b-it:free", "openrouter")
    if not res:
        # Fallback 1: High Cap Free Model
        res = call_llm(messages, "meta-llama/llama-3.3-70b-instruct:free", "openrouter")
    return res

def call_gemini_model(prompt: str) -> str:
    """Step 3/4/7: Intelligence layer (Gemini with OpenRouter fallback)"""
    messages = [{"role": "user", "content": prompt}]
    # Primary: Direct Gemini
    res = call_llm(messages, "gemini-2.5-flash", "gemini")
    if not res:
        # Fallback: Llama 70B (comparable intelligence)
        res = call_llm(messages, "meta-llama/llama-3.3-70b-instruct:free", "openrouter")
    return res

def clean_json_response(content: str) -> str:
    if not content: return ""
    clean_content = content.strip()
    if "```" in clean_content:
        # Extract content between triple backticks
        parts = clean_content.split("```")
        if len(parts) >= 3:
            clean_content = parts[1]
            if clean_content.startswith("json"):
                clean_content = clean_content[4:]
    return clean_content.strip()

def extract_resume_with_phi(resume_text: str) -> list:
    print(f"\n🚀 [PIPELINE] RAW TEXT RECEIVED: {resume_text[:200]}...")
    content = call_phi_model(resume_text[:12000])
    print(f"🧩 [PIPELINE] PHI RAW OUTPUT: {content}")
    if not content: 
        print("⚠️ [PIPELINE] PHI FAILED - FALLING BACK")
        return []
    try:
        data = json.loads(clean_json_response(content))
        skills = data.get("skills", [])
        extracted = [s.lower() for s in skills if isinstance(s, str)]
        print(f"✅ [PIPELINE] SKILLS EXTRACTED: {extracted}")
        return extracted
    except Exception as e:
        logger.error(f"Resume JSON Parse Error: {e}")
        return []

def extract_jd_skills_with_gemini(jd_text: str) -> list:
    print(f"\n🎯 [PIPELINE] ANALYZING JD: {jd_text[:150]}...")
    prompt = f"Extract all technical skills from this JD. Return ONLY a JSON list of strings. No markdown.\n\nJD:\n{jd_text[:12000]}"
    content = call_gemini_model(prompt)
    print(f"🧠 [PIPELINE] GEMINI JD OUTPUT: {content}")
    if not content: return []
    try:
        data = json.loads(clean_json_response(content))
        skills = []
        if isinstance(data, list): skills = [s.lower() for s in data]
        if isinstance(data, dict): skills = [s.lower() for s in data.get("skills", [])]
        print(f"✅ [PIPELINE] JD SKILLS: {skills}")
        return skills
    except Exception:
        return []

def normalize_skills_with_gemini(raw_skills: list, valid_skills: list) -> list:
    if not raw_skills: return []
    print(f"\n🔄 [PIPELINE] NORMALIZING: {raw_skills}")
    prompt = f"Map these raw skills: {json.dumps(raw_skills)} to these valid IDs: {json.dumps(valid_skills)}. Return ONLY JSON list of matched IDs."
    content = call_gemini_model(prompt)
    print(f"🧠 [PIPELINE] GEMINI NORMALIZATION OUTPUT: {content}")
    if not content: return [s for s in raw_skills if s in valid_skills]
    try:
        data = json.loads(clean_json_response(content))
        normalized = [s for s in data if s in valid_skills] if isinstance(data, list) else []
        print(f"🎯 [PIPELINE] FINAL NORMALIZED: {normalized}")
        return normalized
    except Exception:
        return [s for s in raw_skills if s in valid_skills]

def generate_reasoning_with_gemini(skill_id: str, is_jd_requirement: bool) -> dict:
    prompt = f"1-sentence technical reason why '{skill_id}' is vital for a career path. Under 15 words. No intro."
    why_needed = call_gemini_model(prompt) or f"Critical mastery point for {skill_id} workflows."
    print(f"💡 [REASONING] Generating explanation for {skill_id}: '{why_needed[:30]}...'")
    return {
        "jd_trigger": "Explicit Requirement" if is_jd_requirement else None,
        "why_needed": why_needed.strip().replace('"', '')
    }
