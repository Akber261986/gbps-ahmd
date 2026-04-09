import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

export interface Cluster {
  id: number;
  name: string;
  code: string | null;
  taluka: string | null;
  district: string | null;
  head_id: number | null;
  created_at: string;
}

export interface ClusterStats {
  total_schools: number;
  total_students: number;
  total_boys: number;
  total_girls: number;
  schools_by_taluka: Record<string, number>;
}

export interface SchoolInCluster {
  school_id: number;
  school_name: string;
  semis_code: string;
  taluka: string | null;
  total_students: number;
  boys: number;
  girls: number;
}

export const clusterApi = {
  // Get all clusters
  getAll: () => axios.get<Cluster[]>(`${API_URL}/clusters`, { headers: getAuthHeader() }),

  // Get cluster by ID
  getById: (id: number) => axios.get<Cluster>(`${API_URL}/clusters/${id}`, { headers: getAuthHeader() }),

  // Get complete cluster details (head, schools, statistics, status)
  getDetails: (id: number) => axios.get(`${API_URL}/clusters/${id}/details`, { headers: getAuthHeader() }),

  // Create cluster (SUPER_ADMIN only)
  create: (data: Omit<Cluster, 'id' | 'created_at'>) =>
    axios.post<Cluster>(`${API_URL}/clusters`, data, { headers: getAuthHeader() }),

  // Update cluster (SUPER_ADMIN only)
  update: (id: number, data: Partial<Omit<Cluster, 'id' | 'created_at'>>) =>
    axios.put<Cluster>(`${API_URL}/clusters/${id}`, data, { headers: getAuthHeader() }),

  // Delete cluster (SUPER_ADMIN only)
  delete: (id: number) => axios.delete(`${API_URL}/clusters/${id}`, { headers: getAuthHeader() }),

  // Get cluster statistics
  getStats: (id: number) => axios.get<ClusterStats>(`${API_URL}/clusters/${id}/stats`, { headers: getAuthHeader() }),

  // Get schools in cluster
  getSchools: (id: number) => axios.get(`${API_URL}/clusters/${id}/schools`, { headers: getAuthHeader() }),

  // Get student data by school
  getStudents: (id: number) =>
    axios.get<{ cluster_id: number; cluster_name: string; schools: SchoolInCluster[] }>(
      `${API_URL}/clusters/${id}/students`,
      { headers: getAuthHeader() }
    ),

  // Assign school to cluster (SUPER_ADMIN only)
  assignSchool: (clusterId: number, schoolId: number) =>
    axios.post(
      `${API_URL}/clusters/${clusterId}/assign-school/${schoolId}`,
      {},
      { headers: getAuthHeader() }
    ),

  // Remove school from cluster (SUPER_ADMIN only)
  removeSchool: (clusterId: number, schoolId: number) =>
    axios.delete(
      `${API_URL}/clusters/${clusterId}/remove-school/${schoolId}`,
      { headers: getAuthHeader() }
    ),

  // Assign cluster head (SUPER_ADMIN only)
  assignHead: (clusterId: number, userId: number) =>
    axios.post(
      `${API_URL}/clusters/${clusterId}/assign-head/${userId}`,
      {},
      { headers: getAuthHeader() }
    ),
};
