import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginRequest } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userId && userEmail) {
      // Recuperar dados do usuário do localStorage
      setUser({
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
        created_at: new Date().toISOString()
      });
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    console.log('🔐 Tentando fazer login com:', credentials);
    try {
      const response: AuthResponse = await authAPI.login(credentials);
      console.log('✅ Login bem-sucedido:', response);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userId', response.user_id);
      localStorage.setItem('userEmail', response.email);
      
      // Set user data from login response
      const userData = {
        id: response.user_id,
        email: response.email,
        name: response.email.split('@')[0], // Use email prefix as name
        created_at: new Date().toISOString()
      };
      
      console.log('👤 Definindo usuário:', userData);
      setUser(userData);
    } catch (error) {
      console.error('💥 Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
