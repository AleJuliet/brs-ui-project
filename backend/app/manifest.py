import json
from pathlib import Path
from datetime import datetime
from typing import Optional

from .models import Manifest, Labels


def load_manifest(capture_path: Path) -> Optional[Manifest]:
    """Load manifest from capture folder"""
    manifest_file = capture_path / "manifest.json"
    
    if not manifest_file.exists():
        return None
    
    try:
        with open(manifest_file, 'r') as f:
            data = json.load(f)
        return Manifest(**data)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error loading manifest from {manifest_file}: {e}")
        return None


def create_or_update_manifest(capture_path: Path, capture_id: str, labels: Labels) -> Manifest:
    """Create or update manifest with new labels"""
    manifest_file = capture_path / "manifest.json"
    
    # Load existing manifest or create new one
    if manifest_file.exists():
        manifest = load_manifest(capture_path)
        if manifest is None:
            # Create new if loading failed
            manifest = Manifest(
                capture_id=capture_id,
                created_at=datetime.now(),
                labels=labels
            )
        else:
            # Update existing
            manifest.labels = labels
            manifest.labeled_at = datetime.now()
    else:
        # Create new manifest
        manifest = Manifest(
            capture_id=capture_id,
            created_at=datetime.now(),
            labels=labels,
            labeled_at=datetime.now()
        )
    
    # Save manifest
    save_manifest(manifest_file, manifest)
    return manifest


def save_manifest(manifest_file: Path, manifest: Manifest) -> None:
    """Save manifest to file"""
    manifest_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Convert to dict for JSON serialization
    data = manifest.model_dump()
    # Handle datetime serialization
    if data.get('created_at'):
        data['created_at'] = data['created_at'].isoformat()
    if data.get('labeled_at'):
        data['labeled_at'] = data['labeled_at'].isoformat()
    
    with open(manifest_file, 'w') as f:
        json.dump(data, f, indent=2)