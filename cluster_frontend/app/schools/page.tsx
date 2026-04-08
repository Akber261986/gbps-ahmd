'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clusterApi } from '@/lib/api';
import type { School } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import SchoolCard from '@/components/SchoolCard';
import Toast from '@/components/Toast';

export default function SchoolsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('error');

  useEffect(() => {
    if (user?.cluster_id) {
      fetchSchools();
    }
  }, [user]);

  useEffect(() => {
    filterSchools();
  }, [searchTerm, selectedTaluka, schools]);

  const fetchSchools = async () => {
    if (!user?.cluster_id) return;

    try {
      setLoading(true);
      const response = await clusterApi.getSchools(user.cluster_id);
      setSchools(response.data);
      setFilteredSchools(response.data);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to load schools');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filterSchools = () => {
    let filtered = schools;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (school) =>
          school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.semis_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by taluka
    if (selectedTaluka !== 'all') {
      filtered = filtered.filter((school) => school.taluka === selectedTaluka);
    }

    setFilteredSchools(filtered);
  };

  const getTalukas = () => {
    const talukas = new Set(schools.map((school) => school.taluka));
    return Array.from(talukas).sort();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <LoadingSpinner fullPage message="Loading schools..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />

      {message && (
        <Toast
          message={message}
          type={messageType}
          onClose={() => setMessage('')}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-2xl shadow-lg p-7 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Schools Directory</h1>
            <p className="text-orange-100">Browse and manage schools in your cluster</p>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-orange-100">
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by school name or SEMIS code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={selectedTaluka}
                  onChange={(e) => setSelectedTaluka(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Talukas</option>
                  {getTalukas().map((taluka) => (
                    <option key={taluka} value={taluka}>
                      {taluka}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredSchools.length} of {schools.length} schools
            </div>

            {/* Schools List - Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">School Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SEMIS Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Head Master</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSchools.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No schools found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredSchools.map((school) => (
                      <tr key={school.id} className="hover:bg-orange-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{school.school_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{school.semis_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {school.taluka}, {school.district}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{school.principal_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-center">{school.contact_number || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          <button
                            onClick={() => router.push(`/schools/${school.id}`)}
                            className="text-orange-600 hover:text-orange-800 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Schools List - Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredSchools.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No schools found matching your criteria
                </div>
              ) : (
                filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 shadow-md"
                  >
                    <h3 className="font-bold text-lg text-gray-900 mb-2 text-right">{school.school_name}</h3>
                    <div className="space-y-1 text-sm text-gray-700 mb-3">
                      <p><span className="font-medium">SEMIS:</span> {school.semis_code}</p>
                      <p><span className="font-medium">Location:</span> {school.taluka}, {school.district}</p>
                      <p><span className="font-medium">Head Master:</span> {school.principal_name || 'N/A'}</p>
                      <p><span className="font-medium">Contact:</span> {school.contact_number || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/schools/${school.id}`)}
                      className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
