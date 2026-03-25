"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { studentApi, leavingCertificateApi, classApi } from "@/lib/api";
import { Student, Class } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CertificateFormData {
  student_id: number;
  gr_number: string;
  student_name: string;
  father_name: string;
  qom: string;
  caste: string;
  place_of_birth: string;
  date_of_birth: string;
  date_of_birth_in_letter: string;
  admission_date: string;
  previous_school: string;
  gr_of_previous_school: string;
  leaving_date: string;
  leaving_class_id: number;
  class_on_leaving: string;
  reason_for_leaving: string;
  educational_ability: string;
  character: string;
  remarks: string;
}

const initialForm: CertificateFormData = {
  student_id: 0,
  gr_number: "",
  student_name: "",
  father_name: "",
  qom: "",
  caste: "",
  place_of_birth: "",
  date_of_birth: "",
  date_of_birth_in_letter: "",
  admission_date: "",
  previous_school: "",
  gr_of_previous_school: "",
  leaving_date: "",
  leaving_class_id: 0,
  class_on_leaving: "",
  reason_for_leaving: "",
  educational_ability: "",
  character: "",
  remarks: "",
};

const LeavingCertificatePage = () => {
  const { school } = useSchool();
  const router = useRouter();
  const [formData, setFormData] = useState<CertificateFormData>(initialForm);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [existingCertificate, setExistingCertificate] = useState<any>(null);

  // Load students and classes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, classesResponse] = await Promise.all([
          studentApi.getAll(),
          classApi.getAll(),
        ]);

        setStudents(studentsResponse.data);
        setClasses(classesResponse.data);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle student selection
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = parseInt(e.target.value);
    const student = students.find((s) => s.id === studentId);

    if (student) {
      const currentClass = classes.find((c) => c.id === student.class_id);
      setFormData({
        ...initialForm,
        student_id: student.id,
        gr_number: student.gr_number,
        student_name: student.name,
        father_name: student.father_name,
        qom: student.qom || "",
        caste: student.caste || "",
        place_of_birth: student.place_of_birth || "",
        date_of_birth: student.date_of_birth,
        date_of_birth_in_letter: student.date_of_birth_in_letter || "",
        admission_date: student.admission_date,
        previous_school: student.previous_school || "",
        gr_of_previous_school: student.gr_of_previos_school || "",
        leaving_class_id: student.class_id || 0,
        class_on_leaving: currentClass?.name || "",
      });

      // Check if certificate already exists for this student
      checkExistingCertificate(student.id);
    } else {
      setFormData(initialForm);
      setExistingCertificate(null);
    }
  };

  // Check if certificate already exists
  const checkExistingCertificate = async (studentId: number) => {
    try {
      const response = await leavingCertificateApi.getByStudentId(studentId);
      setExistingCertificate(response.data);
      // Load the certificate data into the form for viewing
      setFormData({
        student_id: response.data.student_id,
        gr_number: response.data.gr_number,
        student_name: response.data.student_name,
        father_name: response.data.father_name,
        qom: response.data.qom || "",
        caste: response.data.caste || "",
        place_of_birth: response.data.place_of_birth || "",
        date_of_birth: response.data.date_of_birth,
        date_of_birth_in_letter: response.data.date_of_birth_in_letter || "",
        admission_date: response.data.admission_date,
        previous_school: response.data.previous_school || "",
        gr_of_previous_school: response.data.gr_of_previos_school || "",
        leaving_date: response.data.leaving_date,
        leaving_class_id: response.data.leaving_class_id || 0,
        class_on_leaving: response.data.class_on_leaving || "",
        reason_for_leaving: response.data.reason_for_leaving || "",
        educational_ability: response.data.educational_ability || "",
        character: response.data.character || "",
        remarks: response.data.remarks || "",
      });
    } catch (err) {
      setExistingCertificate(null);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // Special handling for leaving_class_id to auto-populate class_on_leaving
    if (name === "leaving_class_id") {
      const classId = parseInt(value);
      const selectedClass = classes.find((c) => c.id === classId);
      setFormData((prev) => ({
        ...prev,
        leaving_class_id: classId,
        class_on_leaving: selectedClass?.name || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setError(null);

    try {
      await leavingCertificateApi.create(formData);
      setSuccessMessage("اسڪول ڇڏڻ جو سرٽيفڪيٽ ڪاميابيءَ سان ٺاهيو ويو!");
      setFormData(initialForm);
      setExistingCertificate(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "ڪو مسئلو ٿيو");
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing certificate
  const handleViewCertificate = () => {
    if (existingCertificate) {
      router.push(`/leaving-certificate/certificate-download?studentId=${existingCertificate.student_id}`);
    }
  };


  if (loading && students.length === 0) {
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
    <>
      <style jsx global>{`
        @media print {
          /* Hide everything except what we want */
          body > *:not(.print-area-container) {
            display: none !important;
          }

          /* Make sure our container takes full page(s) */
          .print-area-container {
            display: block !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          /* Very important: remove any React modal/overlay stuff */
          .print\\:hidden,
          [data-radix-popper-content-wrapper],
          .fixed,
          .absolute:not(.print-area *) {
            display: none !important;
          }

          /* Optional: control page margins */
          @page {
            size: A4 portrait;
            margin: 1.2cm 1.8cm; /* ← adjust to match your design */
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto print-area">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              اسڪول ڇڏڻ جو سرٽيفڪيٽ
            </h1>
            <p className="text-2xl font-bold opacity-90">
              {school?.school_name || 'اسڪول'}
            </p>
            {school?.semis_code && (
              <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
            )}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
            {existingCertificate ? (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-yellow-800 font-medium">
                    ھي اسٽوڊنٽ لاءِ اسڪول ڇڏڻ جو سرٽيفڪيٽ اڳ ۾ ٺاھيو ويو آھي. GR
                    نمبر: {existingCertificate.gr_number}
                  </p>
                  <button
                    type="button"
                    onClick={handleViewCertificate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />

                    </svg>
                    ڏسو ۽ پرنٽ ڪريو
                  </button>
                </div>
              </div>
            ) : null}

            {successMessage && (
              <div
                className={`
                  fixed top-6 right-6 z-50
                  transition-all duration-1000 ease-out
                  ${successMessage ? "translate-x-0 opacity-100" : "translate-x-32 opacity-0"}
                  shadow-xl p-4 rounded-xl text-base md:text-lg  bg-green-50 text-green-900 border-l-4 border-green-500"}
                `}
              >
                <p>{successMessage}</p>
              </div>
            )}

            {error && (
              <div
                className={`
                  fixed top-6 right-6 z-50
                  transition-all duration-1000 ease-out
                  ${error ? "translate-x-0 opacity-100" : "translate-x-32 opacity-0"}
                  shadow-xl p-4 rounded-xl text-base md:text-lg  bg-red-50 text-red-900 border-l-4 border-red-500"}
                `}
              >
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    اسٽوڊنٽ چونڊيو
                  </label>
                  <select
                    value={formData.student_id}
                    onChange={handleStudentChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  >
                    <option value="">اسٽوڊنٽ چونڊيو</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} (GR: {student.gr_number})
                        {student.status === "left" && " - اسڪول ڇڏي چڪو"}
                        {student.status === "transferred" && " - منتقل ٿيل"}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    نوٽ: سڀ اسٽوڊنٽس ڏيکاريا ويا آهن (ايڪٽو ۽ اسڪول ڇڏيل)
                  </p>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    GR نمبر
                  </label>
                  <input
                    type="text"
                    value={formData.gr_number}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    اسٽوڊنٽ جو نالو
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    والد جو نالو
                  </label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    ڄمڻ جي تاريخ
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    داخلا جي تاريخ
                  </label>
                  <input
                    type="date"
                    name="admission_date"
                    value={formData.admission_date}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    ڪھڙي اسڪول مان آيو آهي (جيڪڏهن اسڪول ڇڏڻ جو سرٽيفڪيٽ آهي)
                  </label>
                  <input
                    type="text"
                    name="previous_school"
                    value={formData.previous_school}
                    onChange={handleChange}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر
                  </label>
                  <input
                    type="text"
                    name="gr_of_previous_school"
                    value={formData.gr_of_previous_school}
                    onChange={handleChange}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                    disabled={!!existingCertificate}
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    اسڪول ڃڏڻ جي تاريخ
                  </label>
                  <input
                    type="date"
                    name="leaving_date"
                    value={formData.leaving_date}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    اسڪول ڇڏڻ جو ڪلاس
                  </label>
                  <select
                    name="leaving_class_id"
                    value={formData.leaving_class_id}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  >
                    <option value="">ڇونڊيو</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    اسڪول ڇڏڻ جو سبب
                  </label>
                  <input
                    type="text"
                    name="reason_for_leaving"
                    value={formData.reason_for_leaving}
                    required
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    تعليمي قابليت
                  </label>
                  <select
                    name="educational_ability"
                    value={formData.educational_ability}
                    required
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  >
                    <option value="">ڇونڊيو</option>
                    <option value="شاندار">شاندار</option>
                    <option value="چڱو">چڱو</option>
                    <option value="چڱي">چڱي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="ناچڱو">ناچڱو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    ڇال ڇلت
                  </label>
                  <select
                    name="character"
                    value={formData.character}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  >
                    <option value="">چونڊيو</option>
                    <option value="شاندار">شاندار</option>
                    <option value="چڱو">چڱو</option>
                    <option value="چڱي">چڱي</option>
                    <option value="مطمعن">مطمعن</option>
                    <option value="ناچڱو">ناچڱو</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  ريمارڪس
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || !!existingCertificate}
                  className={`px-6 py-3 font-bold rounded-lg shadow-md flex items-center justify-center ${existingCertificate
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                    } transition duration-300`}
                >
                  {loading ? (
                    <>
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
                      محفوظ ڪري رهيو آهي...
                    </>
                  ) : existingCertificate ? (
                    "سرٽيفڪيٽ اڳ ۾ موجود آھي"
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      اسڪول ڇڏڻ جو سرٽيفڪيٽ ٺاھيو
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default function LeavingCertificatePageWrapper() {
  return (
    <ProtectedRoute>
      <LeavingCertificatePage />
    </ProtectedRoute>
  );
}
