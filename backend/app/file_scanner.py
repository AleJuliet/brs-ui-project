import os
from pathlib import Path
from typing import List, Optional
import re
import numpy as np

from .config import RESULTS_ROOT
from .models import CaptureSummary, CaptureDetail
from .manifest import load_manifest


def get_available_dates() -> List[str]:
    """Get list of available dates from results folder"""
    if not RESULTS_ROOT.exists():
        return []
    
    dates = []
    for item in RESULTS_ROOT.iterdir():
        if item.is_dir() and re.match(r'\d{4}-\d{2}-\d{2}', item.name):
            dates.append(item.name)
    
    return sorted(dates, reverse=True)  # Most recent first


def get_captures_for_date(date: str) -> List[CaptureSummary]:
    """Get all captures for a specific date"""
    date_path = RESULTS_ROOT / date
    
    if not date_path.exists():
        return []
    
    captures = []
    for item in date_path.iterdir():
        if item.is_dir():
            capture_summary = _create_capture_summary(item, date)
            if capture_summary:
                captures.append(capture_summary)
    
    return sorted(captures, key=lambda x: x.capture_id)


def get_capture_detail(date: str, capture_id: str) -> Optional[CaptureDetail]:
    """Get detailed information for a specific capture"""
    capture_path = RESULTS_ROOT / date / capture_id
    
    if not capture_path.exists():
        return None
    
    # Load manifest if exists
    manifest = load_manifest(capture_path)
    
    # Find images
    images = {}
    for camera in ['CAM1', 'CAM2', 'CAM3']:
        image_file = capture_path / f"{camera}.png"
        if image_file.exists():
            images[camera] = f"/api/dates/{date}/captures/{capture_id}/image/{camera}"
    
    # Check for point cloud
    point_cloud_file = capture_path / "point_cloud.npy"
    point_cloud_exists = point_cloud_file.exists()
    point_cloud_path = f"/api/dates/{date}/captures/{capture_id}/point_cloud/info" if point_cloud_exists else None
    
    return CaptureDetail(
        capture_id=capture_id,
        date=date,
        manifest=manifest,
        images=images,
        point_cloud_exists=point_cloud_exists,
        point_cloud_path=point_cloud_path
    )


def _create_capture_summary(capture_path: Path, date: str) -> Optional[CaptureSummary]:
    """Create a capture summary from a capture folder"""
    capture_id = capture_path.name
    
    # Count images
    image_count = 0
    for camera in ['CAM1', 'CAM2', 'CAM3']:
        if (capture_path / f"{camera}.png").exists():
            image_count += 1
    
    # Check for point cloud
    has_point_cloud = (capture_path / "point_cloud.npy").exists()
    
    # Load manifest to check labels
    manifest = load_manifest(capture_path)
    has_labels = manifest is not None and manifest.labels is not None
    labeled_at = manifest.labeled_at if manifest else None
    
    return CaptureSummary(
        capture_id=capture_id,
        date=date,
        has_labels=has_labels,
        labeled_at=labeled_at,
        image_count=image_count,
        has_point_cloud=has_point_cloud
    )


def get_image_path(date: str, capture_id: str, camera_id: str) -> Optional[Path]:
    """Get the full path to an image file"""
    if camera_id not in ['CAM1', 'CAM2', 'CAM3']:
        return None
    
    image_path = RESULTS_ROOT / date / capture_id / f"{camera_id}.png"
    return image_path if image_path.exists() else None


def get_point_cloud_path(date: str, capture_id: str) -> Optional[Path]:
    """Get the full path to a point cloud file"""
    pc_path = RESULTS_ROOT / date / capture_id / "point_cloud.npy"
    return pc_path if pc_path.exists() else None

def get_brick_info_path(date: str, capture_id: str) -> Optional[Path]:
    """Get the full path to the brick_info.txt file"""
    info_path = RESULTS_ROOT / date / capture_id / "brick_info.txt"
    return info_path if info_path.exists() else None

## I want to create an endpoint that downsamples the point cloud and returns the downsampled data as a list of points.
def downsample_point_cloud(date: str, capture_id: str, voxel_size: float = 0.1) -> Optional[List[List[float]]]:
    """Downsample the point cloud and return as a list of points"""
    pc_path = RESULTS_ROOT / date / capture_id / "point_cloud.npy"
    max_points = 10000  # Limit number of points for browser visualization
    
    if not pc_path.exists():
        return None

    # Load point cloud
    pc = np.load(pc_path)
    mask = pc[:, 2] > 1.5
    pc = pc[mask]

    # Optionally downsample here...
    #pc = pc[::downsample]

    # Convert to list format for JSON
    points_list = pc.tolist()

    # Convert to normal Python list for JSON
    return {"points": points_list}