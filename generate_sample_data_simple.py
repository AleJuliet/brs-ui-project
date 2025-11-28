#!/usr/bin/env python3
"""
Sample data generator for BRS Classification Review Tool.
Creates test data structure with sample images and manifests.
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np

# Sample data configuration
SAMPLE_DATA_ROOT = Path("./sample_data/out/results")
DATES = ["2025-11-15", "2025-11-16", "2025-11-17"]
CAPTURES_PER_DATE = 5

def create_sample_point_cloud(num_points=1000):
    """Create a sample point cloud"""
    # Generate random 3D points
    points = np.random.rand(num_points, 3) * 10  # Scale to 0-10 range
    return points

def create_sample_brick_info():
    """Create sample brick info text"""
    return """Brick Classification Results
Timestamp: {}
Predicted Class: LEGO Brick 2x4
Confidence: 0.87
Color Prediction: Red
Shape: Rectangular
""".format(datetime.now().isoformat())

def create_sample_manifest(capture_id, has_labels=False):
    """Create a sample manifest"""
    manifest = {
        "capture_id": capture_id,
        "created_at": datetime.now().isoformat(),
        "metadata": {}
    }
    
    if has_labels:
        manifest["labeled_at"] = (datetime.now() + timedelta(minutes=30)).isoformat()
        manifest["labels"] = {
            "validity": "valid",
            "color": "red",
            "shape": "brick",
            "markings": "LEGO logo"
        }
    
    return manifest

def generate_sample_data():
    """Generate complete sample data structure"""
    print(f"Creating sample data in {SAMPLE_DATA_ROOT}")
    
    for date in DATES:
        date_path = SAMPLE_DATA_ROOT / date
        date_path.mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {date_path}")
        
        for i in range(CAPTURES_PER_DATE):
            # Create capture folder with timestamp-like name
            hour = 9 + i
            minute = i * 10
            capture_id = f"{hour:02d}_{minute:02d}_{i:02d}_{42+i}"
            capture_path = date_path / capture_id
            capture_path.mkdir(exist_ok=True)
            
            # Create empty image placeholders (we'll skip actual images for now)
            for camera in ["CAM1", "CAM2", "CAM3"]:
                img_path = capture_path / f"{camera}.png"
                img_path.touch()
            
            # Create sample point cloud
            pc = create_sample_point_cloud()
            pc_path = capture_path / "point_cloud.npy"
            np.save(pc_path, pc)
            
            # Create brick info
            info_path = capture_path / "brick_info.txt"
            with open(info_path, 'w') as f:
                f.write(create_sample_brick_info())
            
            # Create manifest (some with labels, some without)
            has_labels = i < 2  # First 2 captures have labels
            manifest = create_sample_manifest(capture_id, has_labels)
            manifest_path = capture_path / "manifest.json"
            with open(manifest_path, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            print(f"Created capture: {date}/{capture_id}")
    
    print(f"\nSample data generation complete!")
    print(f"Update the RESULTS_ROOT in backend/app/config.py to:")
    print(f'RESULTS_ROOT = Path("{SAMPLE_DATA_ROOT.absolute()}")')
    print(f"\nGenerated structure:")
    for date in DATES:
        date_path = SAMPLE_DATA_ROOT / date
        captures = list(date_path.iterdir()) if date_path.exists() else []
        print(f"  {date}/ ({len(captures)} captures)")

if __name__ == "__main__":
    print("Starting sample data generation...")
    generate_sample_data()