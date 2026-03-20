"use client";

import { useState, useEffect } from "react";
import { studentApi, classApi } from "@/lib/api";
import { Student, Class } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ViewAdmission from "@/components/view_admission";
import ViewLeavingCertificate from "@/components/view_leaving_certificate";
import { getToken } from "@/lib/auth";

const StudentsPage = () => {
  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showLeavingCertModal, setShowLeavingCertModal] = useState(false);
  const [leavingCertData, setLeavingCertData] = useState<any>(null);
  const [loadingCert, setLoadingCert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const classesResponse = await classApi.getAll();
        setClasses(classesResponse.data);

        // Fetch all students
        const studentsResponse = await studentApi.getAll();
        setStudents(studentsResponse.data);
      } catch (err) {
        setError("Failed to load students data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  

  // Filter students based on selected class and search term
  const filteredStudents = students.filter((student) => {
    const matchesClass = selectedClass
      ? student.class_id === selectedClass
      : true;
    const matchesSearch = searchTerm
      ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.gr_number.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesClass && matchesSearch;
  });

  const handleViewAdmission = (student: Student) => {
    setSelectedStudent(student);
    setShowAdmissionModal(true);
  };

  const handlePrintAdmission = async () => {
    if (!selectedStudent || !selectedStudent.id) return;

    try {

      // Get the auth token using the auth utility
      setLoadingPdf(true);
      const token = getToken();

      // Fetch the PDF with authentication
      const response = await fetch(`/api/pdf/admission-form?studentId=${selectedStudent.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admission-form-${selectedStudent.gr_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("PDF ڊائونلوڊ ڪرڻ ۾ مسئلو آيو");
    }
    setLoadingPdf(false);
  };

  const handleViewGR = async (student: Student) => {
    try {
      const token = getToken();

      // Fetch the GR PDF with authentication
      const response = await fetch(`/api/pdf/gr?studentId=${student.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate GR PDF");
      }

      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gr-${student.gr_number}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading GR PDF:", error);
      alert("GR PDF ڊائونلوڊ ڪرڻ ۾ مسئلو آيو");
    }
  };

  const handleViewLeavingCertificate = async (student: Student) => {
    try {
      setLoadingCert(true);
      const token = getToken();

      // Fetch the leaving certificate data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/school-leaving-certificates/${student.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaving certificate");
      }

      const certData = await response.json();
      setLeavingCertData(certData);
      setSelectedStudent(student);
      setShowLeavingCertModal(true);
    } catch (error) {
      console.error("Error fetching leaving certificate:", error);
      alert("ڇڏڻ جو سرٽيفڪيٽ لوڊ ڪرڻ ۾ مسئلو آيو");
    } finally {
      setLoadingCert(false);
    }
  };

  const handlePrintLeavingCertificate = async () => {
    if (!selectedStudent || !selectedStudent.id) return;

    try {
      setLoadingPdf(true);
      const token = getToken();

      const response = await fetch(`/api/pdf/leaving-certificate?studentId=${selectedStudent.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leaving-certificate-${selectedStudent.gr_number}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("PDF ڊائونلوڊ ڪرڻ ۾ مسئلو آيو");
    } finally {
      setLoadingPdf(false);
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">اسٽوڊنٽس</h1>
          <p className="text-2xl font-bold opacity-90">
            {school?.school_name || 'اسڪول'}
          </p>
          {school?.semis_code && (
            <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedClass}
                onChange={(e) =>
                  setSelectedClass(e.target.value ? Number(e.target.value) : "")
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
              >
                <option value="">سڀ ڪلاسز</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="نالو، والد جو نالو يا GR نمبر سان ڳولا ڪريو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
              />
            </div>

            <a
              href="/admission"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 text-center"
            >
              نئون داخلو
            </a>
          </div>

          {/* Students Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    GR نمبر
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    سريل نمبر
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    نالو
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    والد جو نالو
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ڪلاس
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    جنس
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    حالت
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ڊيٽا
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    عمل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={index}
                      className={` ${index %2 === 0 ? "bg-gray-300" : "bg-blue-50"} rounded-lg`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {student.gr_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {index + 1}
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {student.father_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {classes.find((c) => c.id === student.current_class_id)?.name ||
                          "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {student.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-md leading-5 font-semibold rounded-full ${
                            student.status === "active"
                              ? "bg-green-100 text-green-800"
                              : student.status === "left"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.status === "active"
                            ? "ايڪٽو"
                            : student.status === "left"
                              ? "ڇڏي چڪو"
                              : "منتقل ٿيل"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.admission_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {student.status === "left" ? (
                          <button
                            onClick={() => handleViewLeavingCertificate(student)}
                            disabled={loadingCert}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            ڇڏڻ جو سرٽيفڪيٽ
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewAdmission(student)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            داخلا فارم
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {searchTerm || selectedClass
                        ? "ڪوبه اسٽوڊنٽ نه لڌو"
                        : "ڪوبه اسٽوڊنٽ نه آهي"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Students Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">GR: {student.gr_number}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : student.status === "left"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.status === "active"
                        ? "فعال"
                        : student.status === "left"
                          ? "ڇڏي ويو"
                          : "منتقل"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">والد جو نالو:</span>
                      <span className="text-gray-900 font-medium">{student.father_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ڪلاس:</span>
                      <span className="text-gray-900 font-medium">
                        {classes.find((c) => c.id === student.current_class_id)?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">جنس:</span>
                      <span className="text-gray-900 font-medium">{student.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">داخلا جي تاريخ:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(student.admission_date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {student.status === "left" ? (
                      <button
                        onClick={() => handleViewLeavingCertificate(student)}
                        disabled={loadingCert}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        ڇڏڻ جو سرٽيفڪيٽ
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewAdmission(student)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        داخلا فارم
                      </button>
                    )}
                    <button
                      onClick={() => handleViewGR(student)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      GR ڏسو
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm || selectedClass
                    ? "ڪوبه اسٽوڊنٽ نه لڌو"
                    : "ڪوبه اسٽوڊنٽ نه آهي"}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">ڪل اسٽوڊنٽس</p>
              <p className="text-xl font-bold text-blue-700">
                {students.length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">ايڪٽو اسٽوڊنٽس</p>
              <p className="text-xl font-bold text-green-700">
                {students.filter((s) => s.status === "active").length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600">اسڪول ڇڏيل اسٽوڊنٽس</p>
              <p className="text-xl font-bold text-red-700">
                {students.filter((s) => s.status === "left").length}
              </p>
            </div>
          </div>
        </div>

        {/* Admission Form Modal */}
        {showAdmissionModal && selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAdmissionModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="text-xl font-semibold text-gray-800">
                  داخلہ فارم - {selectedStudent.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="بند ڪريو"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <ViewAdmission
                  formData={{
                    ...selectedStudent,
                    class_id: selectedStudent.admission_class_id,
                    address: selectedStudent.current_address
                  }}
                  classes={classes}
                />

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAdmissionModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    بند ڪريو
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintAdmission}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
                  >
                    {
                      loadingPdf ?
                      <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      :
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                    </svg>
                      }

                   {loadingPdf ? "انتظار ڪريو":" PDF ڊائونلوڊ ڪريو"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaving Certificate Modal */}
        {showLeavingCertModal && leavingCertData && selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowLeavingCertModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="text-xl font-semibold text-gray-800">
                  اسڪول ڇڏڻ جو سرٽيفڪيٽ - {selectedStudent.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLeavingCertModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="بند ڪريو"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <ViewLeavingCertificate formData={leavingCertData} />

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowLeavingCertModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    بند ڪريو
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintLeavingCertificate}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
                  >
                    {loadingPdf ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    )}
                    {loadingPdf ? "انتظار ڪريو" : "PDF ڊائونلوڊ ڪريو"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function StudentsPageWrapper() {
  return (
    <ProtectedRoute>
      <StudentsPage />
    </ProtectedRoute>
  );
}
