"""
SkillBridge AI – FastAPI Backend
Main API server with endpoints for resume/JD upload and roadmap generation.
"""

import json
import os
import traceback
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from skill_extractor import (
    extract_skills_from_resume,
    extract_skills_from_jd,
    extract_text_from_pdf,
)
from recommender import RecommendationEngine

app = FastAPI(
    title="SkillBridge AI",
    description="Adaptive Learning Path Engine – Deterministic, Explainable AI for Skill Gap Analysis",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommendation engine
engine = RecommendationEngine()


class TextInput(BaseModel):
    resume_text: str
    jd_text: str


class HealthResponse(BaseModel):
    status: str
    version: str


@app.get("/", response_model=HealthResponse)
async def root():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/api/analyze")
async def analyze_text(input_data: TextInput):
    """
    Analyze resume and job description text to generate learning roadmap.
    """
    try:
        if not input_data.resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume text is required")
        if not input_data.jd_text.strip():
            raise HTTPException(status_code=400, detail="Job description text is required")
        
        # Extract skills
        resume_skills = extract_skills_from_resume(input_data.resume_text)
        jd_skills = extract_skills_from_jd(input_data.jd_text)
        
        if not jd_skills:
            raise HTTPException(
                status_code=400,
                detail="Could not extract any skills from the job description. Please provide a more detailed JD."
            )
        
        # Generate roadmap
        result = engine.generate_roadmap(resume_skills, jd_skills)
        
        return {
            "success": True,
            "data": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/upload")
async def analyze_upload(
    resume: Optional[UploadFile] = File(None),
    jd: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
):
    """
    Analyze resume and JD from file uploads or text.
    Supports PDF and text files.
    """
    try:
        # Process resume
        final_resume_text = ""
        if resume:
            content = await resume.read()
            if resume.filename and resume.filename.lower().endswith(".pdf"):
                final_resume_text = extract_text_from_pdf(content)
            else:
                final_resume_text = content.decode("utf-8", errors="ignore")
        elif resume_text:
            final_resume_text = resume_text
        
        if not final_resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume content is required")
        
        # Process JD
        final_jd_text = ""
        if jd:
            content = await jd.read()
            if jd.filename and jd.filename.lower().endswith(".pdf"):
                final_jd_text = extract_text_from_pdf(content)
            else:
                final_jd_text = content.decode("utf-8", errors="ignore")
        elif jd_text:
            final_jd_text = jd_text
        
        if not final_jd_text.strip():
            raise HTTPException(status_code=400, detail="Job description content is required")
        
        # Extract skills
        resume_skills = extract_skills_from_resume(final_resume_text)
        jd_skills = extract_skills_from_jd(final_jd_text)
        
        if not jd_skills:
            raise HTTPException(
                status_code=400,
                detail="Could not extract any skills from the job description. Please provide a more detailed JD."
            )
        
        # Generate roadmap
        result = engine.generate_roadmap(resume_skills, jd_skills)
        
        return {
            "success": True,
            "data": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/skills")
async def get_all_skills():
    """Get all available skills in the graph."""
    from graph_engine import load_skill_graph
    graph = load_skill_graph()
    return {
        "success": True,
        "data": graph
    }


@app.get("/api/courses")
async def get_all_courses():
    """Get all available courses in the catalog."""
    from graph_engine import load_course_catalog
    catalog = load_course_catalog()
    return {
        "success": True,
        "data": catalog
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
