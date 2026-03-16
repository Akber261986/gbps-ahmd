import axios from 'axios';
import { getToken } from './auth';

// Track page load time to prevent premature redirects
if (typeof window !== 'undefined') {
  (window as any).__pageLoadTime = Date.now();
}

// Same-origin /api proxy to backend (see next.config rewrites); avoids CORS
const API_BASE_URL = typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to automatically include auth token
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      // and if we're not in the middle of a login attempt
      if (typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        // Don't immediately redirect - let the component handle it
        // Only clear tokens, don't force redirect
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        // Only redirect if this is a user-initiated action (not initial page load)
        // Check if we've been on the page for more than 2 seconds
        const pageLoadTime = (window as any).__pageLoadTime || Date.now();
        if (Date.now() - pageLoadTime > 2000) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Student {
  id: number;
  gr_number: string;
  admission_date: string;
  name: string;
  father_name: string;
  gender: string;
  qom: string | null;
  caste: string | null;
  relation_with_guardian: string | null;
  guardian_name: string | null;
  guardian_occupation: string | null;
  date_of_birth: string;
  date_of_birth_in_letter: string | null;
  place_of_birth: string | null;
  current_address: string | null;
  previous_school: string | null;
  class_id: number;
  admission_class_id: number;
  current_class_id: number | null;
  leaving_class_id: number | null;
  admission_age_years: number | null;
  roll_number: string | null;
  status: 'active' | 'left' | 'transferred';
  leaving_date: string | null;
  leaving_reason: string | null;
  created_at: string;
  updated_at: string;
  class_on_leaving: string | null;
  educational_ability: string | null;
  character :string | null;
  remarks : string | null;
  gr_of_previos_school: string | null;
  admit_in_class: string | "ڪلاس پھريون";
}

export interface Class {
  id: number;
  name: string;
}

export interface SchoolLeavingCertificate {
  id: number;
  student_id: number;
  gr_number: string;
  student_name: string;
  father_name: string;
  qom: string ;
  caste: string;
  place_of_birth: string;
  date_of_birth: string;
  date_of_birth_in_letter: string;
  admission_date: string;
  previous_school: string | null;
  gr_of_previos_school: string | null;
  leaving_date: string;
  class_on_leaving: string;
  reason_for_leaving: string;
  educational_ability: string;
  character: string;
  remarks: string | null;
  issued_date: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string | null;
  class_id: number | null;
}

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  exam_session: string;
  exam_type: string;
  academic_year: string;
  marks_obtained: number | null;
  total_marks: number | null;
  grade: string | null;
  percentage: number | null;
  subject_teacher: string | null;
  date_recorded: string;
}

export interface School {
  id: number;
  school_name: string;
  semis_code: string | null;
  address: string | null;
  phone: string | null;
  contact_number: string | null;
  email: string | null;
  logo_url: string | null;
  principal_name: string | null;
  established_year: number | null;
  created_at: string;
  updated_at: string;
}

// Student API functions
export const studentApi = {
  getAll: (classId?: number) => {
    const params = classId ? { class_id: classId } : {};
    return api.get<Student[]>('/students/', { params });
  },

  getById: (id: number) => api.get<Student>(`/students/${id}`),

  create: (data: any) => api.post('/students/', data),

  update: (id: number, data: any) => api.put(`/students/${id}`, data),

  delete: (id: number) => api.delete(`/students/${id}`),
};

// Class API functions
export const classApi = {
  getAll: () => api.get<Class[]>('/classes/'),

  getById: (id: number) => api.get<Class>(`/classes/${id}`),

  create: (data: any) => api.post('/classes/', data),

  update: (id: number, data: any) => api.put(`/classes/${id}`, data),

  delete: (id: number) => api.delete(`/classes/${id}`),
};

// School Leaving Certificate API functions
export const leavingCertificateApi = {
  getByStudentId: (studentId: number) => 
    api.get<SchoolLeavingCertificate>(`/school-leaving-certificates/${studentId}`),

  create: (data: any) => api.post('/school-leaving-certificates/', data),

  update: (id: number, data: any) => api.put(`/school-leaving-certificates/${id}`, data),
};

// Subject API functions
export const subjectApi = {
  getAll: (classId?: number) => {
    const params = classId ? { class_id: classId } : {};
    return api.get<Subject[]>('/subjects/', { params });
  },

  getById: (id: number) => api.get<Subject>(`/subjects/${id}`),

  create: (data: any) => api.post('/subjects/', data),

  update: (id: number, data: any) => api.put(`/subjects/${id}`, data),

  delete: (id: number) => api.delete(`/subjects/${id}`),
};

// Grade API functions
export const gradeApi = {
  getByStudentId: (studentId: number) =>
    api.get(`/grades/student/${studentId}`),

  getBySubjectId: (subjectId: number) =>
    api.get<Grade[]>(`/grades/subject/${subjectId}`),

  create: (data: any) => api.post('/grades/', data),

  update: (id: number, data: any) => api.put(`/grades/${id}`, data),

  delete: (id: number) => api.delete(`/grades/${id}`),
};

// School API functions
export const schoolApi = {
  getMySchool: () => api.get<School>('/schools/my-school'),

  onboard: (data: any) => api.post<School>('/schools/onboard', data),
};

export default api;