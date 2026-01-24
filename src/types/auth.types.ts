// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    rol: UserRole;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MANAGER = 'MANAGER'
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
    expiresIn?: number;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface RegisterData {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  }