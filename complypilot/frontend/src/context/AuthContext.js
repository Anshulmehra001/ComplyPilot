import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const api = axios.create({ baseURL: 'http://localhost:8000' });

  useEffect(() => {
    const bootstrapAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userEmail');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      setAuthLoading(false);
    };
    bootstrapAuth();
  }, [api.defaults.headers]);

  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await axios.post('http://localhost:8000/token', params);
    const newToken = response.data.access_token;
    setToken(newToken);
    setUser(email);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userEmail', email);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    navigate('/');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = { token, user, isAuthLoading, login, logout, api };

  return (
    <AuthContext.Provider value={value}>
      {!isAuthLoading && children}
    </AuthContext.Provider>
  );
};