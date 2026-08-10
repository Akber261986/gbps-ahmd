'use client';

import { useState } from 'react';
import { classApi } from '@/lib/api';
import { useSchool } from '@/contexts/SchoolContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getToken } from '@/lib/auth';
import Toast from '@/components/Toast';

interface Student {
  id: number;
  gr_number: string;
  name: string;
  father_name: string;
  gender: string;
  current_class_id: number;
  status: string;
  admission_date: string;
}

interface Class {
  id: number;
  name: string;
}

const ChangeClassPage = () => {
  const { school } = useSchool();
  const [grNumber, setGrNumber] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassId, setNewClassId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSearch = async () => {
    if (!grNumber.trim()) {
      setMessage('مهرباني ڪري GR نمبر داخل ڪريو');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();

      // Fetch student by GR number
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/students/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch students');

      const students = await response.json();
      const foundStudent = students.find(
        (s: Student) => s.gr_number.toLowerCase() === grNumber.toLowerCase()
      );

      if (!foundStudent) {
        setMessage('هن GR نمبر سان ڪوبه شاگرد نه لڌو');
        setMessageType('error');
        setStudent(null);
        return;
      }

      setStudent(foundStudent);
      setNewClassId(foundStudent.current_class_id);

      // Fetch classes
      const classesResponse = await classApi.getAll();
      setClasses(classesResponse.data);

      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('شاگرد ڳولڻ ۾ ناڪامي');
      setMessageType('error');
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!student || !newClassId) {
      setMessage('مهرباني ڪري نئين ڪلاس چونڊيو');
      setMessageType('error');
      return;
    }

    if (newClassId === student.current_class_id) {
      setMessage('نئين ڪلاس موجوده ڪلاس جهڙي آهي');
      setMessageType('error');
      return;
    }

    try {
      setUpdating(true);
      const token = getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/students/${student.id}/change-class?new_class_id=${newClassId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to change class');

      const result = await response.json();

      setMessage(`✅ ${result.message}`);
      setMessageType('success');

      // Reset form
      setTimeout(() => {
        setStudent(null);
        setGrNumber('');
        setNewClassId('');
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setMessage('ڪلاس تبديل ڪرڻ ۾ ناڪامي');
      setMessageType('error');
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = () => {
    setStudent(null);
    setGrNumber('');
    setNewClassId('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">شاگرد جي ڪلاس تبديل ڪريو</h1>
          <p className="text-2xl font-bold opacity-90">{school?.school_name || 'اسڪول'}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          {/* Search Section */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              GR نمبر داخل ڪريو
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={grNumber}
                onChange={(e) => setGrNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="مثال: 001"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                disabled={loading || !!student}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !!student}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'ڳولي رهيو...' : 'ڳوليو'}
              </button>
            </div>
          </div>

          {/* Student Information (Read-only) */}
          {student && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">شاگرد جي معلومات</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">GR نمبر</p>
                    <p className="text-lg font-bold text-gray-900">{student.gr_number}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">شاگرد جو نالو</p>
                    <p className="text-lg font-bold text-gray-900">{student.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">پيءُ جو نالو</p>
                    <p className="text-lg font-bold text-gray-900">{student.father_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">جنس</p>
                    <p className="text-lg font-bold text-gray-900">{student.gender}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">حالت</p>
                    <p className="text-lg font-bold text-gray-900">
                      {student.status === 'active'
                        ? 'ايڪٽو'
                        : student.status === 'left'
                        ? 'ڇڏي چڪو'
                        : student.status === 'graduated'
                        ? 'گريجوئيٽ'
                        : 'منتقل ٿيل'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">داخلا جي تاريخ</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(student.admission_date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Class */}
              <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">موجوده ڪلاس</h3>
                <p className="text-2xl font-bold text-yellow-800">
                  {classes.find((c) => c.id === student.current_class_id)?.name || 'N/A'}
                </p>
              </div>

              {/* New Class Selection */}
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <label className="block text-xl font-bold text-gray-800 mb-3">
                  نئين ڪلاس چونڊيو *
                </label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(Number(e.target.value))}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-lg"
                >
                  <option value="">-- ڪلاس چونڊيو --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  disabled={updating}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  منسوخ ڪريو
                </button>
                <button
                  onClick={handleUpdateClass}
                  disabled={!newClassId || updating}
                  className="flex-1 px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      تبديل ٿي رهيو...
                    </>
                  ) : (
                    '✓ ڪلاس تبديل ڪريو'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <Toast
              message={message}
              type={messageType}
              onClose={() => setMessage('')}
              duration={3000}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default function ChangeClassPageWrapper() {
  return (
    <ProtectedRoute>
      <ChangeClassPage />
    </ProtectedRoute>
  );
}
