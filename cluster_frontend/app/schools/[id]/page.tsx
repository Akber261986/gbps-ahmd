'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clusterApi } from '@/lib/api';
import type { School, ClusterStudentData } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';

export default function SchoolDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const schoolId = parseInt(params.id as string);

  const [school, setSchool] = useState<School | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('error');

  useEffect(() => {
    if (user?.cluster_id && schoolId) {
      fetchSchoolData();
    }
  }, [user, schoolId]);

  const fetchSchoolData = async () => {
    if (!user?.cluster_id) return;

    try {
      setLoading(true);

      // Fetch all schools to get the specific school
      const schoolsResponse = await clusterApi.getSchools(user.cluster_id);
      const foundSchool = schoolsResponse.data.find((s) => s.id === schoolId);

      if (!foundSchool) {
        setMessage('School not found');
        setMessageType('error');
        return;
      }

      setSchool(foundSchool);

      // Fetch student data
      const studentsResponse = await clusterApi.getStudents(user.cluster_id);
      const schoolStudentData = studentsResponse.data.schools.find(
        (s) => s.school_id === schoolId
      );
      setStudentData(schoolStudentData);

      // Fetch class-wise data
      const classResponse = await clusterApi.getSchoolClasses(user.cluster_id, schoolId);
      setClassData(classResponse.data);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to load school data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <LoadingSpinner fullPage message="Loading school details..." />
      </ProtectedRoute>
    );
  }

  if (!school) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">School not found</p>
            <button
              onClick={() => router.push('/schools')}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Back to Schools
            </button>
          </div>
        </div>
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-2xl shadow-lg p-7">
            <button
              onClick={() => router.push('/schools')}
              className="mb-4 text-orange-100 hover:text-white flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Schools
            </button>
            <h1 className="text-3xl md:text-4xl font-bold">{school.school_name}</h1>
            <p className="text-orange-100 mt-2">SEMIS Code: {school.semis_code}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-orange-100 space-y-6">
            {/* School Information */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                School Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">School Name</p>
                  <p className="text-gray-900">{school.school_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">SEMIS Code</p>
                  <p className="text-gray-900">{school.semis_code}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Address</p>
                  <p className="text-gray-900">{school.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Contact Number</p>
                  <p className="text-gray-900">{school.contact_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Principal Name</p>
                  <p className="text-gray-900">{school.principal_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Email</p>
                  <p className="text-gray-900">{school.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Taluka</p>
                  <p className="text-gray-900">{school.taluka}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">District</p>
                  <p className="text-gray-900">{school.district}</p>
                </div>
                {school.union_council && (
                  <div>
                    <p className="text-gray-600 font-medium">Union Council</p>
                    <p className="text-gray-900">{school.union_council}</p>
                  </div>
                )}
                {school.established_year && (
                  <div>
                    <p className="text-gray-600 font-medium">Established Year</p>
                    <p className="text-gray-900">{school.established_year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Statistics */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Student Statistics
              </h2>
              {studentData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">Total Students</p>
                    <p className="text-4xl font-bold text-orange-600">{studentData.total_students}</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">Boys</p>
                    <p className="text-4xl font-bold text-cyan-600">{studentData.boys}</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">Girls</p>
                    <p className="text-4xl font-bold text-pink-600">{studentData.girls}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No student data available</p>
              )}
            </div>

            {/* Class-wise Student Data */}
            {classData && classData.classes && classData.classes.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  Class-wise Student Data
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.classes.map((cls: any) => (
                    <div
                      key={cls.class_id}
                      className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-gradient-to-br from-rose-50 via-amber-50 to-red-100"
                    >
                      {/* Decorative circles */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200/40 rounded-full"></div>
                      <div className="absolute top-20 -left-16 w-32 h-32 bg-amber-200/40 rounded-full"></div>

                      {/* Header */}
                      <div className="relative bg-gradient-to-r from-amber-400 to-amber-500 py-3">
                        <h3 className="text-center text-xl font-extrabold text-gray-900 tracking-wide">
                          {cls.class_name}
                        </h3>
                      </div>

                      {/* Content */}
                      <div className="relative grid grid-cols-3 gap-4 px-4 py-6 text-center">
                        {/* Boys */}
                        <div className="bg-white/90 rounded-xl shadow-sm border border-blue-200 p-4">
                          <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 text-xl font-bold">♂</span>
                          </div>
                          <p className="text-2xl font-extrabold text-blue-800">{cls.boys}</p>
                          <p className="mt-1 font-semibold text-gray-700">Boys</p>
                        </div>

                        {/* Girls */}
                        <div className="bg-white/90 rounded-xl shadow-sm border border-pink-200 p-4">
                          <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-pink-100 flex items-center justify-center">
                            <span className="text-pink-700 text-xl font-bold">♀</span>
                          </div>
                          <p className="text-2xl font-extrabold text-pink-800">{cls.girls}</p>
                          <p className="mt-1 font-semibold text-gray-700">Girls</p>
                        </div>

                        {/* Total */}
                        <div className="bg-white/95 rounded-xl shadow-md border border-gray-300 p-4">
                          <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-800 text-xl font-bold">∑</span>
                          </div>
                          <p className="text-3xl font-extrabold text-gray-900">{cls.total}</p>
                          <p className="mt-1 font-semibold text-gray-800">Total</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total Enrollment Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-gradient-to-br from-rose-50 via-amber-50 to-red-100">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200/40 rounded-full"></div>
                    <div className="absolute top-20 -left-16 w-32 h-32 bg-amber-200/40 rounded-full"></div>

                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-amber-400 to-amber-500 py-3">
                      <h3 className="text-center text-xl font-extrabold text-gray-900 tracking-wide">
                        Total Enrollment
                      </h3>
                    </div>

                    {/* Content */}
                    <div className="relative grid grid-cols-3 gap-4 px-4 py-6 text-center">
                      {/* Boys */}
                      <div className="bg-white/90 rounded-xl shadow-sm border border-blue-200 p-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-700 text-xl font-bold">♂</span>
                        </div>
                        <p className="text-2xl font-extrabold text-blue-800">{classData.totals.boys}</p>
                        <p className="mt-1 font-semibold text-gray-700">Boys</p>
                      </div>

                      {/* Girls */}
                      <div className="bg-white/90 rounded-xl shadow-sm border border-pink-200 p-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-pink-100 flex items-center justify-center">
                          <span className="text-pink-700 text-xl font-bold">♀</span>
                        </div>
                        <p className="text-2xl font-extrabold text-pink-800">{classData.totals.girls}</p>
                        <p className="mt-1 font-semibold text-gray-700">Girls</p>
                      </div>

                      {/* Total */}
                      <div className="bg-white/95 rounded-xl shadow-md border border-gray-300 p-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-800 text-xl font-bold">∑</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{classData.totals.total}</p>
                        <p className="mt-1 font-semibold text-gray-800">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Information */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Staff Information
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Note:</span> Staff and teacher information is not available in the current system. This feature will be added when the backend implements teacher management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
