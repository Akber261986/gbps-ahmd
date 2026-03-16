'use client';

import { useState, useEffect } from 'react';
import { studentApi, gradeApi, subjectApi, classApi } from '@/lib/api';
import { Student, Subject, Class } from '@/lib/api';
import { useSchool } from '@/contexts/SchoolContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface GradeFormData {
  student_id: number;
  subject_id: number;
  exam_session: string;
  exam_type: string;
  academic_year: string;
  marks_obtained: number | null;
  total_marks: number | null;
  grade: string;
  percentage: number | null;
  subject_teacher: string;
}

const initialForm: GradeFormData = {
  student_id: 0,
  subject_id: 0,
  exam_session: '',
  exam_type: 'Annual',
  academic_year: new Date().getFullYear().toString(),
  marks_obtained: null,
  total_marks: null,
  grade: '',
  percentage: null,
  subject_teacher: '',
};

const AddResultPage = () => {
  const { school } = useSchool();
  const [formData, setFormData] = useState<GradeFormData>(initialForm);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, subjectsResponse, classesResponse] = await Promise.all([
          studentApi.getAll(),
          subjectApi.getAll(),
          classApi.getAll()
        ]);
        
        setStudents(studentsResponse.data);
        setSubjects(subjectsResponse.data);
        setClasses(classesResponse.data);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students when class is selected
  useEffect(() => {
    if (formData.subject_id) {
      const subject = subjects.find(s => s.id === formData.subject_id);
      if (subject && subject.class_id) {
        const filtered = students.filter(student => student.class_id === subject.class_id);
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents(students);
      }
    } else {
      setFilteredStudents(students);
    }
  }, [formData.subject_id, students, subjects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('marks') || name === 'percentage' ? 
        value === '' ? null : Number(value) : 
        name === 'student_id' || name === 'subject_id' ? 
          Number(value) : 
          value
    }));
  };

  // Calculate percentage when marks are entered
  useEffect(() => {
    if (formData.marks_obtained !== null && formData.total_marks !== null && formData.total_marks > 0) {
      const percentage = (formData.marks_obtained / formData.total_marks) * 100;
      setFormData(prev => ({
        ...prev,
        percentage: parseFloat(percentage.toFixed(2))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        percentage: null
      }));
    }
  }, [formData.marks_obtained, formData.total_marks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      await gradeApi.create(formData);
      setSuccessMessage('نتيجه ڪاميابيءَ سان شامل ڪيو ويو!');
      setFormData(initialForm);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'ڪو مسئلو ٿيو');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">نتيجه شامل ڪريو</h1>
          <p className="text-2xl font-bold opacity-90">{school?.school_name || 'اسڪول'}</p>
          {school?.semis_code && (
            <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p>{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  مضمون چونڊيو
                </label>
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                >
                  <option value="">مضمون چونڊيو</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} {subject.class_id ? `(${classes.find(c => c.id === subject.class_id)?.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  اسٽوڊنٽ چونڊيو
                </label>
                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                >
                  <option value="">اسٽوڊنٽ چونڊيو</option>
                  {filteredStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} (GR: {student.gr_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  امتحان سيشن
                </label>
                <input
                  type="text"
                  name="exam_session"
                  value={formData.exam_session}
                  onChange={handleChange}
                  required
                  placeholder="مثال: Annual 2023"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  امتحان قسم
                </label>
                <select
                  name="exam_type"
                  value={formData.exam_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                >
                  <option value="Annual">Annual</option>
                  <option value="Mid-term">Mid-term</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  اكادمي سال
                </label>
                <input
                  type="text"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  required
                  placeholder="مثال: 2023-24"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  حاصل ڪيل نمبر
                </label>
                <input
                  type="number"
                  name="marks_obtained"
                  value={formData.marks_obtained ?? ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  ڪل نمبر
                </label>
                <input
                  type="number"
                  name="total_marks"
                  value={formData.total_marks ?? ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  فيصد
                </label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage ?? ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm text-base"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  گريڊ
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="مثال: A+, B, C"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  استاد
                </label>
                <input
                  type="text"
                  name="subject_teacher"
                  value={formData.subject_teacher}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    محفوظ ڪري رهيو آهي...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    نتيجو محفوظ ڪريو
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function AddResultPageWrapper() {
  return (
    <ProtectedRoute>
      <AddResultPage />
    </ProtectedRoute>
  );
}