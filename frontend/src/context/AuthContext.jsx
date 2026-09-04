import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('smartspend_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (user, token) => {
    localStorage.setItem('smartspend_token', token);
    localStorage.setItem('smartspend_user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (credentials) => {
    const { user, token } = await loginUser(credentials);
    persist(user, token);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    const { user, token } = await registerUser(payload);
    persist(user, token);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Token may already be invalid -- clearing local state is what matters.
    }
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
