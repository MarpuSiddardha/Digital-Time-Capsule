import api from './api';

const API_BASE_URL = 'http://localhost:8080';

export const createCapsule = async (capsuleData) => {
  try {
    const response = await api.post('/capsules/create', {
      title: capsuleData.title,
      message: capsuleData.message,
      unlockDateTime: capsuleData.unlockDateTime
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create capsule');
  }
};

export const getCapsuleById = async (id) => {
  try {
    const response = await api.get(`/capsules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching capsule:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch capsule');
  }
};


export const createCapsuleWithFile = async (formData) => {
  try {
    const response = await api.post('/capsules/create-with-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create capsule with file');
  }
};

export const getUnlockedCapsules = async () => {
  try {
    const response = await api.get('/capsules/unlocked');
    console.log('Raw API response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const deleteCapsule = async (id) => {
  try {
    const response = await api.delete(`/capsules/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete capsule');
  }
};

export const getLockedCapsules = async () => {
  try {
    const response = await api.get('/capsules/locked');
    console.log('Locked capsules API response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error (Locked Capsules):', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};


export const updateCapsule = async (id, capsuleData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/capsules/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(capsuleData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update capsule');
  }

  return response.json();
};