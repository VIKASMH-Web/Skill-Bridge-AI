"""
SkillBridge AI – Graph Engine
DAG-based skill graph traversal, topological sort, and minimal subgraph construction.
"""

import json
import os
from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple, Optional

# Load skill graph
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_skill_graph() -> dict:
    """Load the skill graph DAG from JSON."""
    with open(os.path.join(DATA_DIR, "skill_graph.json"), "r") as f:
        return json.load(f)

def load_course_catalog() -> dict:
    """Load the course catalog from JSON."""
    with open(os.path.join(DATA_DIR, "course_catalog.json"), "r") as f:
        return json.load(f)


class SkillGraph:
    """
    Directed Acyclic Graph for skill prerequisites.
    Nodes = skills, Edges = prerequisite relationships.
    """
    
    def __init__(self):
        graph_data = load_skill_graph()
        self.nodes = graph_data["nodes"]
        self.categories = graph_data["categories"]
        
        # Build adjacency lists
        self.adj: Dict[str, List[str]] = defaultdict(list)  # skill -> skills that depend on it
        self.reverse_adj: Dict[str, List[str]] = defaultdict(list)  # skill -> its prerequisites
        
        for skill_id, skill_data in self.nodes.items():
            for prereq in skill_data.get("prerequisites", []):
                self.adj[prereq].append(skill_id)
                self.reverse_adj[skill_id].append(prereq)
    
    def get_all_prerequisites(self, skill_id: str) -> Set[str]:
        """Get all transitive prerequisites for a skill (BFS backward)."""
        visited = set()
        queue = deque([skill_id])
        
        while queue:
            current = queue.popleft()
            for prereq in self.reverse_adj.get(current, []):
                if prereq not in visited:
                    visited.add(prereq)
                    queue.append(prereq)
        
        return visited
    
    def get_all_dependents(self, skill_id: str) -> Set[str]:
        """Get all skills that transitively depend on this skill."""
        visited = set()
        queue = deque([skill_id])
        
        while queue:
            current = queue.popleft()
            for dependent in self.adj.get(current, []):
                if dependent not in visited:
                    visited.add(dependent)
                    queue.append(dependent)
        
        return visited
    
    def build_minimal_subgraph(
        self,
        target_skills: Set[str],
        known_skills: Set[str]
    ) -> Dict[str, dict]:
        """
        Build the minimal subgraph needed to learn target skills,
        excluding already known skills.
        
        Returns dict of skill_id -> node data with additional metadata.
        """
        required_nodes: Set[str] = set()
        prerequisite_chains: Dict[str, List[str]] = {}
        
        for target in target_skills:
            if target not in self.nodes:
                continue
            # Skip only if known at or above the required level (passed in as a dict target_skills)
            # Actually, standard logic is: if it's in target_skills, we WANT to learn it.
            # So only skip if it's NOT in target_skills and IS in known_skills.
            
            # Add the target itself
            required_nodes.add(target)
            
            # Get all prerequisites
            all_prereqs = self.get_all_prerequisites(target)
            chain = []
            
            for prereq in all_prereqs:
                if prereq not in known_skills:
                    required_nodes.add(prereq)
                    chain.append(prereq)
            
            prerequisite_chains[target] = chain
        
        # Build subgraph with metadata
        subgraph = {}
        for skill_id in required_nodes:
            node = self.nodes[skill_id].copy()
            node["is_target"] = skill_id in target_skills
            node["is_prerequisite"] = skill_id not in target_skills
            node["prerequisite_chain"] = prerequisite_chains.get(skill_id, [])
            
            # Filter prerequisites to only include those in the subgraph
            node["active_prerequisites"] = [
                p for p in node.get("prerequisites", [])
                if p in required_nodes
            ]
            
            # Filter out known prerequisites
            node["satisfied_prerequisites"] = [
                p for p in node.get("prerequisites", [])
                if p in known_skills
            ]
            
            subgraph[skill_id] = node
        
        return subgraph
    
    def topological_sort(self, subgraph: Dict[str, dict]) -> List[str]:
        """
        Perform topological sort on the subgraph.
        Returns ordered list of skill_ids.
        """
        # Calculate in-degrees within the subgraph
        in_degree = {skill_id: 0 for skill_id in subgraph}
        
        for skill_id, node in subgraph.items():
            for prereq in node.get("active_prerequisites", []):
                if prereq in in_degree:
                    in_degree[skill_id] += 1
        
        # Kahn's algorithm
        queue = deque()
        for skill_id, degree in in_degree.items():
            if degree == 0:
                queue.append(skill_id)
        
        result = []
        while queue:
            # Sort queue by level for deterministic ordering
            sorted_queue = sorted(queue, key=lambda x: (
                subgraph[x].get("level", 0),
                x  # alphabetical tiebreaker
            ))
            queue.clear()
            
            current = sorted_queue[0]
            result.append(current)
            
            # Add remaining back to queue
            for item in sorted_queue[1:]:
                queue.append(item)
            
            # Reduce in-degree of dependents
            for skill_id, node in subgraph.items():
                if current in node.get("active_prerequisites", []):
                    in_degree[skill_id] -= 1
                    if in_degree[skill_id] == 0:
                        queue.append(skill_id)
        
        return result
    
    def identify_parallel_tracks(
        self,
        sorted_skills: List[str],
        subgraph: Dict[str, dict]
    ) -> List[List[str]]:
        """
        Group skills that can be learned in parallel (same level, no dependencies).
        Returns list of groups (each group = parallel track).
        """
        groups: List[List[str]] = []
        placed = set()
        
        for skill_id in sorted_skills:
            if skill_id in placed:
                continue
            
            # Find all skills that can be in the same group
            group = [skill_id]
            placed.add(skill_id)
            
            for other_id in sorted_skills:
                if other_id in placed:
                    continue
                
                # Check if other_id has any dependency on current group members
                other_prereqs = set(subgraph[other_id].get("active_prerequisites", []))
                group_set = set(group)
                
                # Can be parallel if no dependency between them
                if not other_prereqs.intersection(group_set):
                    # Also check that no group member depends on other_id
                    can_parallel = True
                    for g_id in group:
                        g_prereqs = set(subgraph[g_id].get("active_prerequisites", []))
                        if other_id in g_prereqs:
                            can_parallel = False
                            break
                    
                    if can_parallel and subgraph[other_id].get("level", 0) == subgraph[skill_id].get("level", 0):
                        group.append(other_id)
                        placed.add(other_id)
            
            groups.append(group)
        
        return groups
