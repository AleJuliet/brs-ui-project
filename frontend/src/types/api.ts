export interface Labels {
  validity?: string;
  color?: string;
  shape?: string;
  markings?: string;
  correctColor?: boolean;
  correctShape?: boolean;
}

export interface Manifest {
  capture_id: string;
  created_at: string;
  labeled_at?: string;
  labels?: Labels;
  metadata?: Record<string, any>;
}

export interface CaptureSummary {
  capture_id: string;
  date: string;
  has_labels: boolean;
  labeled_at?: string;
  image_count: number;
  has_point_cloud: boolean;
}

export interface BrickInfo {
  trigger_id: string;
  color_prediction: string;
  color_rgb: number[]; // [R, G, B]
  photo_timestamp: string;
  brick_id: string;
  laser_timestamp: string;
  super_id: string;
  bucket_number: string;
}

export interface CaptureDetail {
  capture_id: string;
  date: string;
  manifest?: Manifest;
  images: Record<string, string>;
  point_cloud_exists: boolean;
  point_cloud_path?: string;
}

export interface PointCloudInfo {
  exists: boolean;
  num_points?: number;
  file_size?: number;
}