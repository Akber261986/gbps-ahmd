'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { clusterApi, Cluster } from '@/lib/clusterApi';
import { adminApi, User } from '@/lib/adminApi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCluster, setNewCluster] = useState({
    name: '',
    code: '',
    taluka: '',
    district: '',
    head_id: ''
  });

  useEffect(() => {
    // Redirect if not super admin
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchClusters();
  }, [user, router]);

  const fetchClusters = async () => {
    try {
      setLoading(true);
      const response = await clusterApi.getAll();
      setClusters(response.data);
    } catch (err: any) {
      console.error('Failed to load clusters:', err);
      setMessage('Failed to load clusters');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchUsers(); // Load users when modal opens
  };

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCluster.name.trim()) {
      setMessage('Please enter cluster name');
      setMessageType('error');
      return;
    }

    try {
      await clusterApi.create({
        name: newCluster.name,
        code: newCluster.code || null,
        taluka: newCluster.taluka || null,
        district: newCluster.district || null,
        head_id: newCluster.head_id ? parseInt(newCluster.head_id) : null
      });

      setMessage('Cluster created successfully');
      setMessageType('success');
      setShowCreateModal(false);
      setNewCluster({ name: '', code: '', taluka: '', district: '', head_id: '' });
      fetchClusters();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to create cluster');
      setMessageType('error');
    }
  };

  const handleDeleteCluster = async (id: number) => {
    if (!confirm('Are you sure you want to delete this cluster?')) {
      return;
    }

    try {
      await clusterApi.delete(id);
      setMessage('Cluster deleted successfully');
      setMessageType('success');
      fetchClusters();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to delete cluster');
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
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-lg opacity-90">Cluster Management System</p>
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

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Clusters ({clusters.length})</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/dashboard/admin/schools')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manage Schools
              </button>
              <button
                onClick={() => router.push('/dashboard/admin/users')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Users
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Cluster
              </button>
            </div>
          </div>

          {/* Clusters Grid */}
          {clusters.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-xl">No clusters found</p>
              <p className="text-base mt-2">Please add your first cluster</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{cluster.name}</h3>
                      {cluster.code && (
                        <p className="text-sm text-gray-600">Code: {cluster.code}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCluster(cluster.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    {cluster.taluka && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Taluka:</span> {cluster.taluka}
                      </p>
                    )}
                    {cluster.district && (
                      <p className="text-gray-700">
                        <span className="font-semibold">District:</span> {cluster.district}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      Created: {new Date(cluster.created_at).toLocaleDateString('en-US')}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-indigo-200 space-y-2">
                    <button
                      onClick={() => router.push(`/dashboard/cluster?id=${cluster.id}`)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/admin/clusters/${cluster.id}/assign-schools`)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Assign Schools
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Cluster Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Cluster</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCluster({ name: '', code: '', taluka: '', district: '', head_id: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCluster} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cluster Name *
                </label>
                <input
                  type="text"
                  value={newCluster.name}
                  onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., North Cluster"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code (Optional)
                </label>
                <input
                  type="text"
                  value={newCluster.code}
                  onChange={(e) => setNewCluster({ ...newCluster, code: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., NC-001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Taluka (Optional)
                </label>
                <input
                  type="text"
                  value={newCluster.taluka}
                  onChange={(e) => setNewCluster({ ...newCluster, taluka: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Taluka name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District (Optional)
                </label>
                <input
                  type="text"
                  value={newCluster.district}
                  onChange={(e) => setNewCluster({ ...newCluster, district: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="District name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cluster Head (Optional)
                </label>
                <select
                  value={newCluster.head_id}
                  onChange={(e) => setNewCluster({ ...newCluster, head_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">-- Select Cluster Head --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  User will be assigned CLUSTER_HEAD role
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCluster({ name: '', code: '', taluka: '', district: '', head_id: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
