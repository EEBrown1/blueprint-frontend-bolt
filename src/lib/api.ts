import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface UploadResponse {
  file_id: string;
  status: string;
  message: string;
}

export interface FileStatus {
  status: 'processing' | 'ready' | 'error';
  page_count?: number;
  error?: string;
}

export interface ChatResponse {
  response: string;
  context?: string;
  confidence?: number;
}

export const blueprintApi = {
  // Upload endpoints
  uploadBlueprint: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },

  getFileStatus: async (fileId: string): Promise<FileStatus> => {
    const response = await api.get(`/status/${fileId}`);
    return response.data;
  },

  getFileContent: async (fileId: string): Promise<Blob> => {
    const response = await api.get(`/files/${fileId}/content`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Chat endpoints
  sendMessage: async (fileId: string, message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat', {
      file_id: fileId,
      message,
    });
    return response.data;
  },

  // Health check
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Add axios interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.detail || 'An error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      throw new Error('Network error - no response received');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      throw new Error('Error setting up the request');
    }
  }
);

export default blueprintApi; 