import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Document APIs
export const documentAPI = {
  create: (data) => api.post('/documents', data),
  getAll: (search = '') => api.get(`/documents?search=${search}`),
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  getByUser: (userId) => api.get(`/documents/user/${userId}`),
  like: (id) => api.post(`/documents/${id}/like`)
};

// Slide APIs
export const slideAPI = {
  create: (data) => api.post('/slides', data),
  getByDocument: (documentId) => api.get(`/slides/document/${documentId}`),
  update: (id, data) => api.put(`/slides/${id}`, data),
  delete: (id) => api.delete(`/slides/${id}`),
  insert: (data) => api.post('/slides/insert', data),
  reorder: (documentId, slides) => api.put(`/slides/reorder/${documentId}`, { slides })
};

// Comment APIs
export const commentAPI = {
  create: (data) => api.post('/comments', data),
  getBySlide: (slideId) => api.get(`/comments/slide/${slideId}`),
  getByDocument: (documentId) => api.get(`/comments/document/${documentId}`),
  getMyDocumentsComments: () => api.get('/comments/my-documents'),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`)
};

// Upload API
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`)
};

export default api;