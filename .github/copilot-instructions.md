# BRS Classification Review Tool - Project Instructions

This is a monorepo containing a FastAPI backend and React TypeScript frontend for reviewing LEGO brick classification results from the Sorty machine.

## Project Structure
- `backend/` - FastAPI application for serving data and managing labels
- `frontend/` - React TypeScript application with Material-UI for the review interface

## Key Features
- Review LEGO brick images (CAM1, CAM2, CAM3) and point clouds
- Manual verification of classification predictions
- Date-based navigation of capture results
- Labeling interface for validity, color, shape, and markings

## Development Guidelines
- Backend uses FastAPI with Pydantic models
- Frontend uses React with TypeScript and Material-UI
- Configuration allows easy changes to Sorty results root path
- Manifest.json files track labeling status per capture

## Quick Start
1. Backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. Frontend: `cd frontend && npm run dev`
3. Open http://localhost:5174 for the UI
4. Sample data is available in `sample_data/out/results/`

## Project Status: ✅ COMPLETE
- ✅ Backend API with FastAPI
- ✅ Frontend UI with React + TypeScript + Material-UI
- ✅ Sample data generated
- ✅ Both servers running and tested
- ✅ CORS configured
- ✅ All endpoints implemented