'use client';

import { useState, useEffect } from 'react';
import { studentApi, subjectApi, classApi } from '@/lib/api';
import { useSchool } from '@/contexts/SchoolContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAuthHeader } from '@/lib/auth';

interface Student {
  id: number;
  gr_number: string;
  name: string;
  father_name: string;
  current_class_id: number;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Class {
  id: number;
  name: string;
}

interface SubjectMarks {
  subject_id: number;
  marks_obtained: number | null;
  total_marks: number;
}

interface MarksData {
  [studentId: number]: {
    marks: SubjectMarks[];
    is_absent: boolean;
  };
}

const SimpleMarksEntryPage = () => {
  const { school } = useSchool();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMarks, setCurrentMarks] = useState<SubjectMarks[]>([]);
  const [marksData, setMarksData] = useState<MarksData>({});
  const [hasChanged, setHasChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [allStudentsCompleted, setAllStudentsCompleted] = useState(false);
  const [lastResult, setLastResult] = useState<{
    percentage: number;
    promotionStatus: string;
    isAbsent: boolean;
  } | null>(null);

  // Form metadata
  const [examSession, setExamSession] = useState('');
  const [examType, setExamType] = useState('Annual');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjectTeacher, setSubjectTeacher] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);

  // Fetch classes and subjects on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesResponse, subjectsResponse] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll()
        ]);
        setClasses(classesResponse.data);
        setSubjects(subjectsResponse.data);
      } catch (err) {
        console.error('Failed to load data:', err);
        showMessage('ڊيٽا لوڊ ڪرڻ ۾ ناڪامي', 'error');
      }
    };
    fetchData();
  }, []);

  // When class is selected, load students
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/by-class/${selectedClassId}`,
          { headers: getAuthHeader() }
        );

        if (!response.ok) throw new Error('Failed to fetch students');

        const data = await response.json();
        setStudents(data);
        setCurrentIndex(0);
        setHasChanged(false);
        setAllStudentsCompleted(false);
        setLastResult(null);

        // Initialize marks for first student
        if (data.length > 0) {
          initializeMarksForStudent(data[0].id);
        }
      } catch (err) {
        console.error(err);
        showMessage('شاگردن جي لسٽ لوڊ ڪرڻ ۾ ناڪامي', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId]);

  // Initialize marks when student changes
  useEffect(() => {
    if (students.length === 0) return;
    const student = students[currentIndex];
    initializeMarksForStudent(student.id);
  }, [currentIndex, students]);

  const initializeMarksForStudent = async (studentId: number) => {
    // Check if we have saved marks in memory
    if (marksData[studentId]) {
      setCurrentMarks(marksData[studentId].marks);
      setHasChanged(false);
      return;
    }

    // Try to fetch existing marks from backend
    if (examSession && academicYear) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/grades/student/${studentId}/marks?academic_year=${academicYear}&exam_session=${examSession}`,
          { headers: getAuthHeader() }
        );

        if (response.ok) {
          const data = await response.json();
          const existingMarks = subjects.map(subject => ({
            subject_id: subject.id,
            marks_obtained: data.marks[subject.id] ?? null,
            total_marks: totalMarks
          }));
          setCurrentMarks(existingMarks);
          setHasChanged(false);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch existing marks:', err);
      }
    }

    // Initialize empty marks
    const emptyMarks = subjects.map(subject => ({
      subject_id: subject.id,
      marks_obtained: null,
      total_marks: totalMarks
    }));
    setCurrentMarks(emptyMarks);
    setHasChanged(false);
  };

  const handleMarksChange = (subjectId: number, value: string) => {
    const numValue = value === '' ? null : Number(value);
    setCurrentMarks(prev =>
      prev.map(m =>
        m.subject_id === subjectId
          ? { ...m, marks_obtained: numValue }
          : m
      )
    );
    setHasChanged(true);
  };

  const handleAbsent = () => {
    const absentMarks = subjects.map(subject => ({
      subject_id: subject.id,
      marks_obtained: null,
      total_marks: totalMarks
    }));
    setCurrentMarks(absentMarks);

    // Save to memory as absent
    const student = students[currentIndex];
    setMarksData(prev => ({
      ...prev,
      [student.id]: { marks: absentMarks, is_absent: true }
    }));

    setHasChanged(true);
  };

  const handleSave = async () => {
    if (!selectedClassId || students.length === 0) return;
    if (!examSession || !academicYear) {
      showMessage('مهرباني ڪري امتحان سيشن ۽ تعليمي سال ڀريو', 'error');
      return;
    }

    const student = students[currentIndex];
    setLoading(true);

    try {
      const isAbsent = marksData[student.id]?.is_absent || false;

      const payload = {
        student_id: student.id,
        class_id: selectedClassId,
        exam_session: examSession,
        exam_type: examType,
        academic_year: academicYear,
        subject_teacher: subjectTeacher || null,
        marks: currentMarks,
        is_absent: isAbsent
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/grades/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save marks');
      }

      const result = await response.json();

      // Save to memory
      setMarksData(prev => ({
        ...prev,
        [student.id]: { marks: currentMarks, is_absent: isAbsent }
      }));

      // Store last result for display
      setLastResult({
        percentage: result.overall_percentage || 0,
        promotionStatus: result.promotion_status,
        isAbsent: result.is_absent
      });

      // Show appropriate message
      let successMsg = '';
      if (result.is_absent) {
        successMsg = `✅ ${student.name} - غير حاضر (ساڳي ڪلاس ۾ رهندو)`;
      } else if (result.promotion_status === 'promoted') {
        successMsg = `✅ ${student.name} - پاس (${result.overall_percentage}%) - اڳتي وڌو!`;
      } else {
        successMsg = `✅ ${student.name} - ناڪام (${result.overall_percentage}%) - ساڳي ڪلاس ۾ رهندو`;
      }

      showMessage(successMsg, 'success');
      setHasChanged(false);

      // Move to next student or complete
      if (currentIndex < students.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setMessage('');
          setLastResult(null);
        }, 2000);
      } else {
        // All students completed
        setAllStudentsCompleted(true);
        setTimeout(() => {
          showMessage('🎉 هن ڪلاس جا سڀ شاگرد مڪمل ٿي ويا! ٻي ڪلاس چونڊيو.', 'success');
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || 'محفوظ ڪرڻ ۾ ناڪامي', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSelectAnotherClass = () => {
    setSelectedClassId(null);
    setStudents([]);
    setCurrentIndex(0);
    setMarksData({});
    setAllStudentsCompleted(false);
    setLastResult(null);
    setMessage('');
  };

  const currentStudent = students[currentIndex];
  const progress = students.length > 0 ? ((currentIndex + 1) / students.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">نمبر داخل ڪريو</h1>
          <p className="text-2xl font-bold opacity-90">{school?.school_name || 'اسڪول'}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          {/* Exam Metadata Form */}
          {!selectedClassId && (
            <div className="space-y-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">امتحان جي معلومات</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    امتحان سيشن *
                  </label>
                  <input
                    type="text"
                    value={examSession}
                    onChange={(e) => setExamSession(e.target.value)}
                    placeholder="مثال: Annual 2025"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    تعليمي سال *
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="مثال: 2025"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    امتحان جو قسم
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Mid-term">Mid-term</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    ڪل نمبر
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    استاد جو نالو (اختياري)
                  </label>
                  <input
                    type="text"
                    value={subjectTeacher}
                    onChange={(e) => setSubjectTeacher(e.target.value)}
                    placeholder="استاد جو نالو"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Class Selector */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              ڪلاس چونڊيو
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              disabled={students.length > 0 && !allStudentsCompleted || !examSession || !academicYear}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg disabled:bg-gray-100"
            >
              <option value="">-- ڪلاس چونڊيو --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {!examSession || !academicYear ? (
              <p className="text-sm text-red-600 mt-2">
                پهرين امتحان سيشن ۽ تعليمي سال ڀريو
              </p>
            ) : null}
          </div>

          {/* All Students Completed Message */}
          {allStudentsCompleted && (
            <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500 rounded-2xl p-8 text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                مبارڪ ٿيو! سڀ شاگرد مڪمل ٿي ويا
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                هن ڪلاس جا {students.length} شاگردن جا نمبر ڪاميابيءَ سان محفوظ ٿي ويا
              </p>
              <button
                onClick={handleSelectAnotherClass}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg"
              >
                ٻي ڪلاس چونڊيو
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {students.length > 0 && !allStudentsCompleted && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">
                  شاگرد {currentIndex + 1} / {students.length}
                </span>
                <span className="text-gray-600">{Math.round(progress)}% مڪمل</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Student Info & Marks Entry */}
          {currentStudent && !allStudentsCompleted && (
            <>
              {/* Student Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl mb-6 border-2 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">GR نمبر</span>
                    <p className="font-bold text-xl">{currentStudent.gr_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">شاگرد جو نالو</span>
                    <p className="font-bold text-xl">{currentStudent.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">پيءُ جو نالو</span>
                    <p className="font-bold text-xl">{currentStudent.father_name}</p>
                  </div>
                </div>
              </div>

              {/* Last Result Display */}
              {lastResult && (
                <div className={`mb-6 p-4 rounded-xl border-2 ${
                  lastResult.isAbsent
                    ? 'bg-yellow-50 border-yellow-400'
                    : lastResult.promotionStatus === 'promoted'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      {lastResult.isAbsent ? (
                        <p className="text-lg font-bold text-yellow-800">غير حاضر - ساڳي ڪلاس ۾ رهندو</p>
                      ) : (
                        <>
                          <p className="text-2xl font-bold">
                            {lastResult.promotionStatus === 'promoted' ? (
                              <span className="text-green-700">✓ پاس - اڳتي وڌو!</span>
                            ) : (
                              <span className="text-red-700">✗ ناڪام - ساڳي ڪلاس ۾ رهندو</span>
                            )}
                          </p>
                          <p className="text-lg text-gray-700">ڪل فيصد: {lastResult.percentage}%</p>
                        </>
                      )}
                    </div>
                    <div className="text-5xl">
                      {lastResult.isAbsent ? '⚠️' : lastResult.promotionStatus === 'promoted' ? '🎉' : '📚'}
                    </div>
                  </div>
                </div>
              )}

              {/* Subjects Marks */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">مضمونن جا نمبر</h3>
                {subjects.map((subject, idx) => {
                  const marks = currentMarks.find(m => m.subject_id === subject.id);
                  return (
                    <div key={subject.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                      </div>
                      <label className="w-40 md:w-48 font-medium text-lg">
                        {subject.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={totalMarks}
                        value={marks?.marks_obtained ?? ''}
                        onChange={(e) => handleMarksChange(subject.id, e.target.value)}
                        placeholder="نمبر"
                        className="flex-1 p-4 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:border-green-500 transition"
                      />
                      <span className="text-gray-600 font-medium">/ {totalMarks}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAbsent}
                  disabled={hasChanged || loading}
                  className="flex-1 py-6 text-xl font-semibold bg-red-100 hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed text-red-700 rounded-2xl transition-all"
                >
                  غير حاضر
                </button>

                <button
                  onClick={handleSave}
                  disabled={!hasChanged || loading}
                  className="flex-1 py-6 text-xl font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      محفوظ ٿي رهيو...
                    </>
                  ) : (
                    'محفوظ ڪريو ۽ اڳتي وڌو'
                  )}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className={`mt-6 p-4 rounded-lg text-center font-medium text-lg ${
                  messageType === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  {message}
                </div>
              )}
            </>
          )}

          {/* No Students Message */}
          {students.length === 0 && selectedClassId && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg text-center">
              <p className="text-lg">هن ڪلاس ۾ ڪو به شاگرد موجود ناهي</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SimpleMarksEntryPageWrapper() {
  return (
    <ProtectedRoute>
      <SimpleMarksEntryPage />
    </ProtectedRoute>
  );
}
