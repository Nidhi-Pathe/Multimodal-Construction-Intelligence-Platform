# AI-Powered Multimodal Construction Intelligence Platform

A runnable full-stack starter project:
- Frontend: React + Vite
- Backend: FastAPI + Pydantic
- Features: safety checklist, crack-image preliminary review, property valuation estimate, project planning, daily site assistant, weather advisory, construction knowledge assistant
- Strict JSON API responses
- Runs locally on Windows using Command Prompt

## Requirements
- Python 3.10+ recommended
- Node.js LTS (includes npm)
- Git optional

## 1. Start the backend (Command Prompt)
Open CMD and run:
```bat
cd path\to\Construction_Intelligence_Platform\backend
py -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```
Backend: http://127.0.0.1:8000
API docs: http://127.0.0.1:8000/docs

If `py` is not recognized, try `python` instead. Keep this CMD window open.

## 2. Start the frontend
Open a SECOND Command Prompt window:
```bat
cd path\to\Construction_Intelligence_Platform\frontend
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## 3. How the AI works in this starter
This project works without an API key using transparent demo-mode responses. The image review is a preliminary heuristic/demo, not a trained computer-vision model. To use a real multimodal LLM, configure a provider in `backend/.env` and implement the provider call in `backend/app/services/ai_service.py`. Do not claim that the demo detects every crack or safety violation.

## Features included
1. Construction safety review (demo checklist + uploaded image metadata)
2. Crack image preliminary review (demo only)
3. Property valuation calculator (user inputs + configurable illustrative rate)
4. Construction project plan generator
5. Daily site assistant
6. Weather-aware advisory (user-entered conditions; no live weather API in demo)
7. Construction knowledge assistant
8. FastAPI health check and strict response models

## Notes
- Uploads are size-limited and checked for image MIME type.
- The demo does not store uploaded images permanently.
- Do not upload confidential construction-site photos.
- AI output is decision support only; qualified professionals must verify safety and structural assessments.
