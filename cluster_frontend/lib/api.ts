import axios from 'axios';
import { getToken } from './auth';
import type {
  AuthResponse,
  LoginCredentials,
  SignupData,
  User,
  ClusterDetails,
  School,
  ClusterStudentData,
} from './types';

// Use relative URLs to leverage Next.js proxy and avoid CORS issues
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cluster_auth_token');
        localStorage.removeItem('cluster_user_data');

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/api/auth/login', credentials),

  signup: (data: SignupData) =>
    api.post<User>('/api/auth/register', data),

  getMe: () =>
    api.get<User>('/api/auth/me'),
};

// Cluster API
export const clusterApi = {
  getDetails: (clusterId: number) =>
    api.get<ClusterDetails>(`/api/clusters/${clusterId}/details`),

  getSchools: (clusterId: number) =>
    api.get<School[]>(`/api/clusters/${clusterId}/schools`),

  getStudents: (clusterId: number) =>
    api.get<ClusterStudentData>(`/api/clusters/${clusterId}/students`),

  getSchoolClasses: (clusterId: number, schoolId: number) =>
    api.get(`/api/clusters/${clusterId}/schools/${schoolId}/classes`),
};

export default api;
