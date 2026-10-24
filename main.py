import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .schemas import (
    HealthResponse, SafetyRequest, SafetyResponse, CrackResponse,
    ValuationRequest, ValuationResponse, PlanRequest, PlanResponse,
    DailyAssistantRequest, DailyAssistantResponse, WeatherRequest,
    WeatherResponse, KnowledgeRequest, KnowledgeResponse
)
from .services.ai_service import (
    safety_review, crack_review, make_plan, daily_assistant,
    weather_advice, knowledge_answer
)

load_dotenv()
app = FastAPI(
    title=os.getenv("APP_NAME", "Construction Intelligence API"),
    description="Demo-mode API for a multimodal construction decision-support platform.",
    version="1.0.0"
)
origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "8"))
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

@app.get("/", response_model=HealthResponse)
def root():
    return HealthResponse(status="ok", message="Construction Intelligence API is running.")

@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", message="Backend is healthy.")

@app.post("/api/safety/review", response_model=SafetyResponse)
def safety(payload: SafetyRequest):
    return safety_review(payload)

@app.post("/api/safety/analyze-image", response_model=SafetyResponse)
async def safety_image(file: UploadFile = File(...)):
    content = await read_image(file)
    # Image bytes are validated but not stored; the default project is demo mode.
    return safety_review(SafetyRequest(site_notes=f"Image uploaded: {file.filename}. Image size: {len(content)} bytes."))

@app.post("/api/cracks/analyze", response_model=CrackResponse)
async def cracks(file: UploadFile = File(...)):
    content = await read_image(file)
    return crack_review(file.filename or "uploaded-image", len(content))

async def read_image(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG, or WEBP image.")
    limit = MAX_UPLOAD_MB * 1024 * 1024
    content = await file.read(limit + 1)
    if len(content) > limit:
        raise HTTPException(status_code=413, detail=f"Image must be {MAX_UPLOAD_MB} MB or smaller.")
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return content

@app.post("/api/valuation/estimate", response_model=ValuationResponse)
def valuation(payload: ValuationRequest):
    # Illustrative rate; replace with reliable local market data before real-world use.
    rate = payload.rate_per_sqft or 4500
    base = payload.area_sqft * rate
    location_factor = {"prime": 1.25, "standard": 1.0, "developing": 0.82}[payload.location_category]
    age_factor = max(0.65, 1 - payload.property_age_years * 0.01)
    estimated = round(base * location_factor * age_factor)
    return ValuationResponse(
        estimated_price=estimated,
        currency="INR",
        assumptions=[
            f"Illustrative base rate: ₹{rate:,.0f} per sq ft",
            f"Location category multiplier: {location_factor}",
            f"Age adjustment multiplier: {age_factor:.2f}",
            "Not a formal valuation; verify using current local comparable sales and a qualified valuer."
        ],
        demo_mode=True
    )

@app.post("/api/planning/generate", response_model=PlanResponse)
def planning(payload: PlanRequest):
    return make_plan(payload)

@app.post("/api/site/daily-assistant", response_model=DailyAssistantResponse)
def site_daily(payload: DailyAssistantRequest):
    return daily_assistant(payload)

@app.post("/api/weather/advice", response_model=WeatherResponse)
def weather(payload: WeatherRequest):
    return weather_advice(payload)

@app.post("/api/knowledge/ask", response_model=KnowledgeResponse)
def knowledge(payload: KnowledgeRequest):
    return knowledge_answer(payload)
