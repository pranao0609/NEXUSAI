# agents/health/health_agent.py
from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List, TypedDict, Optional
from groq import Groq

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from config.settings import settings
from agents.health.qdrant_client import qdrant_client
from agents.health.document_processor import document_processor

logger = logging.getLogger(__name__)

# ---------- Health Graph State ----------
class HealthState(TypedDict, total=False):
    # inputs
    pdf_path: str
    question: str
    user_context: str
    user_id: str
    
    # processing state
    extracted_text: str
    text_chunks: List[Dict[str, Any]]
    search_results: List[Dict[str, Any]]
    
    # outputs
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float
    errors: List[str]

# ---------- Health Agent Nodes ----------
async def initialize_node(state: HealthState) -> HealthState:
    """Initialize all components"""
    try:
        # Initialize Qdrant client
        qdrant_success = await qdrant_client.initialize()
        
        # Initialize document processor
        processor_success = await document_processor.initialize()
        
        if not (qdrant_success and processor_success):
            state["errors"] = ["Failed to initialize health agent components"]
        
        return state
    except Exception as e:
        state["errors"] = [f"Initialization failed: {e}"]
        return state

async def process_documents_node(state: HealthState) -> HealthState:
    """Process health documents and store in vector database"""
    if state.get("errors"):
        return state
    
    pdf_path = state.get("pdf_path")
    if not pdf_path:
        # Skip document processing if no PDF provided
        return state
    
    try:
        success = await document_processor.process_and_store_documents(pdf_path)
        if not success:
            state["errors"] = ["Failed to process and store documents"]
        
        return state
    except Exception as e:
        state["errors"] = [f"Document processing failed: {e}"]
        return state

async def search_documents_node(state: HealthState) -> HealthState:
    """Search for relevant health information"""
    if state.get("errors"):
        return state
    
    question = state.get("question")
    if not question:
        state["errors"] = ["No question provided for search"]
        return state
    
    try:
        # Add user context to query if available
        user_context = state.get("user_context", "")
        enhanced_query = question
        if user_context:
            enhanced_query = f"{question} Context: {user_context}"
        
        # Search for relevant documents
        results = await document_processor.search_health_documents(
            enhanced_query, 
            settings.TOP_K_RESULTS
        )
        
        state["search_results"] = results
        return state
        
    except Exception as e:
        state["errors"] = [f"Document search failed: {e}"]
        return state

async def generate_answer_node(state: HealthState) -> HealthState:
    """Generate answer based on search results"""
    if state.get("errors"):
        return state
    
    question = state.get("question")
    search_results = state.get("search_results", [])
    user_context = state.get("user_context", "")
    
    if not question:
        state["errors"] = ["No question provided for answer generation"]
        return state
    
    try:
        # If we have search results, use them as context
        if search_results:
            context = "\n\n".join([result["text"] for result in search_results[:3]])
            answer = await _generate_llm_answer(question, context, user_context)
            state["answer"] = answer
            state["sources"] = search_results
            state["confidence"] = _calculate_confidence(search_results)
        else:
            # If no search results, generate answer directly
            answer = await _generate_llm_answer(question, "", user_context)
            state["answer"] = answer
            state["confidence"] = 0.5  # Medium confidence for direct answers
        
        return state
        
    except Exception as e:
        state["errors"] = [f"Answer generation failed: {e}"]
        return state

async def _generate_llm_answer(question: str, context: str, user_context: str) -> str:
    """Generate answer using GROQ LLM"""
    try:
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        
        if context:
            prompt = f"""
            Based on the following medical context, answer the user's question accurately.

            CONTEXT:
            {context}

            USER CONTEXT: {user_context}

            QUESTION: {question}

            Provide a clear, concise medical answer. If the context doesn't contain enough information, say so.
            Always recommend consulting a healthcare professional for medical advice.

            ANSWER:
            """
        else:
            prompt = f"""
            Answer the following medical question based on general medical knowledge.

            USER CONTEXT: {user_context}

            QUESTION: {question}

            Provide a helpful medical answer. Always recommend consulting a healthcare professional.

            ANSWER:
            """
        
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful medical AI assistant that provides accurate information."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"GROQ API call failed: {e}")
        return f"I encountered an error generating the answer. Please try again. Error: {str(e)}"

def _calculate_confidence(search_results: List[Dict[str, Any]]) -> float:
    """Calculate confidence score based on search results"""
    if not search_results:
        return 0.5  # Medium confidence for no search results
    
    # Simple confidence calculation based on semantic search scores
    scores = [result.get("score", 0.0) for result in search_results]
    max_confidence = max(scores) if scores else 0.0
    return min(max_confidence * 2, 1.0)

# ---------- Conditional Routing ----------
def has_errors(state: HealthState) -> str:
    return "ERR" if state.get("errors") else "OK"

def should_process_documents(state: HealthState) -> str:
    """Check if we need to process documents"""
    return "PROCESS" if state.get("pdf_path") else "SKIP_PROCESS"

# ---------- Health Pipeline ----------
def build_health_pipeline() -> Any:
    """Build the health domain processing pipeline"""
    graph = StateGraph(HealthState)

    # Add nodes
    graph.add_node("initialize", initialize_node)
    graph.add_node("process_documents", process_documents_node)
    graph.add_node("search_documents", search_documents_node)
    graph.add_node("generate_answer", generate_answer_node)

    # Set entry point
    graph.set_entry_point("initialize")

    # Add conditional edges
    graph.add_conditional_edges(
        "initialize", 
        has_errors,
        {"ERR": END, "OK": "process_documents"}
    )
    
    graph.add_conditional_edges(
        "process_documents",
        has_errors,
        {"ERR": END, "OK": "search_documents"}
    )
    
    graph.add_conditional_edges(
        "search_documents",
        has_errors,
        {"ERR": END, "OK": "generate_answer"}
    )
    
    graph.add_conditional_edges(
        "generate_answer",
        has_errors,
        {"ERR": END, "OK": END}
    )

    # Compile the graph WITHOUT checkpointer for simplicity
    compiled = graph.compile()
    
    return compiled

# ---------- Health Agent Interface ----------
class HealthAgent:
    def __init__(self):
        self.pipeline = build_health_pipeline()
    
    async def process_health_query(self, pdf_path: Optional[str], 
                                 question: str, 
                                 user_context: str = "",
                                 user_id: str = "anonymous") -> Dict[str, Any]:
        """Process a health-related query"""
        initial_state = {
            "pdf_path": pdf_path,
            "question": question,
            "user_context": user_context,
            "user_id": user_id
        }
        
        try:
            # Run the pipeline
            final_state = await self.pipeline.ainvoke(initial_state)
            
            # Return the results
            return {
                "answer": final_state.get("answer", ""),
                "sources": final_state.get("sources", []),
                "confidence": final_state.get("confidence", 0.0),
                "errors": final_state.get("errors", [])
            }
            
        except Exception as e:
            return {
                "answer": "",
                "sources": [],
                "confidence": 0.0,
                "errors": [f"Pipeline execution failed: {e}"]
            }

# Export the health agent
health_agent = HealthAgent()