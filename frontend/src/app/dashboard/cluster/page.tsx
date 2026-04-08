'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { clusterApi, ClusterStats, SchoolInCluster } from '@/lib/clusterApi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/Toast';

function ClusterDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clusterDetails, setClusterDetails] = useState<any>(null);
  const [stats, setStats] = useState<ClusterStats | null>(null);
  const [schools, setSchools] = useState<SchoolInCluster[]>([]);
  const [clusterName, setClusterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Get cluster ID from query parameter (for SUPER_ADMIN) or user's cluster_id (for CLUSTER_HEAD)
    const queryClusterId = searchParams.get('id');

    // Allow SUPER_ADMIN or CLUSTER_HEAD to view
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'CLUSTER_HEAD') {
      router.push('/dashboard');
      return;
    }

    // Determine which cluster to show
    let clusterId: number | null = null;

    if (user?.role === 'SUPER_ADMIN' && queryClusterId) {
      // SUPER_ADMIN viewing specific cluster
      clusterId = parseInt(queryClusterId);
    } else if (user?.role === 'CLUSTER_HEAD' && user.cluster_id) {
      // CLUSTER_HEAD viewing their own cluster
      clusterId = user.cluster_id;
    }

    if (!clusterId) {
      setMessage('No cluster specified or you are not assigned to any cluster');
      setMessageType('error');
      setLoading(false);
      return;
    }

    fetchClusterData(clusterId);
  }, [user, router, searchParams]);

  const fetchClusterData = async (clusterId: number) => {
    try {
      setLoading(true);

      // Fetch complete cluster details (new endpoint)
      const detailsResponse = await clusterApi.getDetails(clusterId);
      setClusterDetails(detailsResponse.data);
      setClusterName(detailsResponse.data.cluster.name);
      setSchools(detailsResponse.data.schools);
      setStats(detailsResponse.data.statistics);
    } catch (err: any) {
      console.error('Failed to load cluster data:', err);
      setMessage('Failed to load cluster data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-700 to-blue-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-purple-600 rounded w-48 mx-auto mb-2"></div>
              <div className="h-6 bg-purple-600 rounded w-32 mx-auto"></div>
            </div>
          </div>
          <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-purple-100">
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-blue-800 text-white rounded-t-2xl shadow-lg p-7">
          {/* Back Button for SUPER_ADMIN */}
          {user?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="mb-4 flex items-center gap-2 text-white hover:text-purple-200 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin Dashboard
            </button>
          )}

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Cluster Dashboard</h1>
            <p className="text-2xl font-bold opacity-90">{clusterName}</p>
            {clusterDetails?.cluster.code && (
              <p className="text-sm opacity-75 mt-1">Code: {clusterDetails.cluster.code}</p>
            )}
            <p className="text-sm opacity-75 mt-2">
              {user?.role === 'CLUSTER_HEAD' ? 'Read-Only Access' : 'Admin View'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-purple-100">
          {message && (
            <Toast
              message={message}
              type={messageType}
              onClose={() => setMessage('')}
              duration={5000}
            />
          )}

          {/* Cluster Status Warning */}
          {clusterDetails && !clusterDetails.status.is_operational && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Cluster Incomplete</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {!clusterDetails.status.has_head && (
                      <li>• No cluster head assigned</li>
                    )}
                    {!clusterDetails.status.has_schools && (
                      <li>• No schools assigned to this cluster</li>
                    )}
                  </ul>
                  {user?.role === 'SUPER_ADMIN' && (
                    <p className="text-sm text-yellow-700 mt-2">
                      Please assign schools and a cluster head to make this cluster operational.
                    </p>
                  )}
                  {user?.role === 'CLUSTER_HEAD' && (
                    <p className="text-sm text-yellow-700 mt-2">
                      Please contact the system administrator to assign schools to your cluster.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cluster Head Info */}
          {clusterDetails?.head && (
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">👤 Cluster Head</h3>
              <div className="text-sm text-indigo-800">
                <p><span className="font-semibold">Name:</span> {clusterDetails.head.full_name || 'Not set'}</p>
                <p><span className="font-semibold">Email:</span> {clusterDetails.head.email}</p>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Total Schools */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">Total Schools</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_schools}</p>
                  </div>
                </div>
              </div>

              {/* Total Students */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                  </div>
                </div>
              </div>

              {/* Boys */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl shadow-md border border-cyan-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-cyan-500 text-white">
                    <span className="text-2xl font-bold">♂</span>
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">Boys</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_boys}</p>
                  </div>
                </div>
              </div>

              {/* Girls */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl shadow-md border border-pink-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-pink-500 text-white">
                    <span className="text-2xl font-bold">♀</span>
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">Girls</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_girls}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schools Table */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Schools List ({schools.length})
            </h2>

            {schools.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-xl text-gray-600 mb-2">No schools in this cluster</p>
                <p className="text-sm text-gray-500">
                  {user?.role === 'SUPER_ADMIN'
                    ? 'Use the admin panel to assign schools to this cluster'
                    : 'Contact the system administrator to assign schools'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <tr>
                    <th className="py-3 px-4 text-start">#</th>
                    <th className="py-3 px-4 text-start">School Name</th>
                    <th className="py-3 px-4 text-start">SEMIS Code</th>
                    <th className="py-3 px-4 text-start">Taluka</th>
                    <th className="py-3 px-4 text-center">Boys</th>
                    <th className="py-3 px-4 text-center">Girls</th>
                    <th className="py-3 px-4 text-center">Total Students</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school, index) => (
                    <tr key={school.school_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold">{school.school_name}</td>
                      <td className="py-3 px-4">{school.semis_code}</td>
                      <td className="py-3 px-4">{school.taluka || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          {school.boys}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-semibold">
                          {school.girls}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold">
                          {school.total_students}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {schools.map((school, index) => (
                <div key={school.school_id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{school.school_name}</h3>
                      <p className="text-sm text-gray-600">SEMIS: {school.semis_code}</p>
                      {school.taluka && <p className="text-sm text-gray-600">Taluka: {school.taluka}</p>}
                    </div>
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">Boys</p>
                      <p className="text-xl font-bold text-blue-800">{school.boys}</p>
                    </div>
                    <div className="bg-pink-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">Girls</p>
                      <p className="text-xl font-bold text-pink-800">{school.girls}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-xl font-bold text-gray-800">{school.total_students}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </div>

          {/* Schools by Taluka */}
          {stats && stats.schools_by_taluka && Object.keys(stats.schools_by_taluka).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Schools by Taluka</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.schools_by_taluka).map(([taluka, count]) => (
                  <div key={taluka} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Taluka</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">{taluka}</p>
                    <p className="text-2xl font-bold text-green-700">{count} Schools</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClusterDashboardPage() {
  return (
    <ProtectedRoute>
      <ClusterDashboard />
    </ProtectedRoute>
  );
}
