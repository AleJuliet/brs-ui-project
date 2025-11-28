from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class Labels(BaseModel):
    """Labels for a capture"""
    validity: Optional[str] = None  # "valid", "invalid", etc.
    color: Optional[str] = None
    shape: Optional[str] = None
    markings: Optional[str] = None


class Manifest(BaseModel):
    """Manifest data stored in manifest.json"""
    capture_id: str
    created_at: datetime
    labeled_at: Optional[datetime] = None
    labels: Optional[Labels] = None
    metadata: Dict[str, Any] = {}


class CaptureSummary(BaseModel):
    """Summary information for a capture"""
    capture_id: str
    date: str
    has_labels: bool
    labeled_at: Optional[datetime] = None
    image_count: int
    has_point_cloud: bool


class CaptureDetail(BaseModel):
    """Detailed information for a capture"""
    capture_id: str
    date: str
    manifest: Optional[Manifest] = None
    images: Dict[str, str]  # camera_id -> relative_path
    point_cloud_exists: bool
    point_cloud_path: Optional[str] = None


class PointCloudInfo(BaseModel):
    """Point cloud information"""
    exists: bool
    num_points: Optional[int] = None
    file_size: Optional[int] = None