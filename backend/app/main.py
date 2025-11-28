from fastapi import FastAPI, HTTPException, Path as FastAPIPath
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from PIL import Image
import numpy as np
import io

from .config import CORS_ORIGINS
from .models import CaptureSummary, CaptureDetail, Labels, PointCloudInfo
from .file_scanner import (
    get_available_dates,
    get_captures_for_date,
    get_capture_detail,
    get_image_path,
    get_point_cloud_path,
    get_brick_info_path
)
from .manifest import create_or_update_manifest

app = FastAPI(title="BRS Classification Review Tool", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "BRS Classification Review Tool API"}


@app.get("/api/dates", response_model=List[str])
async def get_dates():
    """Get list of available dates"""
    return get_available_dates()


@app.get("/api/dates/{date}/captures", response_model=List[CaptureSummary])
async def get_date_captures(date: str = FastAPIPath(..., description="Date in YYYY-MM-DD format")):
    """Get all captures for a specific date"""
    captures = get_captures_for_date(date)
    if not captures and date not in get_available_dates():
        raise HTTPException(status_code=404, detail=f"Date {date} not found")
    return captures


@app.get("/api/dates/{date}/captures/{capture_id}", response_model=CaptureDetail)
async def get_capture(
    date: str = FastAPIPath(..., description="Date in YYYY-MM-DD format"),
    capture_id: str = FastAPIPath(..., description="Capture ID")
):
    """Get detailed information for a specific capture"""
    capture = get_capture_detail(date, capture_id)
    if not capture:
        raise HTTPException(status_code=404, detail=f"Capture {capture_id} not found for date {date}")
    return capture


@app.put("/api/dates/{date}/captures/{capture_id}/labels")
async def update_labels(
    labels: Labels,
    date: str = FastAPIPath(..., description="Date in YYYY-MM-DD format"),
    capture_id: str = FastAPIPath(..., description="Capture ID")
):
    """Update labels for a capture"""
    from .config import RESULTS_ROOT
    
    capture_path = RESULTS_ROOT / date / capture_id
    if not capture_path.exists():
        raise HTTPException(status_code=404, detail=f"Capture {capture_id} not found for date {date}")
    
    try:
        manifest = create_or_update_manifest(capture_path, capture_id, labels)
        return {"message": "Labels updated successfully", "labeled_at": manifest.labeled_at}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update labels: {str(e)}")


@app.get("/api/dates/{date}/captures/{capture_id}/image/{camera_id}")
async def get_image(
    date: str = FastAPIPath(..., description="Date in YYYY-MM-DD format"),
    capture_id: str = FastAPIPath(..., description="Capture ID"),
    camera_id: str = FastAPIPath(..., description="Camera ID (CAM1, CAM2, or CAM3)")
):
    """Serve image files, converting and stretching histogram for visibility"""
    image_path = get_image_path(date, capture_id, camera_id)
    if not image_path:
        raise HTTPException(status_code=404, detail=f"Image {camera_id} not found for capture {capture_id}")
    
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Handle RGB/RGBA by taking first channel (grayscale stored in all channels)
        if img_array.ndim == 3:
            img_array = img_array[:, :, 0]
        
        # Convert to float for processing
        img_array = img_array.astype(np.float32)
        
        # Stretch histogram from actual min/max to full 0-255 range
        img_min = img_array.min()
        img_max = img_array.max()
        
        if img_max > img_min:
            # Stretch values from [min, max] to [0, 255]
            img_array = ((img_array - img_min) / (img_max - img_min) * 255.0)
        else:
            # All pixels same value, make them mid-gray
            img_array = np.full_like(img_array, 128.0)
        
        # Convert to uint8
        img_array = np.clip(img_array, 0, 255).astype(np.uint8)
        
        # Convert back to PIL Image
        img = Image.fromarray(img_array, mode='L')
        
        # Save to bytes buffer
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@app.get("/api/dates/{date}/captures/{capture_id}/brick_info")
async def get_brick_info(
    date: str = FastAPIPath(..., description="Date in YYYY-MM-DD format"),
    capture_id: str = FastAPIPath(..., description="Capture ID")
):
    # Construct path to brick_info.txt
    brick_info_path = get_brick_info_path(date, capture_id)
    
    if not brick_info_path.exists():
        raise HTTPException(status_code=404, detail=f"brick_info.txt not found for capture {capture_id}")
    
    try:
        with open(brick_info_path, 'r') as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read brick_info.txt: {str(e)}")


@app.get("/api/dates/{date}/captures/{capture_id}/point_cloud/info", response_model=PointCloudInfo)
async def get_point_cloud_info(
    date: str = FastAPIPath(..., description="Date in YYYY-MM-DD format"),
    capture_id: str = FastAPIPath(..., description="Capture ID")
):
    """Get point cloud information"""
    pc_path = get_point_cloud_path(date, capture_id)
    if not pc_path:
        return PointCloudInfo(exists=False)
    
    try:
        # Load point cloud to get info
        point_cloud = np.load(pc_path)
        num_points = len(point_cloud) if point_cloud.ndim > 0 else 0
        file_size = pc_path.stat().st_size
        
        return PointCloudInfo(
            exists=True,
            num_points=num_points,
            file_size=file_size
        )
    except Exception as e:
        return PointCloudInfo(exists=True, num_points=None, file_size=pc_path.stat().st_size)


if __name__ == "__main__":
    import uvicorn
    from .config import API_HOST, API_PORT
    uvicorn.run(app, host=API_HOST, port=API_PORT)