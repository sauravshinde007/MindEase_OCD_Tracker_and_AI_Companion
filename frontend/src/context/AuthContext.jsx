import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default axios credentials to true
  axios.defaults.withCredentials = true;

  // Use relative path for both dev (via proxy) and prod (same domain)
  // This avoids CORS issues and invalid domain errors
  const API_URL = '';
  
  const getApiUrl = (endpoint) => {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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