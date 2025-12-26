import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default axios credentials to true
  axios.defaults.withCredentials = true;

  // Use relative path in production (let Vercel handle the routing), or localhost in dev
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
  
  // Ensure we don't have a malformed URL like "https://api/..." if env var is missing/wrong
  const getApiUrl = (endpoint) => {
    if (API_URL === '' || API_URL.startsWith('/')) {
      return `${API_URL}${endpoint}`;
    }
    // If API_URL is a full URL, ensure it doesn't end with slash
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}${endpoint}`;
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    checkUserLoggedIn();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkUserLoggedIn = async () => {
    try {
        const res = await axios.get(getApiUrl('/api/auth/me'));
        setUser(res.data);
    } catch (error) {
        setUser(null);
    } finally {
        setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(getApiUrl('/api/auth/login'), { email, password });
    setUser(res.data);
  };

  const register = async (name, email, password) => {
    const res = await axios.post(getApiUrl('/api/auth/register'), { name, email, password });
    setUser(res.data);
  };

  const logout = async () => {
    await axios.post(getApiUrl('/api/auth/logout'));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};