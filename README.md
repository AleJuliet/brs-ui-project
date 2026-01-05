# BRS Classification Review Tool

A web-based application for reviewing and labeling LEGO brick classification results from the Sorty machine. This tool provides an intuitive interface to navigate captures by date, view multi-camera images and point clouds, and manually verify classification predictions.

## 🎯 Features

- **Date-based Navigation**: Browse captures organized by date
- **Multi-camera Image Viewing**: View CAM1, CAM2, and CAM3 images for each brick capture
- **Point Cloud Support**: Display point cloud information including point count and file size
- **Manual Labeling Interface**: Add labels for:
  - Validity (valid/invalid)
  - Color
  - Shape
  - Markings
- **Progress Tracking**: Visual indicators show which captures have been labeled
- **Efficient Workflow**: Save labels and automatically move to the next capture

## 📁 Project Structure

```
brs-ui-project/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application & routes
│   │   ├── models.py          # Pydantic data models
│   │   ├── manifest.py        # Manifest file handling
│   │   ├── file_scanner.py    # File system scanning logic
│   │   └── config.py          # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   └── venv/                  # Python virtual environment
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── BRSApp.tsx    # Main application component
│   │   │   ├── MainContent.tsx # Capture detail view
│   │   │   └── FilterSection.tsx # Date filter sidebar
│   │   ├── services/
│   │   │   └── api.ts        # API service layer
│   │   ├── types/
│   │   │   └── api.ts        # TypeScript type definitions
│   │   └── App.tsx           # Root component
│   ├── package.json
│   └── tsconfig.json
├── sample_data/               # Generated sample data
│   └── out/results/
│       ├── 2025-11-15/
│       ├── 2025-11-16/
│       └── 2025-11-17/
├── generate_sample_data.py    # Sample data generator
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** and npm (for frontend)
- **Git** (optional, for version control)

### 1. Generate Sample Data (Optional)

To test the application with sample data:

```bash
# Install Python dependencies for sample data generation
pip install numpy Pillow

# Generate sample data
python generate_sample_data.py
```

This creates a sample data structure in `sample_data/out/results/` with:
- 3 dates (2025-11-15, 2025-11-16, 2025-11-17)
- 5 captures per date
- Sample images (CAM1, CAM2, CAM3)
- Point cloud files
- Some pre-labeled captures

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Python 3.11 is needed for this, VTK doesnt dupport a higher version of Python
brew install python@3.11

# Create and activate virtual environment
python3.11 -m venv venv

source venv/bin/activate  # On Windows: venv\Scripts\activate

# Verify Python version
python --version  # Should show Python 3.11.x


# Install dependencies
pip3.11 install -r requirements.txt

# Configure the results path (if using custom data)
# Edit backend/app/config.py and set RESULTS_ROOT to your data path

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend API will be available at `http://127.0.0.1:8000`

API documentation available at `http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5174`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5174`

## 📊 Data Structure

The application expects data in the following folder structure:

```
out/results/
├── YYYY-MM-DD/                # Date folder (e.g., 2025-11-15)
│   ├── HH_MM_SS_ID/          # Capture folder (e.g., 10_00_08_42)
│   │   ├── CAM1.png          # Camera 1 image
│   │   ├── CAM2.png          # Camera 2 image
│   │   ├── CAM3.png          # Camera 3 image
│   │   ├── point_cloud.npy   # Point cloud data (NumPy format)
│   │   ├── brick_info.txt    # Classification info (optional)
│   │   └── manifest.json     # Labels (created by this tool)
│   └── HH_MM_SS_ID/
│       └── ...
└── YYYY-MM-DD/
    └── ...
```

### Manifest File Format

The `manifest.json` file is automatically created and updated by the tool:

```json
{
  "capture_id": "10_00_08_42",
  "created_at": "2025-11-17T10:30:00",
  "labeled_at": "2025-11-17T11:45:00",
  "labels": {
    "validity": "valid",
    "color": "red",
    "shape": "brick",
    "markings": "LEGO logo"
  },
  "metadata": {}
}
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/app/config.py`:

```python
# Path to your Sorty results folder
RESULTS_ROOT = Path("/path/to/your/sorty/out/results")

# API server settings
API_HOST = "127.0.0.1"
API_PORT = 8000

# CORS origins (add your frontend URL if different)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    # Add more origins as needed
]
```

### Frontend