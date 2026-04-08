// User types
export interface User {
  id: number;
  email: string;
  full_name: string;
  profile_image_url?: string;
  school_id?: number;
  cluster_id?: number;
  role: 'SUPER_ADMIN' | 'CLUSTER_HEAD' | 'SCHOOL_ADMIN';
  is_active: boolean;
  is_superuser: boolean;
  oauth_provider?: string;
  created_at: string;
}

// Cluster types
export interface Cluster {
  id: number;
  name: string;
  code: string;
  taluka: string;
  district: string;
  head_id?: number;
  created_at: string;
}

export interface ClusterStatistics {
  total_schools: number;
  total_students: number;
  total_boys: number;
  total_girls: number;
}

export interface ClusterStatus {
  has_head: boolean;
  has_schools: boolean;
  is_operational: boolean;
}

export interface SchoolSummary {
  id: number;
  school_name: string;
  semis_code: string;
  taluka: string;
  district: string;
  total_students: number;
  boys: number;
  girls: number;
}

export interface ClusterDetails {
  cluster: Cluster;
  head?: User;
  statistics: ClusterStatistics;
  schools: SchoolSummary[];
  status: ClusterStatus;
}

// School types
export interface School {
  id: number;
  school_name: string;
  semis_code: string;
  logo_url?: string;
  established_year?: number;
  address?: string;
  contact_number?: string;
  email?: string;
  principal_name?: string;
  taluka: string;
  district: string;
  union_council?: string;
  cluster_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Student types
export interface StudentStats {
  school_id: number;
  school_name: string;
  semis_code: string;
  taluka: string;
  total_students: number;
  boys: number;
  girls: number;
}

export interface ClusterStudentData {
  cluster_id: number;
  cluster_name: string;
  schools: StudentStats[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// API Error types
export interface ApiError {
  detail: string;
}
