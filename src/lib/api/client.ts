import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// API Error Class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Response Interface
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Helper function to create axios instance with interceptors
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add token to requests
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors globally
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<any>) => {
      // Network error
      if (!error.response) {
        throw new ApiError(
          0,
          'Error de conexión. Verifica tu conexión a internet.',
          'NETWORK_ERROR'
        );
      }

      const { status, data } = error.response;
      const message = data?.message || data?.error || 'Ha ocurrido un error';
      const code = data?.code || `HTTP_${status}`;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          throw new ApiError(status, 'Sesión expirada. Por favor, inicia sesión nuevamente.', code);

        case 403:
          throw new ApiError(status, 'No tienes permisos para realizar esta acción.', code);

        case 404:
          throw new ApiError(status, 'Recurso no encontrado.', code, data);

        case 422:
          throw new ApiError(status, 'Datos inválidos. Verifica la información.', code, data);

        case 429:
          throw new ApiError(status, 'Demasiadas solicitudes. Intenta nuevamente más tarde.', code);

        case 500:
          throw new ApiError(status, 'Error del servidor. Intenta nuevamente más tarde.', code);

        default:
          throw new ApiError(status, message, code, data);
      }
    }
  );

  return client;
};

// Create axios instances for each microservice
// Auth Service (Puerto 8000)
const apiClient: AxiosInstance = createApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
);

// Fields Service (Puerto 8002)
export const fieldsClient: AxiosInstance = createApiClient(
  process.env.NEXT_PUBLIC_FIELDS_API_URL || 'http://localhost:8002'
);

// Reservations Service (Puerto 8003)
export const reservationsClient: AxiosInstance = createApiClient(
  process.env.NEXT_PUBLIC_RESERVATIONS_API_URL || 'http://localhost:8003'
);


// Generic API methods
export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return (response.data.data ?? response.data) as T;
    } catch (error) {
      throw error;
    }
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return (response.data.data ?? response.data) as T;
    } catch (error) {
      throw error;
    }
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return (response.data.data ?? response.data) as T;
    } catch (error) {
      throw error;
    }
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return (response.data.data ?? response.data) as T;
    } catch (error) {
      throw error;
    }
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return (response.data.data ?? response.data) as T;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;