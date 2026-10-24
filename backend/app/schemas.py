from typing import List, Literal
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: Literal["ok"]
    message: str

class SafetyRequest(BaseModel):
    site_notes: str = Field(default="", max_length=3000)
    workers_present: bool = True
    helmets_confirmed: bool = False
    high_visibility_vests_confirmed: bool = False
    fall_protection_needed: bool = False
    fall_protection_confirmed: bool = False
    housekeeping_ok: bool = False

class SafetyResponse(BaseModel):
    status: Literal["demo_review"]
    risk_level: Literal["low", "medium", "high", "unknown"]
    findings: List[str]
    recommended_actions: List[str]
    disclaimer: str

class CrackResponse(BaseModel):
    status: Literal["demo_review"]
    filename: str
    uploaded_bytes: int
    preliminary_observation: str
    recommended_next_steps: List[str]
    disclaimer: str

class ValuationRequest(BaseModel):
    area_sqft: float = Field(gt=0, le=10000000)
    property_age_years: int = Field(default=0, ge=0, le=200)
    location_category: Literal["prime", "standard", "developing"] = "standard"
    rate_per_sqft: float | None = Field(default=None, gt=0, le=10000000)

class ValuationResponse(BaseModel):
    estimated_price: int
    currency: Literal["INR"]
    assumptions: List[str]
    demo_mode: bool

class PlanRequest(BaseModel):
    project_type: str = Field(min_length=2, max_length=100)
    duration_days: int = Field(gt=0, le=3650)
    budget_inr: float = Field(gt=0)
    project_notes: str = Field(default="", max_length=3000)

class PlanTask(BaseModel):
    day_range: str
    task: str
    deliverable: str

class PlanResponse(BaseModel):
    project_type: str
    duration_days: int
    budget_inr: float
    tasks: List[PlanTask]
    assumptions: List[str]
    demo_mode: bool

class DailyAssistantRequest(BaseModel):
    progress_notes: str = Field(min_length=2, max_length=3000)
    blockers: str = Field(default="", max_length=2000)

class DailyAssistantResponse(BaseModel):
    summary: str
    next_steps: List[str]
    items_to_escalate: List[str]
    demo_mode: bool

class WeatherRequest(BaseModel):
    condition: Literal["clear", "hot", "rain", "thunderstorm", "strong_wind", "extreme_heat"]
    planned_work: str = Field(min_length=2, max_length=200)

class WeatherResponse(BaseModel):
    condition: str
    advice: List[str]
    live_weather_used: bool
    disclaimer: str

class KnowledgeRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)

class KnowledgeResponse(BaseModel):
    answer: str
    checklist: List[str]
    demo_mode: bool
    disclaimer: str
