'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  getPendingStudents,
  removePendingStudent,
  clearPendingStudents,
  prepareBatchUpload,
  exportPendingStudents,
  PendingStudent
} from '@/lib/offlineStorage';
import ProtectedRoute from '@/components/ProtectedRoute';

const PendingStudentsPage = () => {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadPendingStudents();
  }, []);

  const loadPendingStudents = () => {
    const students = getPendingStudents();
    setPendingStudents(students);
  };

  const handleRemove = (tempId: string) => {
    if (confirm('هن شاگرد کي ختم ڪرڻ چاهيو ٿا؟')) {
      removePendingStudent(tempId);
      loadPendingStudents();
    }
  };

  const handleUploadAll = async () => {
    if (pendingStudents.length === 0) {
      alert('ڪو به شاگرد موجود ناهي');
      return;
    }

    if (!confirm(`${pendingStudents.length} شاگردن کي اپلوڊ ڪرڻ چاهيو ٿا؟`)) {
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const students = prepareBatchUpload();

      const response = await api.post('/students/batch', {
        students: students
      });

      setUploadResult(response.data);

      // Clear pending students if all were successful
      if (response.data.failed_count === 0) {
        clearPendingStudents();
        setPendingStudents([]);
        alert(`ڪاميابي! ${response.data.success_count} شاگرد اپلوڊ ٿي ويا`);
        router.push('/students');
      } else {
        alert(`${response.data.success_count} ڪامياب، ${response.data.failed_count} ناڪام`);
        // Reload to show remaining students
        loadPendingStudents();
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('اپلوڊ ناڪام ٿيو: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    const jsonData = exportPendingStudents();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-students-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm('سڀني شاگردن کي ختم ڪرڻ چاهيو ٿا؟ هي عمل واپس نه ٿو ٿي سگهي!')) {
      clearPendingStudents();
      setPendingStudents([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                آف لائن شاگرد
              </h1>
              <p className="text-gray-600 mt-2">
                {pendingStudents.length} شاگرد اپلوڊ ٿيڻ جي انتظار ۾
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={pendingStudents.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ايڪسپورٽ ڪريو
              </button>
              <button
                onClick={handleClearAll}
                disabled={pendingStudents.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                سڀ ختم ڪريو
              </button>
              <button
                onClick={handleUploadAll}
                disabled={pendingStudents.length === 0 || uploading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                {uploading ? 'اپلوڊ ٿي رهيو آهي...' : 'سڀني کي اپلوڊ ڪريو'}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className={`rounded-lg shadow-md p-6 mb-6 ${
            uploadResult.failed_count === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <h2 className="text-xl font-bold mb-4">اپلوڊ جا نتيجا</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{uploadResult.success_count}</p>
                <p className="text-gray-600">ڪامياب</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{uploadResult.failed_count}</p>
                <p className="text-gray-600">ناڪام</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{uploadResult.total}</p>
                <p className="text-gray-600">ڪل</p>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold text-red-600 mb-2">غلطيون:</h3>
                <div className="space-y-2">
                  {uploadResult.errors.map((error: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded border border-red-200">
                      <p className="font-semibold">{error.name} (GR: {error.gr_number})</p>
                      <p className="text-sm text-red-600">{error.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Students List */}
        {pendingStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-xl">ڪو به آف لائن شاگرد موجود ناهي</p>
            <button
              onClick={() => router.push('/admission')}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              نئون داخلو
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      GR نمبر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      نالو
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      والد جو نالو
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      جنس
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      داخلا جي تاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.gr_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.father_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(student.admission_date).toLocaleDateString('ur-PK')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRemove(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ختم ڪريو
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {pendingStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">GR: {student.gr_number}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      انتظار ۾
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">والد جو نالو:</span>
                      <span className="text-gray-900 font-medium">{student.father_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">جنس:</span>
                      <span className="text-gray-900 font-medium">{student.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">داخلا جي تاريخ:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(student.admission_date).toLocaleDateString('ur-PK')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(student.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ختم ڪريو
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function PendingStudentsPageWrapper() {
  return (
    <ProtectedRoute>
      <PendingStudentsPage />
    </ProtectedRoute>
  );
}
