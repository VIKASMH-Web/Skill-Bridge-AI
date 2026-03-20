# 🧠 SkillBridge AI – Adaptive Intelligence Architecture

SkillBridge AI is a high-fidelity onboarding engine that dynamically reconstructs the shortest path between a candidate's baseline and market requirements. Instead of generic roadmaps, it uses a **Deterministic Three-Layer Engine** to build realistic, verifiable learning trajectories.

---

## 🏗️ The Three-Layer Architecture

### **Layer I: Ingestion Layer (User Contextualization)**
*   **NLP Extraction**: Uses a hybrid system of **spaCy embeddings** and **LLMs (Gemini/Phi)** to extract technical skills, tools, and experience clusters from unstructured resumes.
*   **Adaptive Baseline**: Classifies users into **Beginner**, **Intermediate**, or **Advanced** levels to determine the starting point of the graph traversal.

### **Layer II: Mapping Engine (Graph Traversal)**
*   **DAG Logic**: Utilizes a **Directed Acyclic Graph (DAG)** to model skill prerequisites.
*   **Topological Sequencing**: Ensures strict learning order (e.g., *Programming Foundations* MUST precede *Python Mastery*).
*   **Parallel Tracking**: Identifies clusters of skills that can be learned concurrently (only for Intermediate/Advanced users).

### **Layer III: Adjustment Loop (Performance Velocity)**
*   **Skip Logic**: Automatically prunes known skills or satisfied prerequisites to avoid redundant training.
*   **Remediation Bridges**: Injects foundational modules (e.g., *Basic Computer Concepts*) for non-technical users to bridge the entry gap.
*   **Dynamic Recalculation**: Re-orders the path based on "Priority Scores" calculated by `Gap Level + JD Importance`.

---

## 🚀 Hackathon Features

*   **Premium SaaS Aesthetics**: Industrial, white-first design with high-elevation shadows and yellow (#FACC15) accents.
*   **Explainable Traceability**: Every module includes factual reasoning (e.g., "This skill is required for Backend roles but missing from extracted resume experience").
*   **Cross-Model Resilience**: Backend uses a multi-model fallback strategy (Gemini -> Llama -> Phi) for 100% uptime during live demos.
*   **Safe API Integration**: Secrets managed via environment variables and protected from public distribution.

---

## 🛠️ Getting Started

### **1. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python verify_apis.py  # Run this to check API health
python main.py        # Starts server on port 8000
```

### **2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev           # Starts app on port 3000
```
