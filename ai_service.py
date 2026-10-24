from ..schemas import (
    SafetyRequest, SafetyResponse, CrackResponse, PlanRequest, PlanResponse,
    PlanTask, DailyAssistantRequest, DailyAssistantResponse, WeatherRequest,
    WeatherResponse, KnowledgeRequest, KnowledgeResponse
)

DISCLAIMER = "Demo decision-support output only. A qualified construction/safety professional must verify all findings."

def safety_review(p: SafetyRequest) -> SafetyResponse:
    findings = []
    actions = []
    if p.workers_present and not p.helmets_confirmed:
        findings.append("Helmet use has not been confirmed from the supplied checklist.")
        actions.append("Verify helmet use for every worker in the active work zone.")
    if p.workers_present and not p.high_visibility_vests_confirmed:
        findings.append("High-visibility vest use has not been confirmed.")
        actions.append("Check required high-visibility PPE.")
    if p.fall_protection_needed and not p.fall_protection_confirmed:
        findings.append("Fall protection is marked as needed but not confirmed.")
        actions.append("Pause affected elevated work until suitable fall protection is verified.")
    if not p.housekeeping_ok:
        findings.append("Housekeeping status is not confirmed as acceptable.")
        actions.append("Inspect walkways and remove trip hazards safely.")
    if p.site_notes.strip():
        findings.append("Site notes were supplied; review them during the site inspection.")
    if p.fall_protection_needed and not p.fall_protection_confirmed:
        risk = "high"
    elif findings:
        risk = "medium"
    else:
        risk = "low"
        findings.append("No checklist concerns were reported; this is not proof that the site is safe.")
    if not actions:
        actions.append("Continue routine documented inspections and follow the site's approved safety plan.")
    return SafetyResponse(status="demo_review", risk_level=risk, findings=findings, recommended_actions=actions, disclaimer=DISCLAIMER)

def crack_review(filename: str, size: int) -> CrackResponse:
    return CrackResponse(
        status="demo_review",
        filename=filename,
        uploaded_bytes=size,
        preliminary_observation="The image was received, but this demo has no trained vision model and cannot determine whether a crack exists or how severe it is.",
        recommended_next_steps=[
            "Have a qualified engineer inspect the location in person.",
            "Record crack location, length, width, direction, and whether it is changing over time.",
            "If there are signs of sudden movement, falling material, or immediate danger, restrict access and contact the responsible professional."
        ],
        disclaimer=DISCLAIMER
    )

def make_plan(p: PlanRequest) -> PlanResponse:
    d = p.duration_days
    points = [
        ("Scope and site assessment", "Confirm scope, site constraints, drawings, permits, and responsibilities."),
        ("Design and procurement", "Review drawings, quantities, suppliers, and long-lead materials."),
        ("Site preparation", "Set up access, temporary facilities, safety controls, and layout."),
        ("Execution and quality checks", "Sequence work packages and document inspections and hold points."),
        ("Testing and handover", "Complete punch list, required tests, documentation, and handover.")
    ]
    tasks = []
    for i, (task, deliverable) in enumerate(points):
        start = (d * i) // len(points) + 1
        end = max(start, (d * (i + 1)) // len(points))
        tasks.append(PlanTask(day_range=f"Day {start}-{end}", task=task, deliverable=deliverable))
    return PlanResponse(
        project_type=p.project_type, duration_days=d, budget_inr=p.budget_inr, tasks=tasks,
        assumptions=[
            "This is a high-level illustrative sequence, not an engineered schedule.",
            "Budget, local code, design, procurement lead times, labour, and site conditions require professional review.",
            f"Project notes considered: {p.project_notes.strip() or 'None supplied'}"
        ], demo_mode=True
    )

def daily_assistant(p: DailyAssistantRequest) -> DailyAssistantResponse:
    blockers = p.blockers.strip()
    return DailyAssistantResponse(
        summary=f"Daily progress notes received: {p.progress_notes.strip()}",
        next_steps=[
            "Compare completed work with the approved daily plan.",
            "Record quantities, photos, inspections, and responsible persons.",
            "Confirm tomorrow's materials, equipment, access, and safety briefing."
        ],
        items_to_escalate=[blockers] if blockers else ["No blockers were entered; confirm this with the site supervisor."],
        demo_mode=True
    )

def weather_advice(p: WeatherRequest) -> WeatherResponse:
    advice = {
        "clear": ["Check heat, hydration, wind, and the actual site forecast before starting.", "Follow the approved lift and work-at-height plans."],
        "hot": ["Provide drinking water, shade, and rest breaks under the site heat-stress plan.", "Monitor workers for heat illness and follow site emergency procedures."],
        "extreme_heat": ["Review whether outdoor work should be rescheduled under local rules and the site heat plan.", "Provide water, shade, acclimatization, and trained supervision."],
        "rain": ["Reassess access, slippery surfaces, electrical exposure, excavations, and concrete work.", "Resume only when conditions and the approved method statement allow."],
        "thunderstorm": ["Stop exposed outdoor work and crane/lifting activity as required by the site emergency plan.", "Move to a designated safe shelter; do not shelter under isolated trees or near exposed metal."],
        "strong_wind": ["Reassess cranes, scaffolds, temporary structures, sheet materials, and work at height.", "Follow manufacturer limits and the site's wind-stop criteria."]
    }[p.condition]
    return WeatherResponse(condition=p.condition, advice=advice + [f"Planned work: {p.planned_work}"], live_weather_used=False, disclaimer="No live weather data was checked. Confirm official forecasts and site-specific stop-work thresholds.")

def knowledge_answer(p: KnowledgeRequest) -> KnowledgeResponse:
    q = p.question.lower()
    if any(word in q for word in ["crack", "structural"]):
        answer = "Crack appearance alone is not enough to establish structural safety. Record location and change over time, check for related movement or water ingress, and obtain a qualified engineer's assessment."
        checklist = ["Photograph with a scale and date", "Record location and dimensions", "Restrict access if there are signs of immediate danger", "Escalate to a qualified engineer"]
    elif any(word in q for word in ["helmet", "ppe", "safety", "fall"]):
        answer = "Use the approved site safety plan and applicable local regulations. Verify task-specific PPE, access controls, training, equipment inspection, and emergency arrangements."
        checklist = ["Pre-task risk assessment", "Correct PPE", "Competent supervision", "Documented inspection", "Emergency plan"]
    elif any(word in q for word in ["concrete", "curing"]):
        answer = "Concrete placement and curing depend on the approved mix design, specifications, weather, and engineer's instructions. Follow the project method statement and record placement and curing conditions."
        checklist = ["Verify approved mix and delivery", "Inspect formwork and reinforcement", "Record placement conditions", "Follow specified curing method", "Complete required testing"]
    else:
        answer = "Use the latest approved drawings, project specifications, method statements, and local building rules. Confirm uncertain decisions with the responsible qualified professional."
        checklist = ["Check approved documents", "Identify site-specific hazards", "Record the decision and responsible person", "Escalate technical uncertainty"]
    return KnowledgeResponse(answer=answer, checklist=checklist, demo_mode=True, disclaimer=DISCLAIMER)
