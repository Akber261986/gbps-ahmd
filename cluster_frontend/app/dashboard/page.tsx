'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clusterApi } from '@/lib/api';
import type { ClusterDetails } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatCard from '@/components/StatCard';
import Toast from '@/components/Toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clusterData, setClusterData] = useState<ClusterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('error');

  useEffect(() => {
    if (user?.cluster_id) {
      fetchClusterData();
    }
  }, [user]);

  const fetchClusterData = async () => {
    if (!user?.cluster_id) return;

    try {
      setLoading(true);
      const response = await clusterApi.getDetails(user.cluster_id);
      setClusterData(response.data);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to load cluster data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <LoadingSpinner fullPage message="Loading cluster data..." />
      </ProtectedRoute>
    );
  }

  if (!clusterData) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Failed to load cluster data</p>
            <button
              onClick={fetchClusterData}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { cluster, statistics, schools } = clusterData;

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
          {/* Header Card */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-2xl shadow-lg p-7 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{cluster.name}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <span className="bg-white/20 px-3 py-1 rounded-full">Code: {cluster.code}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Taluka: {cluster.taluka}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">District: {cluster.district}</span>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-orange-100">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Schools"
                value={statistics.total_schools}
                color="purple"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <StatCard
                title="Total Students"
                value={statistics.total_students}
                color="blue"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Boys"
                value={statistics.total_boys}
                color="cyan"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <StatCard
                title="Girls"
                value={statistics.total_girls}
                color="pink"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>

            {/* Schools Summary */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Schools Overview</h2>
                <button
                  onClick={() => router.push('/schools')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                >
                  View All Schools
                </button>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">School Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SEMIS Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Taluka</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Boys</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Girls</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schools.slice(0, 5).map((school) => (
                      <tr key={school.id} className="hover:bg-orange-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{school.school_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{school.semis_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{school.taluka}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-cyan-600 font-semibold">{school.boys}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-pink-600 font-semibold">{school.girls}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-600 font-bold">{school.total_students}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => router.push(`/schools/${school.id}`)}
                            className="text-orange-600 hover:text-orange-800 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {schools.slice(0, 5).map((school) => (
                  <div
                    key={school.id}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 shadow-md"
                  >
                    <h3 className="font-bold text-lg text-gray-900 mb-2 text-right">{school.school_name}</h3>
                    <div className="space-y-1 text-sm text-gray-700 mb-3">
                      <p><span className="font-medium">SEMIS:</span> {school.semis_code}</p>
                      <p><span className="font-medium">Taluka:</span> {school.taluka}</p>
                    </div>
                    <div className="flex gap-4 mb-3 pt-3 border-t border-orange-200">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-600">Boys</p>
                        <p className="text-lg font-bold text-cyan-600">{school.boys}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-600">Girls</p>
                        <p className="text-lg font-bold text-pink-600">{school.girls}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-bold text-orange-600">{school.total_students}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/schools/${school.id}`)}
                      className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {schools.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push('/schools')}
                    className="text-orange-600 hover:text-orange-800 font-medium"
                  >
                    View all {schools.length} schools →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
