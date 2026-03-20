'use client';

import { useState, useEffect } from 'react';
import { studentApi, gradeApi, subjectApi, classApi } from '@/lib/api';
import { Student, Grade, Subject, Class } from '@/lib/api';
import { useSchool } from '@/contexts/SchoolContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const ResultsPage = () => {
  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [showGrades, setShowGrades] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data
        const [studentsResponse, classesResponse, subjectsResponse] = await Promise.all([
          studentApi.getAll(),
          classApi.getAll(),
          subjectApi.getAll()
        ]);
        
        setStudents(studentsResponse.data);
        setClasses(classesResponse.data);
        setSubjects(subjectsResponse.data);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students based on selected class
  const filteredStudents = selectedClass 
    ? students.filter(student => student.class_id === parseInt(selectedClass.toString()))
    : students;

  const handleViewGrades = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await gradeApi.getByStudentId(Number(selectedStudent));
      setStudentGrades(response.data.grades);
      setShowGrades(true);
    } catch (err) {
      setError('Failed to load grades');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">نتيجا ۽ گريڊس</h1>
          <p className="text-2xl font-bold opacity-90">{school?.school_name || 'اسڪول'}</p>
          {school?.semis_code && (
            <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value ? Number(e.target.value) : '');
                setSelectedStudent(''); // Reset student selection when class changes
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
            >
              <option value="">ڪلاس چونڊيو</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : '')}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
              disabled={!selectedClass}
            >
              <option value="">اسٽوڊنٽ چونڊيو</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} (GR: {student.gr_number})
                </option>
              ))}
            </select>
            
            <button
              onClick={handleViewGrades}
              disabled={!selectedStudent}
              className="px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition duration-300"
            >
              گريڊس ڏسو
            </button>
            
            <a 
              href="/results/add"
              className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-center flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              نئون نتيجو شامل ڪريو
            </a>
          </div>

          {/* Grades Display */}
          {showGrades && (
            <div className="mt-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {students.find(s => s.id === selectedStudent)?.name} جا نتيجا
                </h3>
                <p className="text-gray-600">
                  GR نمبر: {students.find(s => s.id === selectedStudent)?.gr_number}
                </p>
              </div>

              {studentGrades.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            مضمون
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            امتحان
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            سال
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            حاصل ڪيل نمبر
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ڪل نمبر
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            گريڊ
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            فيصد
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            استاد
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentGrades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {subjects.find(s => s.id === grade.subject_id)?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.exam_session} ({grade.exam_type})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.academic_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.marks_obtained !== null ? grade.marks_obtained : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.total_marks !== null ? grade.total_marks : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.grade || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.percentage !== null ? `${grade.percentage}%` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.subject_teacher || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {studentGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <div className="mb-3">
                          <p className="text-lg font-bold text-gray-900">
                            {subjects.find(s => s.id === grade.subject_id)?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {grade.exam_session} ({grade.exam_type}) - {grade.academic_year}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">حاصل ڪيل نمبر:</span>
                            <span className="text-gray-900 font-medium">
                              {grade.marks_obtained !== null ? grade.marks_obtained : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ڪل نمبر:</span>
                            <span className="text-gray-900 font-medium">
                              {grade.total_marks !== null ? grade.total_marks : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">گريڊ:</span>
                            <span className="text-gray-900 font-medium">{grade.grade || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">فيصد:</span>
                            <span className="text-gray-900 font-medium">
                              {grade.percentage !== null ? `${grade.percentage}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">استاد:</span>
                            <span className="text-gray-900 font-medium">{grade.subject_teacher || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                  <p>ھن اسٽوڊنٽ جا ڪي گريڊس ناھن</p>
                </div>
              )}
            </div>
          )}

          {!showGrades && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
              <p>ڪو اسٽوڊنٽ چونڊيو ته ھن جا نتيجا ڏيکاريا ويندا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ResultsPageWrapper() {
  return (
    <ProtectedRoute>
      <ResultsPage />
    </ProtectedRoute>
  );
}