import { CaptureSummary, CaptureDetail, Labels, PointCloudInfo } from '../types/api';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error}`);
  }
}

export const apiService = {
  // Get all available dates
  async getDates(): Promise<string[]> {
    return fetchApi<string[]>('/dates');
  },

  // Get captures for a specific date
  async getCaptures(date: string): Promise<CaptureSummary[]> {
    return fetchApi<CaptureSummary[]>(`/dates/${date}/captures`);
  },

  // Get detailed capture information
  async getCaptureDetail(date: string, captureId: string): Promise<CaptureDetail> {
    return fetchApi<CaptureDetail>(`/dates/${date}/captures/${captureId}`);
  },

  // Update labels for a capture
  async updateLabels(date: string, captureId: string, labels: Labels): Promise<void> {
    return fetchApi<void>(`/dates/${date}/captures/${captureId}/labels`, {
      method: 'PUT',
      body: JSON.stringify(labels),
    });
  },

  // Get image URL
  getImageUrl(date: string, captureId: string, cameraId: string): string {
    return `${API_BASE_URL}/dates/${date}/captures/${captureId}/image/${cameraId}`;
  },

  // Get brick_info txt file contents
  async getBrickInfo(date: string, captureId: string): Promise<string> {
    const response = await fetchApi<{ content: string }>(`/dates/${date}/captures/${captureId}/brick_info`);
    return response.content;
  },

  // Get point cloud info
  async getPointCloudInfo(date: string, captureId: string): Promise<PointCloudInfo> {
    return fetchApi<PointCloudInfo>(`/dates/${date}/captures/${captureId}/point_cloud/info`);
  },
};