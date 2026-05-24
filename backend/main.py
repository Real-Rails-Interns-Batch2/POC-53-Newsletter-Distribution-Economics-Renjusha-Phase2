import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.database import db_manager
from routers.intelligence import router as intelligence_router

app = FastAPI(
    title="Newsletter Distribution Economics API",
    description="Analytics and intelligence API for assessing subscriber cohorts, deliverability, and sponsorship yields.",
    version="1.0.0"
)

# CORS Setup - Enable frontend access from any localhost client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    # Trigger DuckDB and schema load
    try:
        db_manager.initialize()
        print("Backend database initialized and loaded on startup.")
    except Exception as e:
        print(f"Error during startup database initialization: {e}. Fallback systems active.")

@app.get("/health")
def health_check():
    return {"status": "online", "database": "active" if db_manager.initialized else "fallback"}

# Include the analytical router
app.include_router(intelligence_router)

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
