"use client";

import { useState, useEffect } from "react";
import { studentApi, classApi, Student } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import Star from "@/components/star";
import { convertToSindhiDate } from "@/lib/sindhi-date";
import { addPendingStudent, getPendingStudentsCount } from "@/lib/offlineStorage";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

interface StudentFormData {
  class_id: string;
  gr_number: string;
  admission_date: string; // YYYY-MM-DD
  name: string;
  father_name: string;
  qom: string | null; // قوم = مسلمان، هندو، عيسائي وغيره
  caste: string | null;
  relation_with_guardian: string | null; // مثال: "پيءُ"، "ماءُ"، "ڀاءُ"، "ڀيڻ"، "چاچو"، "مامو" وغيره
  guardian_name: string | null;
  guardian_occupation: string | null;
  place_of_birth: string | null;
  address: string | null;
  date_of_birth: string; // YYYY-MM-DD
  date_of_birth_in_letter: string;
  previous_school: string | null;
  gr_of_previos_school: string | null;
  admission_class_id: number; // Class at admission (for GR, admission forms)
  current_class_id: number; // Current class (for result sheets, grades)
  gender: string; // ڇوڪرو يا ڇوڪري
  roll_number: string | null;
}

const initialForm: StudentFormData = {
  gr_number: "",
  admission_date: "",
  name: "",
  father_name: "",
  qom: null,
  caste: null,
  relation_with_guardian: null,
  guardian_name: null,
  guardian_occupation: null,
  place_of_birth: null,
  address: null,
  date_of_birth: "",
  date_of_birth_in_letter: "",
  previous_school: "نئون",
  gr_of_previos_school: null,
  admission_class_id: 0, // Will be set when classes load
  current_class_id: 0, // Will be set when classes load
  gender: "ڇوڪرو",
  roll_number: null,
  class_id: ""
};

function AdmissionForm() {
  const { school } = useSchool();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<StudentFormData>(initialForm);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [offlineMode, setOfflineMode] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  // Load classes on mount and update pending count
  useEffect(() => {
    classApi
      .getAll()
      .then((res) => {
        setClasses(res.data);
        // Set default class IDs to the first class if available
        if (res.data.length > 0 && formData.admission_class_id === 0) {
          setFormData((prev) => ({
            ...prev,
            admission_class_id: res.data[0].id,
            current_class_id: res.data[0].id,
          }));
        }
      })
      .catch((err) => console.error("Failed to load classes", err));

    // Update pending count
    setPendingCount(getPendingStudentsCount());
    // get all students
    studentApi.getAll().then((res) => {
      setAllStudents(res.data);
    });
  }, []);


  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit: create new student admission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate that classes are loaded
    if (formData.admission_class_id === 0 || formData.current_class_id === 0) {
      setMessage("مھرباني ڪري انتظار ڪريو، ڪلاس لوڊ ٿي رهيا آهن...");
      setLoading(false);
      return;
    }

    // Check for duplicate GR number
    const isDuplicate = allStudents.some(
      (student) => student.gr_number === formData.gr_number
    );
    if (isDuplicate) {
      setMessage("هي GR نمبر اڳ ۾ ئي موجود آهي. مھرباني ڪري مختلف GR نمبر استعمال ڪريو.");
      setLoading(false);
      return;
    }

    // Validate dates
    const birthDate = new Date(formData.date_of_birth);
    const admissionDate = new Date(formData.admission_date);
    const today = new Date();

    if (birthDate > today) {
      setMessage("پيدائش جي تاريخ مستقبل ۾ نٿي ٿي سگهي");
      setLoading(false);
      return;
    }

    if (admissionDate < birthDate) {
      setMessage("داخلا جي تاريخ پيدائش جي تاريخ کان اڳ نٿي ٿي سگهي");
      setLoading(false);
      return;
    }

    const payload = {
      gr_number: formData.gr_number,
      admission_date: formData.admission_date,
      name: formData.name,
      father_name: formData.father_name,
      qom: formData.qom,
      caste: formData.caste,
      relation_with_guardian: formData.relation_with_guardian,
      guardian_name: formData.guardian_name,
      guardian_occupation: formData.guardian_occupation,
      place_of_birth: formData.place_of_birth,
      address: formData.address,
      date_of_birth: formData.date_of_birth,
      date_of_birth_in_letter: formData.date_of_birth_in_letter,
      previous_school: formData.previous_school,
      gr_of_previos_school: formData.gr_of_previos_school,
      admission_class_id: formData.admission_class_id,
      current_class_id: formData.current_class_id,
      gender: formData.gender,
      roll_number: formData.roll_number,
    };

    try {
      if (offlineMode) {
        // Save to offline storage
        addPendingStudent(payload);
        const newCount = getPendingStudentsCount();
        setPendingCount(newCount);
        setMessage(`آف لائن محفوظ ٿيو! (${newCount} شاگرد انتظار ۾)`);
        setFormData(initialForm);
      } else {
        // Upload immediately
        const res = await studentApi.create(payload);
        setMessage(`GR Number: ${res.data.gr_number} - ڪاميابي سان داخل ٿيو`);
        setFormData(initialForm);
      }
    } catch (err: any) {
      setMessage("غلطي: " + (err.response?.data?.detail || "ڪو مسئلو ٿيو"));
    }
    setLoading(false);
  };
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 4500); // 4.5 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4 md:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto ">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">داخلا فارم</h1>
            <p className="text-2xl font-bold opacity-90">
              {school?.school_name || 'اسڪول'}
            </p>
            {school?.semis_code && (
              <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
            )}
          </div>

          {/* Search Section */}
          <div className="bg-gray-200 p-6 rounded-t-none rounded-2xl shadow-lg border border-green-100">
            {/* Offline Mode Toggle and Pending Students Button */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineMode}
                    onChange={(e) => setOfflineMode(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-lg font-medium text-gray-700">
                    آف لائن موڊ {offlineMode && "✓"}
                  </span>
                </label>
                {offlineMode && (
                  <span className="text-sm text-gray-600 bg-yellow-100 px-3 py-1 rounded-full">
                    ڊيٽا لوڪل محفوظ ٿيندو
                  </span>
                )}
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => router.push('/pending-students')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2 shadow-md"
                >
                  <span className="font-bold">{pendingCount}</span>
                  <span>شاگرد اپلوڊ ٿيڻ جي انتظار ۾</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>

            {message && (
              <div
                className={`
                    fixed top-6 right-6 z-50
                    transition-all duration-1000 ease-out
                    ${message ? "translate-x-0 opacity-100" : "translate-x-32 opacity-0"}
                    shadow-xl p-4 rounded-xl text-base md:text-lg
                    ${message.includes("ڪامياب") || message.includes("داخل") || message.includes("محفوظ") ? "bg-green-50 text-green-900 border-l-4 border-green-500" : "bg-red-50 text-red-900 border-l-4 border-red-500"}
                  `}
              >
                {message}
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    {/* check if gr_number is already in the database */}
                    {allStudents.filter((student) => student.gr_number === formData.gr_number).length > 0 && (
                      <span className="text-red-500">{allStudents.filter((student) => student.gr_number === formData.gr_number)[0].name}  GR نمبر {formData.gr_number} ڊيٽا بيس ۾ اڳ موجود آھي </span>
                    )}
                    <Star />
                  </label>
                  <input
                    type="number"
                    name="gr_number"
                    value={formData.gr_number}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="GR-XXXX"
                  />
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>شاگرد جو نالو</span>
                    <Star />
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="شاگرد جو نالو"
                  />
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>پيءُ جو نالو</span>
                    <Star />
                  </label>
                  <input
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پيءُ جو نالو"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-pink-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>جنس</span>
                    <Star />
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  >
                    <option value="ڇوڪرو">ڇوڪرو</option>
                    <option value="ڇوڪري">ڇوڪري</option>
                  </select>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    قوم
                  </label>
                  <input
                    name="qom"
                    value={formData.qom || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="قوم = مسلمان، هندو، عيسائي وغيره"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    ذات
                  </label>
                  <input
                    name="caste"
                    value={formData.caste || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder=" ذات"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-teal-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>پيدائش جي تاريخ</span>
                    <Star />
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  />
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>پيدائش جي تاريخ (لفظن ۾)</span>
                    <Star />
                  </label>
                  <input
                    name="date_of_birth_in_letter"
                    value={formData.date_of_birth_in_letter}
                    onChange={handleChange}
                    required
                    placeholder="مثال: ٽي جنوري ٻہ ھزار ٽي"
                    className="hidden"
                  />
                  <span className=" p-3 border border-gray-300 rounded-lg shadow-sm text-base md:text-lg mb-2 block font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                    {(() => {
                      const sindhiDate = convertToSindhiDate(
                        formData.date_of_birth,
                      ) as string | "";
                      formData.date_of_birth_in_letter = sindhiDate;
                      return typeof sindhiDate === "string" &&
                        sindhiDate.trim() !== "" &&
                        sindhiDate.includes("ٻہ ھزار")
                        ? `${sindhiDate}`
                        : "(مهرباني ڪري صحيح تاريخ چونڊيو)";
                    })()}
                  </span>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>داخلہ جي تاريخ</span>
                    <Star />
                  </label>
                  <input
                    type="date"
                    name="admission_date"
                    value={formData.admission_date}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    سرپرست جو نالو
                  </label>
                  <input
                    name="guardian_name"
                    value={formData.guardian_name || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="سرپرست جو نالو"
                  />
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    سرپرست سان تعلق
                  </label>
                  <input
                    name="relation_with_guardian"
                    value={formData.relation_with_guardian || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="سرپرست سان تعلق (مثال: پيءُ، ماءُ، ڀاءُ، ڀيڻ، چاچو، مامو وغيره) "
                  />
                </div>
                <div className="bg-lime-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    سرپرست جو ڌنڌو
                  </label>
                  <input
                    name="guardian_occupation"
                    value={formData.guardian_occupation || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="سرپرست جو ڌنڌو"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>داخلا جي ڪلاس</span>
                    <Star />
                  </label>
                  <select
                    name="admission_class_id"
                    value={formData.admission_class_id}
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        admission_class_id: Number(e.target.value),
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">GR ۽ داخلا فارم ۾ استعمال ٿيندو</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>موجوده ڪلاس</span>
                    <Star />
                  </label>
                  <select
                    name="current_class_id"
                    value={formData.current_class_id}
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        current_class_id: Number(e.target.value),
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">نتيجا ۽ گريڊ ڪارڊ ۾ استعمال ٿيندو</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    پيدا ٿيڻ جي جاءِ
                  </label>
                  <input
                    name="place_of_birth"
                    value={formData.place_of_birth || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پيدا ٿيڻ جي جاءِ"
                  />
                </div>
              </div> {/* Close previous .grid div */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyan-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    پهريون اسڪول (جيڪڏهن هجي)
                  </label>
                  <input
                    name="previous_school"
                    value={formData.previous_school || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پويون اسڪول جو نالو"
                  />
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    پويون اسڪول GR نمبر
                  </label>
                  <input
                    name="gr_of_previos_school"
                    value={formData.gr_of_previos_school || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پويون اسڪول GR نمبر"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center"
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
                        داخلا محفوظ ڪريو
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdmissionPageWrapper() {
  return (
    <ProtectedRoute>
      <AdmissionForm />
    </ProtectedRoute>
  );
}
