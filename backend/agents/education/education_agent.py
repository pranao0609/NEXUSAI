# agents/education/education_agent.py
from __future__ import annotations

import asyncio
import logging
import PyPDF2
import re
from typing import Any, Dict, List, TypedDict, Optional
from groq import Groq

# LangGraph imports
from langgraph.graph import StateGraph, END

# Import settings (adjust path as needed)
from config.settings import settings

logger = logging.getLogger(__name__)

# ---------- Education Graph State ----------
class EducationState(TypedDict, total=False):
    # Input
    pdf_path: str
    
    # Processing state
    raw_text: str
    extracted_content: str
    questions: List[Dict[str, Any]]
    
    # Output
    result: Dict[str, Any]
    errors: List[str]

# ---------- Agent Nodes ----------
async def extract_content_node(state: EducationState) -> EducationState:
    """Extract text content from PDF"""
    pdf_path = state.get("pdf_path")
    
    if not pdf_path:
        state["errors"] = ["No PDF path provided"]
        return state
    
    try:
        # Extract text from PDF
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            raw_text = ""
            
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                if text:
                    raw_text += f"--- Page {page_num + 1} ---\n{text}\n\n"
        
        if not raw_text.strip():
            state["errors"] = ["No text content found in PDF"]
            return state
        
        state["raw_text"] = raw_text
        state["extracted_content"] = raw_text[:1000] + "..." if len(raw_text) > 1000 else raw_text
        
        logger.info(f"Extracted {len(raw_text)} characters from PDF")
        return state
        
    except Exception as e:
        state["errors"] = [f"Content extraction failed: {e}"]
        return state

async def analyze_content_node(state: EducationState) -> EducationState:
    """Analyze the extracted content using AI"""
    raw_text = state.get("raw_text")
    
    if not raw_text:
        state["errors"] = ["No content to analyze"]
        return state
    
    try:
        # Initialize Groq client
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Create analysis prompt
        prompt = f"""
        Analyze this educational document and extract key information:
        
        1. Identify the subject/topic
        2. Find any questions and answers (if present)
        3. Extract key concepts and definitions
        4. Determine difficulty level
        5. Summarize the main learning objectives
        
        Document content:
        {raw_text[:3000]}  # Limit to avoid token limits
        
        Provide your analysis in JSON format:
        {{
            "subject": "subject name",
            "topic": "main topic",
            "difficulty": "easy/medium/hard",
            "key_concepts": ["concept1", "concept2"],
            "questions_found": [
                {{
                    "question": "question text",
                    "answer": "answer if found",
                    "type": "multiple_choice/short_answer/essay"
                }}
            ],
            "summary": "brief summary of content",
            "learning_objectives": ["objective1", "objective2"]
        }}
        """
        
        # Get AI analysis
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert educational content analyzer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )
        
        # Parse AI response
        import json
        try:
            analysis = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            analysis = {
                "subject": "General Education",
                "topic": "Document Analysis",
                "difficulty": "medium",
                "key_concepts": ["content analysis"],
                "questions_found": [],
                "summary": "Document contains educational content",
                "learning_objectives": ["understand content"]
            }
        
        state["questions"] = analysis.get("questions_found", [])
        state["result"] = {
            "analysis": analysis,
            "content_stats": {
                "total_characters": len(raw_text),
                "estimated_pages": len(raw_text) // 2000,  # Rough estimate
                "questions_found": len(analysis.get("questions_found", [])),
                "key_concepts_count": len(analysis.get("key_concepts", []))
            }
        }
        
        logger.info("Content analysis completed successfully")
        return state
        
    except Exception as e:
        # Fallback analysis without AI
        logger.warning(f"AI analysis failed: {e}, using fallback")
        
        # Simple pattern-based analysis
        questions = extract_questions_regex(raw_text)
        key_concepts = extract_key_concepts_simple(raw_text)
        
        state["result"] = {
            "analysis": {
                "subject": "Unknown",
                "topic": "Document Content",
                "difficulty": "medium",
                "key_concepts": key_concepts,
                "questions_found": questions,
                "summary": f"Document with {len(raw_text)} characters of content",
                "learning_objectives": ["Review content", "Understand concepts"]
            },
            "content_stats": {
                "total_characters": len(raw_text),
                "estimated_pages": len(raw_text) // 2000,
                "questions_found": len(questions),
                "key_concepts_count": len(key_concepts)
            }
        }
        return state

async def generate_insights_node(state: EducationState) -> EducationState:
    """Generate educational insights and recommendations"""
    result = state.get("result", {})
    analysis = result.get("analysis", {})
    
    try:
        # Generate study recommendations
        difficulty = analysis.get("difficulty", "medium")
        concepts_count = len(analysis.get("key_concepts", []))
        questions_count = len(analysis.get("questions_found", []))
        
        # Create study plan
        study_recommendations = generate_study_plan(difficulty, concepts_count, questions_count)
        
        # Add insights to result
        state["result"]["insights"] = {
            "study_recommendations": study_recommendations,
            "estimated_study_time": calculate_study_time(concepts_count, difficulty),
            "readiness_assessment": assess_content_readiness(analysis),
            "next_steps": generate_next_steps(analysis)
        }
        
        logger.info("Educational insights generated")
        return state
        
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Insight generation failed: {e}"]
        return state

# ---------- Helper Functions ----------
def extract_questions_regex(text: str) -> List[Dict[str, Any]]:
    """Extract questions using regex patterns"""
    questions = []
    
    # Pattern for question markers
    question_patterns = [
        r'(?:Question\s*\d*[:.])?\s*([^.!?]*\?)',  # Questions ending with ?
        r'(?:Q\d*[:.])?\s*([^.!?]*\?)',            # Q1: format
        r'(?:\d+[.)]\s*)([^.!?]*\?)'               # 1. format
    ]
    
    for pattern in question_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            if len(match.strip()) > 10:  # Filter out very short matches
                questions.append({
                    "question": match.strip(),
                    "answer": "Not provided",
                    "type": "unknown"
                })
    
    return questions[:5]  # Limit to first 5 questions

def extract_key_concepts_simple(text: str) -> List[str]:
    """Simple extraction of key concepts"""
    # Look for capitalized terms, definitions, etc.
    concepts = []
    
    # Pattern for definitions
    definition_patterns = [
        r'([A-Z][a-z]+)\s+is\s+',
        r'([A-Z][a-z]+)\s+refers to\s+',
        r'([A-Z][a-z]+)\s+means\s+',
        r'The\s+([A-Z][a-z]+)\s+'
    ]
    
    for pattern in definition_patterns:
        matches = re.findall(pattern, text)
        concepts.extend([match for match in matches if len(match) > 3])
    
    return list(set(concepts))[:10]  # Unique concepts, max 10

def generate_study_plan(difficulty: str, concepts_count: int, questions_count: int) -> List[str]:
    """Generate study recommendations based on content analysis"""
    recommendations = []
    
    if difficulty == "easy":
        recommendations.append("Start with a quick overview reading")
        recommendations.append("Focus on understanding basic concepts")
    elif difficulty == "hard":
        recommendations.append("Break content into smaller sections")
        recommendations.append("Review prerequisites before diving deep")
        recommendations.append("Plan multiple study sessions")
    else:
        recommendations.append("Read through content systematically")
        recommendations.append("Take notes on key points")
    
    if concepts_count > 5:
        recommendations.append("Create a concept map to visualize relationships")
    
    if questions_count > 0:
        recommendations.append("Practice with the questions found in the document")
        recommendations.append("Create additional questions to test understanding")
    
    return recommendations

def calculate_study_time(concepts_count: int, difficulty: str) -> str:
    """Estimate study time needed"""
    base_time = concepts_count * 10  # 10 minutes per concept
    
    if difficulty == "easy":
        multiplier = 0.8
    elif difficulty == "hard":
        multiplier = 1.5
    else:
        multiplier = 1.0
    
    total_minutes = int(base_time * multiplier)
    
    if total_minutes < 60:
        return f"{total_minutes} minutes"
    else:
        hours = total_minutes // 60
        minutes = total_minutes % 60
        return f"{hours}h {minutes}m"

def assess_content_readiness(analysis: Dict) -> str:
    """Assess if content is ready for study"""
    concepts = analysis.get("key_concepts", [])
    questions = analysis.get("questions_found", [])
    
    if len(concepts) > 3 and len(questions) > 0:
        return "Well-structured content ready for study"
    elif len(concepts) > 0:
        return "Good conceptual content, consider adding practice questions"
    else:
        return "Content may need additional structure or examples"

def generate_next_steps(analysis: Dict) -> List[str]:
    """Generate recommended next steps"""
    steps = ["Review the key concepts identified"]
    
    if analysis.get("questions_found"):
        steps.append("Attempt the practice questions")
        steps.append("Check your answers and review explanations")
    else:
        steps.append("Create your own practice questions")
    
    steps.append("Summarize the main points in your own words")
    steps.append("Identify any areas needing further clarification")
    
    return steps

# ---------- Conditional Routing ----------
def has_errors(state: EducationState) -> str:
    """Check if there are any errors"""
    return "ERROR" if state.get("errors") else "SUCCESS"

def has_content(state: EducationState) -> str:
    """Check if content was extracted"""
    return "ANALYZE" if state.get("raw_text") else "ERROR"

def should_generate_insights(state: EducationState) -> str:
    """Check if we should generate insights"""
    return "INSIGHTS" if state.get("result") else "ERROR"

# ---------- Build Pipeline ----------
def build_education_pipeline() -> Any:
    """Build the education agent pipeline"""
    graph = StateGraph(EducationState)

    # Add nodes
    graph.add_node("extract_content", extract_content_node)
    graph.add_node("analyze_content", analyze_content_node)
    graph.add_node("generate_insights", generate_insights_node)

    # Set entry point
    graph.set_entry_point("extract_content")

    # Add conditional edges
    graph.add_conditional_edges(
        "extract_content",
        has_content,
        {"ANALYZE": "analyze_content", "ERROR": END}
    )
    
    graph.add_conditional_edges(
        "analyze_content",
        should_generate_insights,
        {"INSIGHTS": "generate_insights", "ERROR": END}
    )
    
    graph.add_conditional_edges(
        "generate_insights",
        has_errors,
        {"SUCCESS": END, "ERROR": END}
    )

    return graph.compile()

# ---------- Education Agent Class ----------
class EducationAgent:
    def __init__(self):
        self.pipeline = build_education_pipeline()
    
    async def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Process a PDF file with comprehensive analysis"""
        initial_state = {"pdf_path": pdf_path}
        
        try:
            final_state = await self.pipeline.ainvoke(initial_state)
            
            if final_state.get("errors"):
                return {
                    "success": False,
                    "errors": final_state["errors"],
                    "result": None
                }
            
            return {
                "success": True,
                "errors": [],
                "result": final_state.get("result", {})
            }
            
        except Exception as e:
            return {
                "success": False,
                "errors": [f"Pipeline execution failed: {e}"],
                "result": None
            }

# Export the agent
education_agent = EducationAgent()