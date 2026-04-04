"use client";

import { useState, useEffect } from "react";
import { studentApi, classApi, School } from "@/lib/api";
import { Student, Class } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSchool } from "@/contexts/SchoolContext";
import Image from "next/image";

const Dashboard = () => {
  const [studentData, setStudentData] = useState<Student[]>([])
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { school } = useSchool();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all students
        const studentsResponse = await studentApi.getAll();
        const allStudents: Student[] = studentsResponse.data;
        console.log(allStudents.length);

        setStudentData(allStudents)

        // Calculate stats
        setTotalStudents(allStudents.length);
        const activeCount = allStudents.filter(
          (s) => s.status === "active",
        ).length;
        setActiveStudents(activeCount);

        // Fetch classes
        const classesResponse = await classApi.getAll();
        setClasses(classesResponse.data);
        setTotalClasses(classesResponse.data.length);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-green-600 rounded w-48 mx-auto mb-2"></div>
              <div className="h-6 bg-green-600 rounded w-32 mx-auto"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md">
                  <div className="animate-pulse">
                    <div className="h-4 bg-blue-200 rounded w-24 mb-3"></div>
                    <div className="h-10 bg-blue-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-blue-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Classes Skeleton */}
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
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
          {/* School Logo */}
          {school?.logo_url && (
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 relative">
                <Image
                  src={school.logo_url}
                  alt="School Logo"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ڊيش بورڊ</h1>
          <p className="text-2xl font-bold opacity-90">
            {school?.school_name || 'گورنمينٽ بوائز پرائمري اسڪول'}
          </p>
          {school?.established_year && (
            <p className="text-lg opacity-80 mt-2">
              قائم ٿيڻ جو سال: {school.established_year}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Total Students Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 text-white">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    ڪل اسٽوڊنٽس
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStudents}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Students Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 text-white">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    ايڪٽو اسٽوڊنٽس
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeStudents}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Classes Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-md border border-yellow-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 text-white">
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
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">ڪل ڪلاسز</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalClasses}
                  </p>
                </div>
              </div>
            </div>

            {/* Left Students Card */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-md border border-red-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-500 text-white">
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    پاس آئوٽ ٿيل شاگرد
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStudents - activeStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Overview */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ڪلاسز جي معلومات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-gradient-to-br from-rose-50 via-amber-50 to-red-100">

                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200/40 rounded-full"></div>
                  <div className="absolute top-20 -left-16 w-32 h-32 bg-amber-200/40 rounded-full"></div>

                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-amber-400 to-amber-500 py-3">
                    <h3 className="text-center text-xl font-extrabold text-gray-900 tracking-wide">
                      {cls.name}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="relative grid grid-cols-3 gap-4 px-4 py-6 text-center">

                    {/* Boys */}
                    <div className="bg-white/90 rounded-xl shadow-sm border border-blue-200 p-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 text-xl font-bold">♂</span>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-800">
                        {studentData.filter(
                          (student) => student.class_id === cls.id && student.gender === "ڇوڪرو"
                        ).length}
                      </p>
                      <p className="mt-1 font-semibold text-gray-700">ڇوڪرا</p>
                    </div>

                    {/* Girls */}
                    <div className="bg-white/90 rounded-xl shadow-sm border border-pink-200 p-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-pink-700 text-xl font-bold">♀</span>
                      </div>
                      <p className="text-2xl font-extrabold text-pink-800">
                        {studentData.filter(
                          (student) => student.class_id === cls.id && student.gender === "ڇوڪري"
                        ).length}
                      </p>
                      <p className="mt-1 font-semibold text-gray-700">ڇوڪريون</p>
                    </div>

                    {/* Total */}
                    <div className="bg-white/95 rounded-xl shadow-md border border-gray-300 p-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center ">
                        <span className="text-gray-800 text-xl font-bold">∑</span>
                      </div>
                      <p className="text-3xl font-extrabold text-gray-900">
                        {studentData.filter(
                          (student) => student.class_id === cls.id
                        ).length}
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">ٽوٽل</p>
                    </div>

                  </div>
                </div>
              ))}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-gradient-to-br from-rose-50 via-amber-50 to-red-100">

                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200/40 rounded-full"></div>
                <div className="absolute top-20 -left-16 w-32 h-32 bg-amber-200/40 rounded-full"></div>

                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-400 to-amber-500 py-3">
                  <h3 className="text-center text-xl font-extrabold text-gray-900 tracking-wide">
                    ٽوٽل داخلا
                  </h3>
                </div>

                {/* Content */}
                <div className="relative grid grid-cols-3 gap-4 px-4 py-6 text-center">

                  {/* Boys */}
                  <div className="bg-white/90 rounded-xl shadow-sm border border-blue-200 p-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 text-xl font-bold">♂</span>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-800">
                      {studentData.filter(s => s.gender === "ڇوڪرو").length}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700">ڇوڪرا</p>
                  </div>

                  {/* Girls */}
                  <div className="bg-white/90 rounded-xl shadow-sm border border-pink-200 p-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-pink-700 text-xl font-bold">♀</span>
                    </div>
                    <p className="text-2xl font-extrabold text-pink-800">
                      {studentData.filter(s => s.gender === "ڇوڪري").length}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700">ڇوڪريون</p>
                  </div>

                  {/* Total */}
                  <div className="bg-white/95 rounded-xl shadow-md border border-gray-300 p-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-800 text-xl font-bold">∑</span>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {studentData.length}
                    </p>
                    <p className="mt-1 font-semibold text-gray-800">ٽوٽل</p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              جلدي ايڪشن
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <a
                href="/admission"
                className="bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>نئون داخلو</span>
                </div>
              </a>

              <a
                href="/students"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>اسٽوڊنٽس ڏسو</span>
                </div>
              </a>

              <a
                href="/admin/students"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-red-700 hover:to-red-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>اسٽوڊنٽس اپڊيٽ ڪريو</span>
                </div>
              </a>
              <a
                href="/results"
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>رزلٽ اپڊيٽ ڪريو</span>
                </div>
              </a>

              <a
                href="/results/resultsheet"
                className="bg-gradient-to-r from-orange-600 to-orange-600 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-orange-700 hover:to-orange-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>رزلٽ شيٽ ڊائونلوڊ ڪريو</span>
                </div>
              </a>

              <a
                href="/results/manage"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>رزلٽ شيٽ مئنيجمينٽ</span>
                </div>
              </a>

              <a
                href="/results"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>نتيجا ڏسو</span>
                </div>
              </a>
              <a
                href="/gr"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span>جنرل رجسٽر ڏسو</span>
                </div>
              </a>
              <a
                href="/admin/classes"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center py-4 px-6 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                  <span>ڪلاس مئنيجمينٽ</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
