# main.py
from __future__ import annotations
from pydantic import BaseModel
import logging
from typing import Any, Dict, List ,Optional
from utils.conversation_store import save_message
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import UploadFile, File, Form , Depends
from typing import Optional
from utils.dependencies import get_current_user
import json
import asyncio
from datetime import datetime
from agents.health.health_agent import HealthAgent
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import os
from typing import Dict
import json


# --- Safe imports with clear failure messages ---
try:
    from routers import auth
except Exception as e:
    raise RuntimeError(f"Failed to import routers.auth: {e}") from e

try:
    from agents.orchestrator.orchestrator_agent import build_pipeline
except Exception as e:
    raise RuntimeError(f"Failed to import build_pipeline: {e}") from e

# --- Enhanced logging setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("uvicorn.error")

# Agent thinking logger
agent_logger = logging.getLogger("agent_thinking")
agent_logger.setLevel(logging.INFO)

# --- FastAPI setup ---
app = FastAPI(
    title="Hackathon Multi-Agent System",
    version="1.0.0",
    description="Kurukshetra Hackathon Project: Multi-Agent Collaboration System with Verbose Agent Thinking",
)

# --- CORS (tighten origins in production) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # TODO: restrict in prod (e.g., ["https://yourdomain.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# --- Pipeline Graph instance ---
pipeline = build_pipeline()

# --- Global state for tracking agent thinking ---
agent_thoughts: Dict[str, List[Dict[str, Any]]] = {}

# --- Helper functions for agent thinking ---
def log_agent_thinking(session_id: str, agent_name: str, thought: str, data: Dict[str, Any] = None):
    """Log and store agent thinking process"""
    timestamp = datetime.now().isoformat()
    thinking_entry = {
        "timestamp": timestamp,
        "agent": agent_name,
        "thought": thought,
        "data": data or {}
    }
    
    if session_id not in agent_thoughts:
        agent_thoughts[session_id] = []
    
    agent_thoughts[session_id].append(thinking_entry)
    
    # Log to console if verbose
    agent_logger.info(f"[{agent_name}] {thought}")
    if data:
        agent_logger.info(f"[{agent_name}] Data: {json.dumps(data, indent=2)}")

def get_agent_thoughts(session_id: str) -> List[Dict[str, Any]]:
    """Retrieve agent thinking history for a session"""
    return agent_thoughts.get(session_id, [])

# --- Health & Root ---
@app.get("/", tags=["system"])
def read_root() -> Dict[str, str]:
    return {"Hackathon": "Kurukshetra", "version": "1.0.0", "features": ["verbose_logging", "agent_thinking"]}


@app.get("/health", tags=["system"])
def health_check() -> Dict[str, str]:
    return {"status": "ok", "pipeline_loaded": pipeline is not None}


# --- PDF Download Endpoint ---
@app.get("/download-pdf/{pdf_filename}", tags=["documents"])
async def download_pdf(pdf_filename: str) -> FileResponse:
    """Download a generated PDF with proper filename"""
    try:
        pdf_path = f"generated_pdfs/{pdf_filename}"
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=pdf_filename
        )
    except Exception as e:
        logger.exception(f"Error downloading PDF {pdf_filename}: {e}")
        raise HTTPException(status_code=404, detail="PDF not found") from e


# --- Agent thinking endpoints ---
@app.get("/agent-thoughts/{session_id}", tags=["debugging"])
async def get_session_thoughts(session_id: str) -> Dict[str, Any]:
    """Get all agent thinking for a specific session"""
    thoughts = get_agent_thoughts(session_id)
    return {
        "session_id": session_id,
        "total_thoughts": len(thoughts),
        "thoughts": thoughts
    }

@app.delete("/agent-thoughts/{session_id}", tags=["debugging"])
async def clear_session_thoughts(session_id: str) -> Dict[str, str]:
    """Clear agent thinking history for a session"""
    if session_id in agent_thoughts:
        del agent_thoughts[session_id]
    return {"message": f"Cleared thinking history for session {session_id}"}

# --- WebSocket for real-time agent thinking ---
@app.websocket("/ws/agent-thoughts/{session_id}")
async def websocket_agent_thoughts(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time agent thinking updates"""
    await websocket.accept()
    try:
        while True:
            # Send any new thoughts for this session
            thoughts = get_agent_thoughts(session_id)
            if thoughts:
                await websocket.send_text(json.dumps({
                    "session_id": session_id,
                    "latest_thoughts": thoughts[-5:]  # Send last 5 thoughts
                }))
            await asyncio.sleep(1)  # Check every second
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")

# --- Global exception handler ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.post("/pipeline", tags=["pipeline"])
async def pipeline_endpoint(
    source: str = Form("wiki", description="ingestion source key e.g. wiki|web|arxiv|csv"),
    query: str = Form(" ", description="search/topic query for ingestion"),
    title: str = Form("Generated Report", description="report title"),
    file_content: Optional[UploadFile] = None,  # optional
    audience: str = Form("General", description="target audience"),
    verbose: bool = Form(False, description="enable verbose logging and agent thinking"),
    user: dict = Depends(get_current_user),
) -> Any:
    """
    Runs the full multi-agent pipeline (LangGraph powered):
      1. Ingestion
      2. Summarization  
      3. Analysis / Report Generation
      4. PDF Generation (if available)
      
    Now with verbose agent thinking and removed source parameter.
    """
    print(query)
    session_id = f"session-{user.id}"
    
    # Clear previous thoughts for this session
    if session_id in agent_thoughts:
        del agent_thoughts[session_id]

    try:
        # Store user query
        await save_message(session_id, "user", f"Query={query}, Title={title}, Audience={audience}")

        # Log initial thinking
        if verbose:
            log_agent_thinking(session_id, "ORCHESTRATOR", "Starting multi-agent pipeline", {
                "query": query,
                "title": title,
                "audience": audience,
                "session_id": session_id
            })
        file_text = ""
        if file_content:
            # Read bytes and decode to string
            content_bytes = await file_content.read()
            file_text = content_bytes.decode("utf-8", errors="ignore")
    
            # Reset pointer in case file is read again later
            await file_content.seek(0)
        # Input state (removed source field)
        input_state = {
            "query": query,
            "title": title,
            "audience": audience,
            "verbose": verbose,
            "session_id": session_id,
            "file_content": file_text,
        }

        # Add thinking callback to pipeline config if verbose
        config = {"configurable": {"thread_id": session_id}}
        
        if verbose:
            # Add callback for capturing agent thinking
            config["callbacks"] = [AgentThinkingCallback(session_id)]
            log_agent_thinking(session_id, "ORCHESTRATOR", "Pipeline configured with verbose logging")

        # Execute pipeline
        if verbose:
            log_agent_thinking(session_id, "ORCHESTRATOR", "Invoking pipeline with input state", input_state)
        
        result = await pipeline.ainvoke(input_state, config=config)

        if verbose:
            log_agent_thinking(session_id, "ORCHESTRATOR", "Pipeline execution completed", {
                "result_keys": list(result.keys()),
                "has_pdf": "pdf_path" in result
            })

        # Store assistant response
        await save_message(session_id, "assistant", str(result))

        # Enhanced response with agent thinking
        response_data = {
            "result": result,
            "session_id": session_id,
            "verbose_enabled": verbose,
        }

        if verbose:
            response_data["agent_thoughts"] = get_agent_thoughts(session_id)
            response_data["thinking_summary"] = {
                "total_agents_involved": len(set(t["agent"] for t in get_agent_thoughts(session_id))),
                "total_thinking_steps": len(get_agent_thoughts(session_id)),
                "agents": list(set(t["agent"] for t in get_agent_thoughts(session_id)))
            }

        # If a PDF was generated, include its path in the response
        pdf_path = result.get("pdf_path")
        if pdf_path:
            # If not in verbose mode, return PDF directly
            if not verbose:
                return FileResponse(
                    pdf_path,
                    media_type="application/pdf", 
                    filename="report.pdf"
                )
            else:
                # In verbose mode, include PDF path in response for frontend to handle
                response_data["pdf_path"] = pdf_path

        return response_data

    except ValueError as ve:
        if verbose:
            log_agent_thinking(session_id, "ERROR", f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except HTTPException:
        raise
    except Exception as e:
        if verbose:
            log_agent_thinking(session_id, "ERROR", f"Pipeline execution failed: {str(e)}")
        logger.exception("Pipeline failed for query=%s: %s", query, e)
        raise HTTPException(status_code=500, detail="Pipeline execution failed") from e


# --- Streaming endpoint for real-time pipeline execution ---
@app.post("/pipeline/stream", tags=["pipeline"])
async def pipeline_stream_endpoint(
    query: str = Query(..., description="search/topic query for ingestion"),
    title: str = Query("Generated Report", description="report title"),
    audience: str = Query("General", description="target audience"),
) -> StreamingResponse:
    """
    Streaming version of pipeline that shows agent thinking in real-time
    """
    session_id = f"session-stream-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    async def generate_stream():
        try:
            # Clear previous thoughts
            if session_id in agent_thoughts:
                del agent_thoughts[session_id]

            yield f"data: {json.dumps({'type': 'start', 'session_id': session_id})}\n\n"
            
            log_agent_thinking(session_id, "ORCHESTRATOR", "Starting streaming pipeline", {
                "query": query,
                "title": title,
                "audience": audience
            })
            
            # Send initial thinking
            yield f"data: {json.dumps({'type': 'thinking', 'agent': 'ORCHESTRATOR', 'message': 'Starting streaming pipeline'})}\n\n"
            
            input_state = {
                "query": query,
                "title": title,
                "audience": audience,
                "verbose": True,
                "session_id": session_id,
            }
            
            # Execute pipeline with streaming updates
            config = {"configurable": {"thread_id": session_id}}
            result = await pipeline.ainvoke(input_state, config=config)
            
            # Send final result
            yield f"data: {json.dumps({'type': 'result', 'data': result})}\n\n"
            yield f"data: {json.dumps({'type': 'complete', 'session_id': session_id})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )


# --- Callback class for agent thinking (you'll need to implement this based on your LangGraph setup) ---
class AgentThinkingCallback:
    def __init__(self, session_id: str):
        self.session_id = session_id
    
    def on_agent_action(self, agent_name: str, action: str, data: Dict[str, Any] = None):
        """Called when an agent takes an action"""
        log_agent_thinking(self.session_id, agent_name, f"Taking action: {action}", data)
    
    def on_agent_thought(self, agent_name: str, thought: str, data: Dict[str, Any] = None):
        """Called when an agent has a thought/reasoning step"""
        log_agent_thinking(self.session_id, agent_name, thought, data)


# --- Additional debugging endpoints ---
@app.get("/debug/sessions", tags=["debugging"])
async def list_active_sessions() -> Dict[str, Any]:
    """List all active sessions with agent thoughts"""
    return {
        "active_sessions": list(agent_thoughts.keys()),
        "total_sessions": len(agent_thoughts)
    }

@app.get("/debug/pipeline-info", tags=["debugging"]) 
async def get_pipeline_info() -> Dict[str, Any]:
    """Get information about the pipeline structure"""
    # This will need to be customized based on your actual pipeline structure
    return {
        "pipeline_loaded": pipeline is not None,
        "pipeline_type": str(type(pipeline)),
        # Add more pipeline introspection here
    }



class HealthQueryResponse(BaseModel):
    answer: str
    confidence: float
    sources: list
    errors: Optional[list] = None

# Initialize the health agent (you might want to do this as a singleton)
health_agent = HealthAgent()

@app.post("/health-query", response_model=HealthQueryResponse)
async def process_health_query(
    pdf_file: UploadFile = File(...),
    question: str = Form(...),
    user_context: Optional[str] = Form(None),
    user_id: Optional[str] = Form("default_user")
):
    """
    Process a health query with an uploaded PDF file
    """
    try:
        # Save the uploaded PDF temporarily
        pdf_path = f"temp_{pdf_file.filename}"
        with open(pdf_path, "wb") as buffer:
            content = await pdf_file.read()
            buffer.write(content)
        
        # Process the health query using the same logic as test.py
        result = await health_agent.process_health_query(
            pdf_path=pdf_path,
            question=question,
            user_context=user_context or "No additional context provided",
            user_id=user_id
        )
        
        # Clean up the temporary file
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        return HealthQueryResponse(
            answer=result['answer'],
            confidence=result['confidence'],
            sources=result['sources'],
            errors=result.get('errors', [])
        )
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if 'pdf_path' in locals() and os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        raise HTTPException(status_code=500, detail=f"Error processing health query: {str(e)}")



@app.post("/test-health-agent", response_model=HealthQueryResponse)
async def test_health_agent_route(
    pdf_file: UploadFile = File(...),
    question: str = Form("What are the common symptoms of diabetes?"),
    user_context: str = Form("Patient is 45 years old with family history"),
    user_id: str = Form("test_user_001")
):
    """
    Test route that mimics the exact behavior of test.py but with uploaded PDF
    """
    try:
        # Save the uploaded PDF temporarily
        pdf_path = f"temp_test_{pdf_file.filename}"
        with open(pdf_path, "wb") as buffer:
            content = await pdf_file.read()
            buffer.write(content)
        
        # Use the same parameters as in test.py
        result = await health_agent.process_health_query(
            pdf_path=pdf_path,
            question=question,
            user_context=user_context,
            user_id=user_id
        )
        
        # Clean up the temporary file
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        return HealthQueryResponse(
            answer=result['answer'],
            confidence=result['confidence'],
            sources=result['sources'],
            errors=result.get('errors', [])
        )
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if 'pdf_path' in locals() and os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")
    

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


from agents.education.education_agent import education_agent

# Pydantic response model
class EducationResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    errors: List[str]

# Simple route
@app.post("/process-education", response_model=EducationResponse)
async def process_education_pdf(pdf_file: UploadFile = File(...)):
    """
    Simple education processing endpoint
    Upload PDF and get processed results
    """
    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    pdf_path = None
    try:
        # Save uploaded PDF temporarily
        pdf_path = f"temp_education_{pdf_file.filename}"
        with open(pdf_path, "wb") as buffer:
            content = await pdf_file.read()
            buffer.write(content)
        
        # Process with education agent
        result = await education_agent.process_pdf(pdf_path)
        
        return EducationResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Processing failed: {str(e)}"
        )
        
    finally:
        # Clean up temporary file
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)