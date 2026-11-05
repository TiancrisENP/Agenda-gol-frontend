import { api, ApiError } from './client';
import { LoginCredentials, AuthResponse, User, RegisterData, UserRole } from '@/types/auth.types';

// Backend response types
interface BackendTokenResponse {
  access_token: string;
  token_type: string;
}

interface BackendUserResponse {
  id?: number;
  user_id?: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

/**
 * Transform backend user to frontend user format
 */
function transformBackendUser(backendUser: BackendUserResponse): User {
  // Split username into nombre and apellido (if space exists, otherwise use username as nombre)
  const nameParts = backendUser.username.split(' ');
  const nombre = nameParts[0] || backendUser.username;
  const apellido = nameParts.slice(1).join(' ') || '';

  return {
    id: String(backendUser.id ?? backendUser.user_id),
    email: backendUser.email,
    nombre,
    apellido,
    telefono: undefined,
    rol: backendUser.is_admin ? UserRole.ADMIN : UserRole.USER,
    activo: backendUser.is_active,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Login user
   * @param credentials - User login credentials
   * @returns Auth response with token and user data
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Backend returns {access_token, token_type}
      const tokenResponse = await api.post<BackendTokenResponse>('/auth/login', credentials);
      
      // Store token temporarily to get user info
      const token = tokenResponse.access_token || (tokenResponse as any).access_token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        // Also store in cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Get user info using /auth/verify endpoint
      const userResponse = await api.get<BackendUserResponse>('/auth/verify');
      const user = transformBackendUser(userResponse);

      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return {
        token,
        user,
      };
    } catch (error) {
      console.error('Login error:', error);
      // Clear token if login failed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; max-age=0';
      }
      throw error;
    }
  },

  /**
   * Register new user
   * @param data - User registration data
   * @returns Auth response with token and user data
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Backend register expects {username, email, password}
      // Transform frontend data to backend format
      const registerPayload = {
        username: `${data.nombre} ${data.apellido}`.trim() || data.email.split('@')[0],
        email: data.email,
        password: data.password,
      };

      // Backend register returns user but no token, so we need to login after registration
      await api.post<BackendUserResponse>('/auth/register', registerPayload);
      
      // Automatically login after registration
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password,
      });

      return loginResponse;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * Clears local storage and optionally calls logout endpoint
   */
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if exists
      await api.post('/auth/logout').catch(() => {
        // Ignore errors on logout endpoint
      });
    } finally {
      // Always clear local storage and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0';
      }
    }
  },

  /**
   * Get current user profile
   * @returns Current user data
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<BackendUserResponse>('/auth/me');
      return transformBackendUser(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const response = await api.get<BackendUserResponse>('/auth/verify');
        return transformBackendUser(response);
      }
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update the signed-in user's username or password.
   * Backend: PATCH /auth/profile
   */
  updateProfile: async (data: { username?: string; password?: string }): Promise<User> => {
    try {
      const response = await api.patch<BackendUserResponse>('/auth/profile', data);
      const user = transformBackendUser(response);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Refresh token
   * @returns New auth response
   */
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      // Backend doesn't have refresh endpoint, so we'll use verify to get new user data
      const userResponse = await api.get<BackendUserResponse>('/auth/verify');
      const user = transformBackendUser(userResponse);
      
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        throw new Error('No token found');
      }

      return {
        token,
        user,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  /**
   * Verify if token is valid
   * @returns Boolean indicating token validity
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  },
};
