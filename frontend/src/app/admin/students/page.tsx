"use client";

import { useState, useEffect } from "react";
import { studentApi, classApi } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import Star from '@/components/star';
import ProtectedRoute from '@/components/ProtectedRoute';
import { convertToSindhiDate } from "@/lib/sindhi-date";
import ConfirmDialog from '@/components/ConfirmDialog';
import ImageUpload from '@/components/ImageUpload';
import axios from 'axios';

interface StudentFormData {
  gr_number: string;
  admission_date: string;
  name: string;
  father_name: string;
  qom: string | null;
  caste: string | null;
  relation_with_guardian: string | null;
  guardian_name: string | null;
  guardian_occupation: string | null;
  place_of_birth: string | null;
  address: string | null;
  date_of_birth: string;
  date_of_birth_in_letter: string;
  previous_school: string | null;
  gr_of_previos_school: string | null;
  admission_class_id: number;
  current_class_id: number;
  gender: string;
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
  previous_school: null,
  gr_of_previos_school: null,
  admission_class_id: 1,
  current_class_id: 1,
  gender: "ڇوڪرو",
  roll_number: null,
};

function AdminStudentUpdate() {
  const { school } = useSchool();
  const [formData, setFormData] = useState<StudentFormData>(initialForm);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [message, setMessage] = useState("");
  const [searchGr, setSearchGr] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load classes on mount
  useEffect(() => {
    classApi.getAll()
      .then((res) => setClasses(res.data))
      .catch((err) => console.error("Failed to load classes", err));
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Search & Load existing student by GR number
  const handleSearch = async () => {
    if (!searchGr.trim()) {
      setMessage("مھرباني ڪري GR نمبر داخل ڪريو");
      return;
    }
    setLoading(true);
    try {
      const res = await studentApi.getAll();
      const student = res.data.find(
        (s: any) => s.gr_number === searchGr.trim()
      );
      if (student) {
        setEditingStudentId(student.id);
        setFormData({
          gr_number: student.gr_number,
          admission_date: student.admission_date,
          name: student.name,
          father_name: student.father_name,
          qom: student.qom || null,
          caste: student.caste || null,
          relation_with_guardian: student.relation_with_guardian || null,
          guardian_name: student.guardian_name || null,
          guardian_occupation: student.guardian_occupation || null,
          place_of_birth: student.place_of_birth || null,
          address: student.current_address || null,
          date_of_birth: student.date_of_birth,
          date_of_birth_in_letter: student.date_of_birth_in_letter || "",
          previous_school: student.previous_school || null,
          gr_of_previos_school: student.gr_of_previos_school || null,
          admission_class_id: student.admission_class_id || student.class_id,
          current_class_id: student.current_class_id || student.class_id,
          gender: student.gender,
          roll_number: student.roll_number || null,
        });
        setMessage("اسٽوڊنٽ جو رڪارڊ لوڊ ٿي ويو");
      } else {
        setMessage("GR نمبر نه مليو");
        setEditingStudentId(null);
        setFormData(initialForm);
      }
    } catch (err) {
      setMessage("ڪو مسئلو ٿيو");
    }
    setLoading(false);
  };

  // Update student
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudentId === null) {
      setMessage("پهرين اسٽوڊنٽ ڳوليو");
      return;
    }

    setLoading(true);
    setMessage("");

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
      class_id: formData.current_class_id,
      gender: formData.gender,
      roll_number: formData.roll_number,
    };

    try {
      const res = await studentApi.update(editingStudentId, payload);
      setMessage(`${res.data.name} - ڪاميابي سان اپڊيٽ ٿي ويو`);
    } catch (err: any) {
      setMessage("غلطي: " + (err.response?.data?.detail || "ڪو مسئلو ٿيو"));
    }
    setEditingStudentId(null);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoadingD(true);
    try {
      await studentApi.delete(editingStudentId!);
      setMessage(`ڪاميابي سان ڊيليٽ ٿي ويو`);
      setEditingStudentId(null);
      setFormData(initialForm);
      setSearchGr("");
      setShowDeleteConfirm(false);
    } catch (err: any) {
      setMessage("غلطي: " + (err.response?.data?.detail || "ڪو مسئلو ٿيو"));
    }
    setLoadingD(false);
  };

  const handleReset = () => {
    setFormData(initialForm);
    setEditingStudentId(null);
    setSearchGr("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-10 px-4 md:px-8 lg:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-700 to-red-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ايڊمن - اسٽوڊنٽ اپڊيٽ</h1>
          <p className="text-2xl font-bold opacity-90">{school?.school_name || 'اسڪول'}</p>
          {school?.semis_code && (
            <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-b-2xl shadow-lg border border-orange-100">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>اسٽوڊنٽ ڳولا (GR نمبر سان)</p>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={searchGr}
                onChange={(e) => setSearchGr(e.target.value)}
                placeholder="مثال: 451"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-base md:text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition duration-300 flex items-center justify-center text-base md:text-lg gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ڳولا ڪري رهيو آهي...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>ڳولا ڪريو</p>
                  </>
                )}
              </button>
            </div>

            {message && (
              <div className={`mt-3 p-3 rounded-lg text-base md:text-lg ${message.includes("ڪامياب") || message.includes("لوڊ") ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}

            {editingStudentId != null ? (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex flex-wrap items-center gap-2">
                <span className="text-blue-800 font-medium">اسٽوڊنٽ جو ڊيٽا اپڊيٽ ڪري رهيا آهيو (ID: {editingStudentId})</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  ري سيٽ ڪريو
                </button>
              </div>
            ) : (
              <p className="mt-2 text-gray-600 text-sm">پهرين GR نمبر سان اسٽوڊنٽ ڳوليو، پوءِ ڊيٽا اپڊيٽ يا ڊيليٽ ڪري سگهو ٿا.</p>
            )}
          </div>

          {/* Update Form - Only show when student is loaded */}
          {editingStudentId != null && (
            <form onSubmit={handleSubmit} className="space-y-8 mt-8 pt-8 border-t-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>GR نمبر</span>
                    <Star />
                  </label>
                  <input
                    name="gr_number"
                    value={formData.gr_number}
                    // onChange={handleChange}
                    required
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="GR-XXXX"
                  />
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>جنس</span>
                    <Star />
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  >
                    <option value="ڇوڪرو">ڇوڪرو</option>
                    <option value="ڇوڪري">ڇوڪري</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    قوم
                  </label>
                  <input
                    name="qom"
                    value={formData.qom || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="قوم"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    ذات
                  </label>
                  <input
                    name="caste"
                    value={formData.caste || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="ذات"
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
                    className="hidden"
                    placeholder="پيدائش جي تاريخ (لفظن ۾)"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    پيدا ٿيڻ جي جاءِ
                  </label>
                  <input
                    name="place_of_birth"
                    value={formData.place_of_birth || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پيدا ٿيڻ جي جاءِ"
                  />
                </div>

                <div className="bg-red-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    سرپرست سان تعلق
                  </label>
                  <input
                    name="relation_with_guardian"
                    value={formData.relation_with_guardian || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="سرپرست سان تعلق"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    سرپرست جو نالو
                  </label>
                  <input
                    name="guardian_name"
                    value={formData.guardian_name || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="سرپرست جو نالو"
                  />
                </div>

                <div className="bg-lime-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    سرپرست جو ڌنڌو
                  </label>
                  <input
                    name="guardian_occupation"
                    value={formData.guardian_occupation || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="سرپرست جو ڌنڌو"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyan-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    پهريون اسڪول (جيڪڏهن هجي)
                  </label>
                  <input
                    name="previous_school"
                    value={formData.previous_school || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پويون اسڪول جو نالو"
                  />
                </div>
                <div className="bg-teal-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    پويون اسڪول جو GR نمبر
                  </label>
                  <input
                    name="gr_of_previos_school"
                    value={formData.gr_of_previos_school || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="پويون اسڪول جو GR نمبر"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>داخلا وقت جي ڪلاس</span>
                    <Star />
                  </label>
                  <select
                    name="admission_class_id"
                    value={formData.admission_class_id}
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
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-lg md:text-xl font-medium text-gray-700 mb-2">
                    <span>موجوده ڪلاس</span>
                    <Star />
                  </label>
                  <select
                    name="current_class_id"
                    value={formData.current_class_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        current_class_id: Number(e.target.value),
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-base md:text-lg"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    موجوده پتو
                  </label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="موجوده رهائش جو پتو"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl">
                  <label className="block text-lg md:text-xl font-medium text-gray-700 mb-2">
                    رول نمبر (ڪلاس ۾)
                  </label>
                  <input
                    name="roll_number"
                    value={formData.roll_number || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm text-base md:text-lg"
                    placeholder="ڪلاس ۾ رول نمبر"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-700 text-white text-lg font-bold rounded-lg hover:from-orange-700 hover:to-red-800 disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center"
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
                      اپڊيٽ محفوظ ڪريو
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loadingD}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-lg font-bold rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  ڊيليٽ ڪريو
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-4 bg-gray-600 text-white text-lg font-bold rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-lg"
                >
                  منسوخ ڪريو
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="اسٽوڊنٽ ڊيليٽ ڪريو"
          message={`ڇا توهان پڪ سان هن اسٽوڊنٽ کي ڊيليٽ ڪرڻ چاهيو ٿا؟\n\nنالو: ${formData.name}\nGR نمبر: ${formData.gr_number}\n\nهي عمل واپس نه ٿو ٿي سگهي!`}
          confirmText="ها، ڊيليٽ ڪريو"
          cancelText="نه، منسوخ ڪريو"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          isLoading={loadingD}
        />
      </div>
    </div>
  );
}

export default function AdminStudentUpdateWrapper() {
  return (
    <ProtectedRoute>
      <AdminStudentUpdate />
    </ProtectedRoute>
  );
}
