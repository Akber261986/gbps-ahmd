'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clusterApi, Cluster } from '@/lib/clusterApi';
import { adminApi, School } from '@/lib/adminApi';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';

function AssignSchoolsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const clusterId = parseInt(params.id as string);

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [assignedSchools, setAssignedSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Filters
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [unionCouncils, setUnionCouncils] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [selectedUnionCouncil, setSelectedUnionCouncil] = useState('');

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, router, clusterId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch cluster details
      const clusterResponse = await clusterApi.getById(clusterId);
      setCluster(clusterResponse.data);

      // Fetch filter values
      const filtersResponse = await adminApi.getSchoolFilters();
      setDistricts(filtersResponse.data.districts);
      setTalukas(filtersResponse.data.talukas);
      setUnionCouncils(filtersResponse.data.union_councils);

      // Fetch schools
      await fetchSchools();
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setMessage('Failed to load data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      // Fetch available schools (unassigned only)
      const availableResponse = await adminApi.getAllSchools({
        district: selectedDistrict || undefined,
        taluka: selectedTaluka || undefined,
        union_council: selectedUnionCouncil || undefined,
        unassigned_only: true
      });
      setAvailableSchools(availableResponse.data);

      // Fetch assigned schools for this cluster
      const assignedResponse = await clusterApi.getSchools(clusterId);
      setAssignedSchools(assignedResponse.data);
    } catch (err: any) {
      console.error('Failed to load schools:', err);
    }
  };

  const handleFilterChange = () => {
    fetchSchools();
  };

  const handleSelectSchool = (schoolId: number) => {
    setSelectedSchools(prev =>
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSchools.length === availableSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(availableSchools.map(s => s.id));
    }
  };

  const handleAssignSchools = async () => {
    if (selectedSchools.length === 0) {
      setMessage('Please select at least one school');
      setMessageType('error');
      return;
    }

    try {
      // Assign each selected school
      for (const schoolId of selectedSchools) {
        await clusterApi.assignSchool(clusterId, schoolId);
      }

      setMessage(`Successfully assigned ${selectedSchools.length} school(s)`);
      setMessageType('success');
      setSelectedSchools([]);
      fetchSchools();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to assign schools');
      setMessageType('error');
    }
  };

  const handleRemoveSchool = async (schoolId: number) => {
    if (!confirm('Are you sure you want to remove this school from the cluster?')) {
      return;
    }

    try {
      await clusterApi.removeSchool(clusterId, schoolId);
      setMessage('School removed successfully');
      setMessageType('success');
      fetchSchools();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to remove school');
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Assign Schools to Cluster</h1>
            <p className="text-xl opacity-90">{cluster?.name}</p>
            {cluster?.code && <p className="text-sm opacity-75 mt-1">Code: {cluster.code}</p>}
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

          {/* Currently Assigned Schools */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Currently Assigned Schools ({assignedSchools.length})
            </h2>

            {assignedSchools.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No schools assigned to this cluster yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedSchools.map((school) => (
                  <div
                    key={school.id}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{school.school_name}</h3>
                        <p className="text-sm text-gray-600">SEMIS: {school.semis_code}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSchool(school.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Remove school"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {school.district && <p>District: {school.district}</p>}
                      {school.taluka && <p>Taluka: {school.taluka}</p>}
                      {school.union_council && <p>UC: {school.union_council}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="my-8 border-gray-300" />

          {/* Filter Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Filter Available Schools</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Union Council</label>
                <select
                  value={selectedUnionCouncil}
                  onChange={(e) => setSelectedUnionCouncil(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Union Councils</option>
                  {unionCouncils.map((uc) => (
                    <option key={uc} value={uc}>{uc}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFilterChange}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {/* Available Schools */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Available Schools ({availableSchools.length})
              </h2>
              {availableSchools.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {selectedSchools.length === availableSchools.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {availableSchools.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No unassigned schools found with current filters</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or all schools may already be assigned</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {availableSchools.map((school) => (
                    <div
                      key={school.id}
                      onClick={() => handleSelectSchool(school.id)}
                      className={`rounded-lg p-4 border-2 cursor-pointer transition ${
                        selectedSchools.includes(school.id)
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSchools.includes(school.id)}
                          onChange={() => handleSelectSchool(school.id)}
                          className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{school.school_name}</h3>
                          <p className="text-sm text-gray-600">SEMIS: {school.semis_code}</p>
                          <div className="text-xs text-gray-600 mt-2 space-y-1">
                            {school.district && <p>District: {school.district}</p>}
                            {school.taluka && <p>Taluka: {school.taluka}</p>}
                            {school.union_council && <p>UC: {school.union_council}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleAssignSchools}
                    disabled={selectedSchools.length === 0}
                    className={`px-8 py-3 rounded-lg font-semibold transition ${
                      selectedSchools.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Assign {selectedSchools.length} Selected School{selectedSchools.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssignSchoolsPageWrapper() {
  return (
    <ProtectedRoute>
      <AssignSchoolsPage />
    </ProtectedRoute>
  );
}
