"""
SkillBridge AI – Recommendation Engine
Deterministic adaptive algorithm with full reasoning trace.
"""

import json
import os
from typing import Dict, List, Set, Tuple, Optional

from graph_engine import SkillGraph, load_course_catalog


class RecommendationEngine:
    """
    Generates personalized learning roadmaps with full reasoning traces.
    
    Algorithm:
    1. Extract skills + assign levels
    2. Compute gap: required - existing
    3. Traverse graph: backtrack prerequisites, remove satisfied nodes
    4. Build minimal subgraph
    5. Apply topological sort
    6. Priority scoring: score = (gap_level * 0.6) + (JD_frequency * 0.4)
    7. Group independent skills for parallel tracks
    """
    
    def __init__(self):
        self.graph = SkillGraph()
        self.catalog = load_course_catalog()
    
    def compute_skill_gap(
        self,
        resume_skills: Dict[str, dict],
        jd_skills: Dict[str, dict]
    ) -> Dict[str, dict]:
        """
        Compute skill gap between JD requirements and resume skills.
        gap = required_skills - candidate_skills
        """
        gaps = {}
        
        for skill_id, jd_data in jd_skills.items():
            if skill_id not in resume_skills:
                # Complete gap - skill not found in resume at all
                required_level = jd_data.get("level", 2)
                gaps[skill_id] = {
                    "skill_id": skill_id,
                    "gap_type": "missing",
                    "required_level": required_level,
                    "current_level": 0,
                    "gap_level": required_level,
                    "jd_frequency": jd_data.get("match_count", 1),
                    "jd_keywords": jd_data.get("matched_keywords", []),
                    "confidence": jd_data.get("confidence", 0.5),
                }
            else:
                # Partial gap - skill exists but may be at lower level
                resume_data = resume_skills[skill_id]
                required_level = jd_data.get("level", 2)
                current_level = resume_data.get("level", 1)
                
                if current_level < required_level:
                    gaps[skill_id] = {
                        "skill_id": skill_id,
                        "gap_type": "insufficient",
                        "required_level": required_level,
                        "current_level": current_level,
                        "gap_level": required_level - current_level,
                        "jd_frequency": jd_data.get("match_count", 1),
                        "jd_keywords": jd_data.get("matched_keywords", []),
                        "confidence": jd_data.get("confidence", 0.5),
                    }
        
        return gaps
    
    def compute_priority_score(self, gap: dict) -> float:
        """
        Compute priority score for a skill gap.
        score = (gap_level * 0.6) + (jd_frequency_normalized * 0.4)
        """
        gap_level = gap.get("gap_level", 1)
        jd_frequency = gap.get("jd_frequency", 1)
        
        # Normalize JD frequency (cap at 10)
        normalized_freq = min(jd_frequency / 10.0, 1.0)
        
        # Normalize gap level (max 3)
        normalized_gap = gap_level / 3.0
        
        score = (normalized_gap * 0.6) + (normalized_freq * 0.4)
        return round(score, 3)
    
    def generate_reasoning_trace(
        self,
        skill_id: str,
        gap: Optional[dict],
        subgraph: Dict[str, dict],
        resume_skills: Dict[str, dict],
        jd_skills: Dict[str, dict]
    ) -> dict:
        """
        Generate structured reasoning trace for a skill recommendation using Gemini.
        """
        from llm_service import generate_reasoning_with_gemini
        skill_name = self.graph.nodes.get(skill_id, {}).get("name", skill_id)
        
        # Determine if it's explicitly explicitly from the JD
        is_jd_req = gap is not None and gap.get("gap_type") in ["missing", "insufficient"]
        
        try:
            llm_reasoning = generate_reasoning_with_gemini(skill_name, is_jd_req)
        except Exception as e:
            # Fallback if API fails
            llm_reasoning = {
                "why_needed": f"Required foundation for {skill_name} workflows.",
                "jd_trigger": "Explicit Requirement" if is_jd_req else None
            }
        
        return {
            "skill_id": skill_id,
            "skill_name": skill_name,
            "why_needed": llm_reasoning.get("why_needed", ""),
            "jd_trigger": llm_reasoning.get("jd_trigger"),
        }
    
    def _get_all_prereqs_in_subgraph(self, skill_id: str, subgraph: Dict[str, dict]) -> Set[str]:
        """Get all prerequisites of a skill that are in the subgraph."""
        visited = set()
        queue = [skill_id]
        
        while queue:
            current = queue.pop(0)
            for prereq in subgraph.get(current, {}).get("active_prerequisites", []):
                if prereq not in visited and prereq in subgraph:
                    visited.add(prereq)
                    queue.append(prereq)
        
        return visited
    
    def classify_user_level(self, resume_skills: Dict[str, dict]) -> str:
        """
        Classify user based on existing technical baseline.
        """
        # User defined tech skills for classification
        CLUSTERS = {
            "python": ["python"],
            "java": ["java"],
            "sql": ["sql", "postgresql", "mysql"],
            "javascript": ["javascript", "typescript"],
            "machine learning": ["machine_learning"],
            "react": ["react", "nextjs"],
            "node": ["nodejs"],
            "deep learning": ["deep_learning", "pytorch", "tensorflow"],
            "api": ["fastapi", "graphql", "rest"],
            "database": ["mongodb", "redis", "sql"]
        }
        
        user_skill_ids = set(resume_skills.keys())
        matches = 0
        for cluster, ids in CLUSTERS.items():
            if any(sid in user_skill_ids for sid in ids):
                matches += 1
        
        if matches == 0: return "BEGINNER"
        if matches <= 3: return "INTERMEDIATE"
        return "ADVANCED"

    def compute_priority_score(self, gap: dict) -> float:
        """
        Compute realistic priority score (0.0 - 1.0).
        """
        gap_level = gap.get("gap_level", 1)
        jd_frequency = gap.get("jd_frequency", 1)
        
        # Priority = weighted gap + role importance
        # Max gap_level is 3. Max jd_frequency we care about is 10.
        score = (gap_level / 3.0 * 0.4) + (min(jd_frequency, 10) / 10.0 * 0.6)
        return round(score, 2)

    def generate_reasoning_trace(
        self,
        skill_id: str,
        gap: Optional[dict],
        resume_skills: Dict[str, dict],
        jd_skills: Dict[str, dict]
    ) -> dict:
        """
        Generate grounded, non-buzzword reasoning.
        """
        skill_name = self.graph.nodes.get(skill_id, {}).get("name", skill_id)
        
        # Evidence from JD
        jd_evidence = ""
        if skill_id in jd_skills:
            jd_frequency = jd_skills[skill_id].get("match_count", 1)
            jd_evidence = f"This skill is explicitly required for the role (detected {jd_frequency} occurrences in JD)."
        else:
            jd_evidence = f"Implicit prerequisite required for technical path progression."

        # Evidence from Resume
        resume_gap = ""
        if skill_id not in resume_skills:
            resume_gap = f"No mention of {skill_name} or related technologies found in the analyzed resume."
        else:
            curr = resume_skills[skill_id].get("level", 0)
            req = jd_skills.get(skill_id, {}).get("level", 2)
            resume_gap = f"Current proficiency (Level {curr}) is below the required benchmark (Level {req}) for professional autonomy."

        why_needed = f"Foundational for path. {jd_evidence}"

        return {
            "skill_id": skill_id,
            "skill_name": skill_name,
            "why_needed": why_needed,
            "resume_gap": resume_gap,
            "jd_reference": jd_evidence
        }

    def generate_roadmap(
        self,
        resume_skills: Dict[str, dict],
        jd_skills: Dict[str, dict]
    ) -> dict:
        """
        Generate a realistic, deterministic learning roadmap.
        """
        # Step 0: Classify User
        user_level = self.classify_user_level(resume_skills)
        user_is_beginner = user_level == "BEGINNER"
        
        # Step 1: Compute skill gaps
        gaps = self.compute_skill_gap(resume_skills, jd_skills)
        
        # Step 1.5: Foundation Insertion for Beginners
        target_skills = set(gaps.keys())
        known_skills = set(resume_skills.keys())
        
        # Foundations logic
        foundations = ["computer_concepts", "programming_fundamentals"]
        if user_is_beginner:
            for f in foundations:
                if f not in known_skills:
                    target_skills.add(f)
                    if f not in gaps:
                        gaps[f] = {
                            "skill_id": f,
                            "gap_type": "foundation",
                            "required_level": 1,
                            "current_level": 0,
                            "gap_level": 1,
                            "jd_frequency": 5, 
                            "confidence": 1.0
                        }
        else:
            for f in foundations:
                known_skills.add(f)
        
        # Step 2: Compute priority scores
        for skill_id, gap in gaps.items():
            gap["priority_score"] = self.compute_priority_score(gap)
        
        # Step 3: Build minimal subgraph
        subgraph = self.graph.build_minimal_subgraph(target_skills, known_skills)
        
        # Step 3.5: REMOVE SOFT SKILLS FROM SUBGRAPH
        filtered_subgraph = {}
        for sid, node in subgraph.items():
            if node.get("category") != "soft_skills":
                filtered_subgraph[sid] = node
        
        # Step 4: Topological sort
        sorted_skills = self.graph.topological_sort(filtered_subgraph)
        
        # Step 5: Identify parallel tracks (REMOVED FOR BEGINNERS)
        if user_is_beginner:
            # Force sequential tracks (each skill in its own group)
            parallel_tracks = [[s] for s in sorted_skills]
        else:
            parallel_tracks = self.graph.identify_parallel_tracks(sorted_skills, filtered_subgraph)
        
        # Step 6: Build roadmap elements
        roadmap = []
        for idx, skill_id in enumerate(sorted_skills):
            node = filtered_subgraph.get(skill_id, {})
            gap = gaps.get(skill_id, {})
            course = self.catalog.get("courses", {}).get(skill_id)
            reasoning = self.generate_reasoning_trace(
                skill_id, gap, resume_skills, jd_skills
            )
            
            status = "locked"
            if idx == 0: status = "active"
            elif all(p in resume_skills or p in known_skills or sorted_skills.index(p) < idx 
                     for p in node.get("active_prerequisites", []) if p in sorted_skills):
                status = "available"
            
            roadmap.append({
                "order": idx + 1,
                "skill_id": skill_id,
                "skill_name": node.get("name", skill_id),
                "description": node.get("description", ""),
                "category": node.get("category", ""),
                "level": node.get("level", 1),
                "status": status,
                "is_target": node.get("is_target", False),
                "is_prerequisite": node.get("is_prerequisite", False),
                "gap": gap,
                "priority_score": gap.get("priority_score", 0),
                "course": course,
                "reasoning": reasoning,
                "prerequisites": node.get("active_prerequisites", []),
                "satisfied_prerequisites": node.get("satisfied_prerequisites", []),
            })
        
        # Track Groups
        track_groups = []
        for group_idx, group in enumerate(parallel_tracks):
            track_groups.append({
                "group_index": group_idx + 1,
                "skills": group,
                "skill_names": [self.graph.nodes.get(s, {}).get("name", s) for s in group],
                "can_parallel": not user_is_beginner and len(group) > 1
            })
            
        # Match Score Calculation: (matched / required) * 100
        req_ids = set(jd_skills.keys())
        matched_ids = req_ids.intersection(set(resume_skills.keys()))
        match_percentage = round((len(matched_ids) / max(len(req_ids), 1)) * 100, 1)

        summary = {
            "user_classification": user_level,
            "total_gaps": len(roadmap),
            "total_skills_to_learn": len(roadmap),
            "estimated_hours": sum(item.get("course", {}).get("duration_hours", 0) for item in roadmap if item.get("course")),
            "match_percentage": match_percentage
        }
        
        return {
            "roadmap": roadmap,
            "parallel_tracks": track_groups,
            "gap_analysis": sorted([item for item in roadmap if item['gap']], key=lambda x: x['priority_score'], reverse=True),
            "known_skills": [{ "skill_id": sid, "skill_name": self.graph.nodes.get(sid, {}).get("name", sid) } for sid in resume_skills if sid in self.graph.nodes],
            "summary": summary,
            "categories": self.graph.categories,
        }
