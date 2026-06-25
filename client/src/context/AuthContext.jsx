import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gre_token') || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('gre_user');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = useCallback((t, u) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('gre_token', t);
    localStorage.setItem('gre_user', JSON.stringify(u));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, [persist]);

  const register = useCallback(async (email, password, displayName) => {
    const data = await api.register({ email, password, displayName });
    persist(data.token, data.user);
    return data.user;
  }, [persist]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gre_token');
    localStorage.removeItem('gre_user');
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
