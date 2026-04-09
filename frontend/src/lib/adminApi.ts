import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  school_id: number | null;
  cluster_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface School {
  id: number;
  school_name: string;
  semis_code: string;
  cluster_id: number | null;
  taluka: string | null;
  district: string | null;
  union_council: string | null;
  address: string | null;
  contact_number: string | null;
  principal_name: string | null;
}

export interface SystemStats {
  clusters: {
    total: number;
  };
  schools: {
    total: number;
    assigned_to_cluster: number;
    unassigned: number;
  };
  users: {
    total: number;
    super_admins: number;
    cluster_heads: number;
    school_admins: number;
  };
}

export const adminApi = {
  // Get all schools (SUPER_ADMIN only)
  getAllSchools: (params?: {
    district?: string;
    taluka?: string;
    union_council?: string;
    unassigned_only?: boolean;
  }) =>
    axios.get<School[]>(`${API_URL}/admin/schools`, {
      headers: getAuthHeader(),
      params
    }),

  // Get unassigned schools (SUPER_ADMIN only)
  getUnassignedSchools: () =>
    axios.get<School[]>(`${API_URL}/admin/schools/unassigned`, { headers: getAuthHeader() }),

  // Get filter values for schools (SUPER_ADMIN only)
  getSchoolFilters: () =>
    axios.get<{
      districts: string[];
      talukas: string[];
      union_councils: string[];
    }>(`${API_URL}/admin/schools/filters`, { headers: getAuthHeader() }),

  // Get all users (SUPER_ADMIN only)
  getAllUsers: () =>
    axios.get<User[]>(`${API_URL}/admin/users`, { headers: getAuthHeader() }),

  // Update user role (SUPER_ADMIN only)
  updateUserRole: (userId: number, role: string) =>
    axios.put(
      `${API_URL}/admin/users/${userId}/role`,
      null,
      {
        headers: getAuthHeader(),
        params: { role }
      }
    ),

  // Delete user (SUPER_ADMIN only)
  deleteUser: (userId: number) =>
    axios.delete(`${API_URL}/admin/users/${userId}`, { headers: getAuthHeader() }),

  // Delete school (SUPER_ADMIN only)
  deleteSchool: (schoolId: number) =>
    axios.delete(`${API_URL}/admin/schools/${schoolId}`, { headers: getAuthHeader() }),

  // Get system statistics (SUPER_ADMIN only)
  getSystemStats: () =>
    axios.get<SystemStats>(`${API_URL}/admin/stats`, { headers: getAuthHeader() }),
};
