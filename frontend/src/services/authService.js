// In authService.js
import api from './api';


// Add this to authService.js
export const register = async (username, password, email) => {
  try {
    console.log('Registering user:', { username, email });
    const response = await api.post('/auth/register', {
      username,
      password,
      email
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// In authService.js
export const login = async (username, password) => {
  try {
    console.log('Sending login request...');
    const response = await api.post('/auth/login', { username, password });
    console.log('Login response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    const token = response.data;
    if (!token) {
      throw new Error('No token received from server');
    }

    localStorage.setItem('token', token);
    console.log('Token stored in localStorage');

    return {
      success: true,
      token,
      user: { username } // Since the backend only returns the token
    };
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    throw error;
  }
};

// In authService.js
export const getCurrentUser = async () => {
  try {
    const token = checkToken();
    console.log('Token being sent to /api/auth/me:', token ? `${token.substring(0, 20)}...` : 'no token');

    const response = await api.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('/api/auth/me response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getCurrentUser:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data
    });
    throw error;
  }
};

export const checkToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  console.log('Tokens cleared from storage');
};