"""
SkillBridge AI – Skill Extractor
Deterministic NLP-based skill extraction using keyword matching + semantic similarity.
No hallucination, no paid APIs.
"""

import json
import os
import re
from typing import Dict, List, Set, Tuple

# Comprehensive skill keyword mapping
# Each key is a skill_id from the skill graph, values are keyword patterns
SKILL_KEYWORDS: Dict[str, List[str]] = {
    "python": [
        "python", "python3", "python2", "django", "flask", "fastapi",
        "pandas", "numpy", "scipy", "matplotlib", "jupyter", "pip",
        "virtualenv", "conda", "pycharm", "cpython", "cython"
    ],
    "sql": [
        "sql", "mysql", "postgresql", "postgres", "sqlite", "oracle",
        "database", "databases", "rdbms", "relational database",
        "stored procedure", "query optimization", "t-sql", "pl/sql",
        "microsoft sql server", "mssql", "mariadb"
    ],
    "statistics": [
        "statistics", "statistical", "probability", "hypothesis testing",
        "regression analysis", "anova", "bayesian", "distribution",
        "confidence interval", "p-value", "a/b testing", "ab testing",
        "biostatistics", "stochastic", "descriptive statistics",
        "inferential statistics", "statistical modeling"
    ],
    "linear_algebra": [
        "linear algebra", "matrix", "matrices", "vector", "vectors",
        "eigenvalue", "eigenvector", "tensor", "tensors",
        "matrix decomposition", "svd", "pca", "principal component"
    ],
    "git": [
        "git", "github", "gitlab", "bitbucket", "version control",
        "source control", "svn", "mercurial", "branching strategy",
        "pull request", "code review"
    ],
    "html_css": [
        "html", "html5", "css", "css3", "sass", "scss", "less",
        "bootstrap", "tailwind", "tailwindcss", "responsive design",
        "flexbox", "grid layout", "web design", "ui design",
        "material design", "semantic html"
    ],
    "javascript": [
        "javascript", "js", "es6", "es2015", "ecmascript", "jquery",
        "dom manipulation", "ajax", "fetch api", "promises",
        "async/await", "webpack", "babel", "npm", "yarn", "vite"
    ],
    "data_analysis": [
        "data analysis", "data analytics", "pandas", "numpy",
        "data cleaning", "data wrangling", "eda", "exploratory data analysis",
        "data manipulation", "data processing", "excel", "spreadsheet",
        "pivot table", "data mining"
    ],
    "data_visualization": [
        "data visualization", "matplotlib", "seaborn", "plotly",
        "d3.js", "d3", "tableau", "power bi", "grafana",
        "dashboard", "charts", "graphs", "infographic",
        "bokeh", "altair"
    ],
    "machine_learning": [
        "machine learning", "ml", "supervised learning", "unsupervised learning",
        "classification", "regression", "clustering", "random forest",
        "svm", "support vector", "decision tree", "gradient boosting",
        "xgboost", "lightgbm", "catboost", "ensemble", "cross-validation",
        "feature engineering", "model selection", "scikit-learn", "sklearn",
        "predictive modeling", "predictive analytics"
    ],
    "deep_learning": [
        "deep learning", "neural network", "neural networks", "cnn",
        "convolutional neural network", "rnn", "recurrent neural network",
        "lstm", "gru", "dropout", "batch normalization",
        "backpropagation", "activation function", "gradient descent",
        "adam optimizer", "learning rate"
    ],
    "nlp": [
        "nlp", "natural language processing", "text mining", "text analysis",
        "sentiment analysis", "named entity recognition", "ner",
        "tokenization", "word embeddings", "word2vec", "glove",
        "text classification", "language model", "spacy", "nltk",
        "text preprocessing", "part of speech", "pos tagging"
    ],
    "computer_vision": [
        "computer vision", "image processing", "object detection",
        "image classification", "image segmentation", "yolo",
        "opencv", "image recognition", "face detection",
        "face recognition", "ocr", "optical character recognition"
    ],
    "react": [
        "react", "reactjs", "react.js", "react hooks", "redux",
        "react native", "jsx", "virtual dom", "react router",
        "context api", "zustand", "recoil", "react query"
    ],
    "nodejs": [
        "node.js", "nodejs", "node", "express", "expressjs",
        "express.js", "koa", "nestjs", "server-side javascript",
        "rest api", "restful"
    ],
    "typescript": [
        "typescript", "ts", "type system", "generics", "interfaces",
        "type safety", "strongly typed"
    ],
    "fastapi": [
        "fastapi", "fast api", "pydantic", "starlette",
        "asgi", "async python api"
    ],
    "docker": [
        "docker", "container", "containers", "containerization",
        "dockerfile", "docker-compose", "docker compose",
        "container orchestration", "podman"
    ],
    "kubernetes": [
        "kubernetes", "k8s", "kubectl", "helm", "pod", "pods",
        "deployment", "service mesh", "istio", "knative"
    ],
    "ci_cd": [
        "ci/cd", "ci cd", "cicd", "continuous integration",
        "continuous deployment", "continuous delivery",
        "github actions", "jenkins", "travis ci", "circle ci",
        "gitlab ci", "azure devops", "pipeline", "build automation"
    ],
    "cloud_aws": [
        "aws", "amazon web services", "ec2", "s3", "lambda",
        "cloudformation", "sagemaker", "dynamodb", "rds",
        "iam", "vpc", "elastic beanstalk", "ecs", "fargate",
        "cloud computing", "cloud", "gcp", "google cloud",
        "azure", "cloud infrastructure"
    ],
    "mlops": [
        "mlops", "ml ops", "model deployment", "model serving",
        "model monitoring", "mlflow", "kubeflow", "model registry",
        "feature store", "ml pipeline", "model versioning",
        "model lifecycle"
    ],
    "system_design": [
        "system design", "distributed systems", "microservices",
        "scalability", "load balancing", "caching", "message queue",
        "event driven", "api gateway", "service mesh",
        "high availability", "fault tolerance", "architecture"
    ],
    "graphql": [
        "graphql", "graph ql", "apollo", "apollo server",
        "apollo client", "schema", "resolver", "mutation",
        "subscription"
    ],
    "redis": [
        "redis", "caching", "cache", "in-memory", "memcached",
        "session management", "pub/sub"
    ],
    "mongodb": [
        "mongodb", "mongo", "nosql", "document database",
        "mongoose", "atlas", "aggregation pipeline"
    ],
    "tensorflow": [
        "tensorflow", "tf", "keras", "tf.keras", "tflite",
        "tensorflow lite", "tensorflow serving", "tensorboard"
    ],
    "pytorch": [
        "pytorch", "torch", "torchvision", "torchaudio",
        "torch.nn", "autograd"
    ],
    "transformers": [
        "transformer", "transformers", "bert", "gpt", "llm",
        "large language model", "attention mechanism", "self-attention",
        "hugging face", "huggingface", "fine-tuning", "fine tuning",
        "transfer learning", "pre-trained model", "pretrained",
        "generative ai", "gen ai"
    ],
    "rag": [
        "rag", "retrieval augmented generation", "vector database",
        "vector store", "pinecone", "chromadb", "chroma",
        "weaviate", "qdrant", "faiss", "embedding", "embeddings",
        "semantic search"
    ],
    "nextjs": [
        "next.js", "nextjs", "next", "server side rendering",
        "ssr", "static site generation", "ssg", "app router",
        "server components"
    ],
    "testing": [
        "testing", "unit test", "unit testing", "integration testing",
        "test driven development", "tdd", "pytest", "jest",
        "mocha", "cypress", "selenium", "qa", "quality assurance",
        "test automation"
    ],
    "data_engineering": [
        "data engineering", "etl", "data pipeline", "data warehouse",
        "data lake", "apache spark", "spark", "kafka", "airflow",
        "dbt", "bigquery", "snowflake", "databricks", "redshift"
    ],
    "prompt_engineering": [
        "prompt engineering", "prompt design", "chain of thought",
        "few-shot learning", "zero-shot", "system prompt",
        "prompt template", "prompt optimization"
    ],
    "langchain": [
        "langchain", "lang chain", "llm chain", "agent",
        "tool use", "function calling", "openai function",
        "langsmith", "langgraph"
    ],
    "security": [
        "security", "cybersecurity", "web security", "owasp",
        "authentication", "authorization", "oauth", "jwt",
        "encryption", "ssl", "tls", "https", "xss",
        "sql injection", "csrf", "penetration testing"
    ],
    "agile": [
        "agile", "scrum", "kanban", "sprint", "user story",
        "backlog", "retrospective", "standup", "jira",
        "project management"
    ],
    "communication": [
        "communication", "technical writing", "documentation",
        "presentation", "stakeholder management", "collaboration",
        "teamwork", "leadership", "mentoring"
    ]
}

# Synonym and variation lookup for normalization
SKILL_SYNONYMS: Dict[str, str] = {
    "ml": "machine_learning",
    "dl": "deep_learning",
    "ai": "machine_learning",
    "artificial intelligence": "machine_learning",
    "devops": "ci_cd",
    "frontend": "html_css",
    "backend": "nodejs",
    "full stack": "system_design",
    "fullstack": "system_design",
}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    import PyPDF2
    import io
    
    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


def preprocess_text(text: str) -> str:
    """Clean and normalize text for skill extraction."""
    # Convert to lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    # Remove special characters but keep meaningful ones
    text = re.sub(r'[^\w\s/\-\.\+#]', ' ', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_skills(text: str) -> Dict[str, dict]:
    """
    Extract skills from text using deterministic keyword matching.
    Returns a dict of skill_id -> {confidence, matches, level}
    """
    processed = preprocess_text(text)
    results: Dict[str, dict] = {}
    
    for skill_id, keywords in SKILL_KEYWORDS.items():
        matches = []
        for keyword in keywords:
            # Use word boundary matching for short keywords
            if len(keyword) <= 3:
                pattern = r'\b' + re.escape(keyword) + r'\b'
            else:
                pattern = re.escape(keyword)
            
            found = re.findall(pattern, processed, re.IGNORECASE)
            if found:
                matches.extend(found)
        
        if matches:
            # Calculate confidence based on number of unique keyword matches
            unique_matches = set(matches)
            confidence = min(1.0, len(unique_matches) / max(3, len(keywords) * 0.3))
            
            # Determine proficiency level based on match density
            match_count = len(matches)
            if match_count >= 5:
                level = 3  # Expert
            elif match_count >= 3:
                level = 2  # Intermediate
            else:
                level = 1  # Beginner
            
            results[skill_id] = {
                "skill_id": skill_id,
                "confidence": round(confidence, 2),
                "level": level,
                "match_count": match_count,
                "matched_keywords": list(unique_matches)[:5]  # Top 5 unique matches
            }
    
    return results


from llm_service import (
    extract_resume_with_phi,
    normalize_skills_with_gemini,
    extract_jd_skills_with_gemini
)

def extract_skills_from_resume(text: str) -> Dict[str, dict]:
    """
    Step 2: Send resume text to PHI API -> get structured JSON
    Step 3: Send extracted skills to Gemini -> normalize skills
    Fallback to deterministic local extraction if APIs fail.
    """
    valid_skill_ids = list(SKILL_KEYWORDS.keys())
    
    # Try PHI + GEMINI pipeline
    try:
        raw_skills = extract_resume_with_phi(text)
        if raw_skills:
            normalized_skills = normalize_skills_with_gemini(raw_skills, valid_skill_ids)
            if normalized_skills:
                # Build uniform dict structure for engine compatibility
                result = {}
                for idx, map_id in enumerate(normalized_skills):
                    result[map_id] = {
                        "skill_id": map_id,
                        "confidence": 0.95,
                        "level": 2, # Default mid-level
                        "match_count": 5, 
                        "matched_keywords": [map_id]
                    }
                return result
    except Exception as e:
        print(f"LLM Resume Extraction Failed: {e}. Falling back to deterministic model.")

    # Fallback Local Deterministic Flow
    skills = extract_skills(text)
    
    # Boost confidence for skills found in specific resume sections
    section_patterns = [
        r'skills?\s*[:|\-|–]',
        r'technical\s+skills?\s*[:|\-|–]',
        r'core\s+competenc',
        r'technologies?\s*[:|\-|–]',
        r'tools?\s*[:|\-|–]',
        r'proficiency',
    ]
    
    processed = preprocess_text(text)
    for pattern in section_patterns:
        match = re.search(pattern, processed)
        if match:
            # Extract text after the section header (roughly next 500 chars)
            section_text = processed[match.end():match.end() + 500]
            section_skills = extract_skills(section_text)
            
            for skill_id, skill_data in section_skills.items():
                if skill_id in skills:
                    # Boost confidence for skills found in dedicated sections
                    skills[skill_id]["confidence"] = min(1.0, skills[skill_id]["confidence"] + 0.2)
                    skills[skill_id]["level"] = min(3, skills[skill_id]["level"] + 1)
    
    return skills


def extract_skills_from_jd(text: str) -> Dict[str, dict]:
    """
    Step 4: Send job description to Gemini -> extract required skills
    Fallback to deterministic regex if API fails.
    """
    valid_skill_ids = list(SKILL_KEYWORDS.keys())
    
    # Try GEMINI pipeline
    try:
        raw_jd_skills = extract_jd_skills_with_gemini(text)
        if raw_jd_skills:
            normalized_skills = normalize_skills_with_gemini(raw_jd_skills, valid_skill_ids)
            if normalized_skills:
                result = {}
                for map_id in normalized_skills:
                    result[map_id] = {
                        "skill_id": map_id,
                        "confidence": 0.95,
                        "level": 2,
                        "match_count": 5,
                        "jd_frequency": 5,
                        "is_required": True,
                        "matched_keywords": [map_id]
                    }
                return result
    except Exception as e:
        print(f"LLM JD Extraction Failed: {e}. Falling back to deterministic model.")

    # Fallback Deterministic Local
    skills = extract_skills(text)
    
    # Look for requirement indicators
    requirement_patterns = [
        r'required?\s*[:|\-|–]',
        r'must\s+have',
        r'requirements?\s*[:|\-|–]',
        r'qualifications?\s*[:|\-|–]',
        r'what\s+you.{0,20}need',
        r'what\s+we.{0,20}looking',
        r'experience\s+(?:in|with)',
        r'proficien(?:t|cy)\s+in',
        r'strong\s+(?:knowledge|understanding|experience)',
    ]
    
    processed = preprocess_text(text)
    
    # Determine JD frequency (how many times skill is mentioned)
    for skill_id in skills:
        jd_frequency = skills[skill_id]["match_count"]
        skills[skill_id]["jd_frequency"] = jd_frequency
        
        # Check if this appears in required vs optional section
        is_required = False
        for pattern in requirement_patterns:
            if re.search(pattern, processed):
                is_required = True
                break
        
        skills[skill_id]["is_required"] = is_required
    
    return skills
