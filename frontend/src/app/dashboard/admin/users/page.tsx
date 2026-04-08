'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, User } from '@/lib/adminApi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [currentUser, router]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setMessage('Failed to load users');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    // Prevent deleting yourself
    if (currentUser?.id === userId) {
      setMessage('You cannot delete your own account');
      setMessageType('error');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      setMessage('User deleted successfully');
      setMessageType('success');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to delete user');
      setMessageType('error');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setMessage('User role updated successfully');
      setMessageType('success');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update user role');
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Users Management</h1>
            <p className="text-lg opacity-90">View and manage all users in the system</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="CLUSTER_HEAD">Cluster Head</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Assignments</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          disabled={currentUser?.id === user.id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="CLUSTER_HEAD">Cluster Head</option>
                          <option value="SCHOOL_ADMIN">School Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="space-y-1">
                          {user.school_id && (
                            <div className="text-xs">
                              <span className="font-medium">School:</span> {user.school_id}
                            </div>
                          )}
                          {user.cluster_id && (
                            <div className="text-xs">
                              <span className="font-medium">Cluster:</span> {user.cluster_id}
                            </div>
                          )}
                          {!user.school_id && !user.cluster_id && (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={currentUser?.id === user.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                          title={currentUser?.id === user.id ? "Cannot delete yourself" : "Delete user"}
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

export default function UsersManagementPageWrapper() {
  return (
    <ProtectedRoute>
      <UsersManagementPage />
    </ProtectedRoute>
  );
}
