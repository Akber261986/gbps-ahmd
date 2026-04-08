'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, School } from '@/lib/adminApi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

function SchoolsManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, router]);

  useEffect(() => {
    filterSchools();
  }, [searchTerm, selectedDistrict, selectedTaluka, schools]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all schools
      const schoolsResponse = await adminApi.getAllSchools();
      setSchools(schoolsResponse.data);
      setFilteredSchools(schoolsResponse.data);

      // Fetch filters
      const filtersResponse = await adminApi.getSchoolFilters();
      setDistricts(filtersResponse.data.districts);
      setTalukas(filtersResponse.data.talukas);
    } catch (err: any) {
      console.error('Failed to load schools:', err);
      setMessage('Failed to load schools');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filterSchools = () => {
    let filtered = schools;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (school) =>
          school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.semis_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // District filter
    if (selectedDistrict) {
      filtered = filtered.filter((school) => school.district === selectedDistrict);
    }

    // Taluka filter
    if (selectedTaluka) {
      filtered = filtered.filter((school) => school.taluka === selectedTaluka);
    }

    setFilteredSchools(filtered);
  };

  const handleDeleteSchool = async (schoolId: number, schoolName: string) => {
    if (!confirm(`Are you sure you want to delete "${schoolName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.deleteSchool(schoolId);
      setMessage('School deleted successfully');
      setMessageType('success');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to delete school');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-t-2xl shadow-lg p-7">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="mb-4 flex items-center gap-2 text-white hover:text-indigo-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Schools Management</h1>
            <p className="text-lg opacity-90">View and manage all schools in the system</p>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-indigo-100">
          {message && (
            <Toast
              message={message}
              type={messageType}
              onClose={() => setMessage('')}
              duration={5000}
            />
          )}

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or SEMIS code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taluka</label>
                <select
                  value={selectedTaluka}
                  onChange={(e) => setSelectedTaluka(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Talukas</option>
                  {talukas.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredSchools.length} of {schools.length} schools
            </div>
          </div>

          {/* Schools Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">School Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SEMIS Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cluster</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No schools found
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{school.school_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{school.semis_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {school.taluka && school.district ? `${school.taluka}, ${school.district}` : school.district || school.taluka || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {school.cluster_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Assigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => handleDeleteSchool(school.id, school.school_name)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          title="Delete school"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchoolsManagementPageWrapper() {
  return (
    <ProtectedRoute>
      <SchoolsManagementPage />
    </ProtectedRoute>
  );
}
