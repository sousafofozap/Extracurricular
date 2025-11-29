import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem('unibalsas_user');
    const token = localStorage.getItem('unibalsas_token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });

      // Importante: O backend deve retornar { token, id, nome, role, email }
      const { token, nome, role, id, email: userEmail } = response.data;

      const userData = { id, nome, role, email: userEmail };

      localStorage.setItem('unibalsas_user', JSON.stringify(userData));
      localStorage.setItem('unibalsas_token', token);

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error("Erro no login", error);
      return { success: false, message: error.response?.data?.message || 'Erro ao logar' };
    }
  };

  const logout = () => {
    localStorage.removeItem('unibalsas_user');
    localStorage.removeItem('unibalsas_token');
    api.defaults.headers.Authorization = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};