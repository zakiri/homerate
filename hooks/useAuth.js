import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { getTokenFromLocalStorage } from '../utils/helpers';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await userAPI.getProfile(token);
      setUser(response.data);
    } catch (err) {
      setError(err.message);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error };
};

export const useProtectedRoute = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [user, loading]);

  return { loading };
};
