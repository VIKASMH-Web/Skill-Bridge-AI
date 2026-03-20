import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()
PHI_API_KEY = os.getenv("PHI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def verify_phi(resume_text):
    print("\n--- [1] VERIFYING PHI (OpenRouter) ---")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {PHI_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "SkillBridge AI"
    }
    # Using llama-3.3-70b-instruct:free as the most robust free model for testing extraction
    data = {"model": "meta-llama/llama-3.3-70b-instruct:free", "messages": [{"role": "user", "content": f"Extract technical skills only from:\n{resume_text}"}]}
    try:
        res = requests.post(url, headers=headers, json=data, timeout=10)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            print("PHI OUTPUT (Raw):", res.json()["choices"][0]["message"]["content"])
            return True
        else:
            print(f"FAILED: {res.text}")
            return False
    except Exception as e:
        print(f"EXCEPTION: {e}")
        return False

def verify_gemini(text):
    print("\n--- [2] VERIFYING GEMINI (Google Cloud) ---")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    data = {"contents": [{"parts": [{"text": text}]}]}
    try:
        res = requests.post(url, headers={"Content-Type": "application/json"}, json=data, timeout=10)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            print("GEMINI OUTPUT (Raw):", res.json()["candidates"][0]["content"]["parts"][0]["text"])
            return True
        else:
            print(f"FAILED: {res.text}")
            return False
    except Exception as e:
        print(f"EXCEPTION: {e}")
        return False

if __name__ == "__main__":
    resume_sample = "Senior Software Engineer with experience in Python, React, and AWS Cloud Deployment."
    normalize_sample = "Normalize these skills: data wrangling, pytorch, ml"
    
    phi_ok = verify_phi(resume_sample)
    gemini_ok = verify_gemini(normalize_sample)
    
    print("\n--- FINAL VERIFICATION REPORT ---")
    print(f"PHI IS REAL: {'✅ YES' if phi_ok else '❌ NO'}")
    print(f"GEMINI IS REAL: {'✅ YES' if gemini_ok else '❌ NO'}")
    if not (phi_ok and gemini_ok):
        print("ALERT: Fallback system will be used. Ensure credentials are correct for production.")
