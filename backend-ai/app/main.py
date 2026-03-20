from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.agno_service import generate_response_agno

app = FastAPI(title="E-Web Chatbot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production to exact address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    try:
        response_data = await generate_response_agno(
            session_id=request.session_id,
            message=request.message
        )
        return {
            "status": "success", 
            "reply": response_data["content"],
            "products": response_data["products"]
        }
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
def health_check():
    return {"status": "alive", "message": "FastAPI AI Chatbot is running"}
