from pathlib import Path

# Configuration for Sorty results
RESULTS_ROOT = Path("/Users/dkaleper/Documents/Miscellaneous Resources/Code Projects/brs-ui-project/test_data/out/results")  # Change this path as needed

# API Configuration
API_HOST = "127.0.0.1"
API_PORT = 8000

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",   # React development server
    "http://127.0.0.1:3000",
    "http://localhost:5173",   # Vite default port
    "http://localhost:5174",   # Vite alternative port
    "http://localhost:5175",   # Vite alternative port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]