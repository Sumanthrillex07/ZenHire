import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zenhire_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('zenhire_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('zenhire_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('zenhire_user', JSON.stringify(freshUser));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('zenhire_token');
          localStorage.removeItem('zenhire_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (payload: LoginPayload): Promise<User> => {
    const authData = await authApi.login(payload);
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('zenhire_token', authData.token);
    localStorage.setItem('zenhire_user', JSON.stringify(authData.user));
    return authData.user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const authData = await authApi.register(payload);
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('zenhire_token', authData.token);
    localStorage.setItem('zenhire_user', JSON.stringify(authData.user));
    return authData.user;
  };

  const logout = () => {
    localStorage.removeItem('zenhire_token');
    localStorage.removeItem('zenhire_user');
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      localStorage.setItem('zenhire_user', JSON.stringify(freshUser));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

