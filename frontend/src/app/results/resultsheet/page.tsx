"use client";

import { Class, classApi, Student, studentApi } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import { useState, useEffect } from "react";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

function ResultSheetUI() {
  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, classesResponse] = await Promise.all([
          studentApi.getAll(),
          classApi.getAll(),
        ]);

        setStudents(studentsResponse.data || []);
        setClasses(classesResponse.data || []);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePdfDownload = async () => {
    try {
      // Call the specific resultsheet PDF API route
      setLoadingPDF(true);

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');

      const response = await fetch("/api/pdf/resultsheet", {
        method: "GET",
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "resultsheet.pdf";
      document.body.appendChild(a);
      a.click();
      // Cleanup
      a.remove();
      setLoadingPDF(false);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("PDF download failed.");
      console.error(err);
      setLoadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xl">Loading result sheet...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 text-xl">{error}</div>
    );
  }

  return (
    <div className="w-full bg-white text-black print-area px-4 py-6 min-h-screen">
      {/* PRINT SETTINGS */}
      <style jsx global>{`
        @page {
          size: legal landscape;
          margin: 10mm 8mm;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th,
        td {
          border: 1px solid #000;
          font-size: 16pt;
          text-align: center;
          vertical-align: middle;
        }
        .sindhi {
          direction: rtl;
          text-align: center;
        }
        .class-header {
          background-color: #e5e5e5;
          font-weight: bold;
          font-size: 14pt;
          padding: 2mm;
        }
        .no-break {
          page-break-inside: avoid;
        }
        .tr {
          height: 20mm;
        }
        /* Force each class to start on a new page */
        .class-section {
          page-break-before: always;
        }
        /* Don't break the first class to a new page */
        .class-section:first-child {
          page-break-before: auto;
        }
        /* Keep class header with at least one student row */
        .class-name-row {
          page-break-after: avoid;
        }
        /* Keep gender section headers with their students */
        .gender-header {
          page-break-after: avoid;
        }
        thead {
          display: table-header-group;
        }
        tbody {
          display: table-row-group;
        }
      `}</style>
      {/* MAIN TABLE */}
      <table className="w-full">
        <colgroup>
          <col style={{ width: "20mm" }} /> {/* GR */}
          <col style={{ width: "18mm" }} /> {/* Roll */}
          <col style={{ width: "42mm" }} /> {/* Student Name */}
          <col style={{ width: "42mm" }} /> {/* Father Name */}
          <col style={{ width: "18mm" }} /> {/* دينيات */}
          <col style={{ width: "18mm" }} /> {/* مادري زبان */}
          <col style={{ width: "18mm" }} /> {/* رياضي */}
          <col style={{ width: "18mm" }} /> {/* سماجي اڀياس */}
          <col style={{ width: "20mm" }} /> {/* جنرل سائنس */}
          <col style={{ width: "18mm" }} /> {/* اردو */}
          <col style={{ width: "18mm" }} /> {/* انگلش */}
          <col style={{ width: "22mm" }} /> {/* ڊرائنگ / فنون */}
          <col style={{ width: "24mm" }} /> {/* DOB */}
          <col style={{ width: "24mm" }} /> {/* Admission Date */}
          <col style={{ width: "22mm" }} /> {/* Pass/Fail */}
        </colgroup>

        <thead>
          {/* SCHOOL HEADER - Simplified for print/PDF repetition */}
          <tr>
            <th colSpan={15} className="sindhi">
              <h1 className="font-bold text-4xl">جديد رزلٽ شيٽ - سال ـ 2026</h1>
              <div className="flex items-center justify-center space-x-8 font-normal ">
                <p>نقشو امتحان جي مارڪن جو</p>
                <p className="font-bold italic underline underline-offset-8">{school?.school_name || 'اسڪول'}</p>
                <p>
                  جي درجي ـــــــــــــــــــ جو ساليانو امتحان تاريخ ـــــــــــ مھينو ـــــــــــــــــــــ
                  سال ـــــــــــــــــــــ
                </p>
              </div>
            </th>
          </tr>

          {/* COLUMN HEADERS */}
          <tr className="tr">
            <th rowSpan={2} className="sindhi">
              جنرل رجسٽر نمبر
            </th>
            <th rowSpan={2} className="sindhi">
              ڳاڻيٽي جو نمبر
            </th>
            <th rowSpan={2} className="sindhi">
              شاگرد جو نالو
            </th>
            <th rowSpan={2} className="sindhi">
              پيءُ جو نالو
            </th>
            <th className="sindhi">دينيات</th>
            <th className="sindhi">مادري زبان</th>
            <th className="sindhi">رياضي</th>
            <th className="sindhi">سماجي اڀياس</th>
            <th className="sindhi">جنرل سائنس</th>
            <th className="sindhi">اردو</th>
            <th className="sindhi">انگلش</th>
            <th className="sindhi">ڊرائنگ / علم فنون</th>
            <th rowSpan={2} className="sindhi">
              ڄمڻ جي تاريخ
            </th>
            <th rowSpan={2} className="sindhi">
              داخلا جي تاريخ
            </th>
            <th rowSpan={2} className="sindhi">
              پاس يا ناپاس
            </th>
          </tr>
          <tr>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
            <th className="sindhi">100</th>
          </tr>
        </thead>

        <tbody>
          {classes.map((cls, classIndex) => {
            const classStudents = students.filter((s) => s.current_class_id === cls.id);
            const boys = classStudents.filter(
              (s) =>
                s.gender === "ڇوڪرو" ||
                s.gender === "boy" ||
                s.gender === "Male" ||
                s.gender === "Boy",
            );
            const girls = classStudents.filter(
              (s) =>
                s.gender === "ڇوڪري" ||
                s.gender === "girl" ||
                s.gender === "Female" ||
                s.gender === "Girl",
            );

            const renderStudents = (
              studentList: Student[],
              startIndex: number,
            ) => {
              return studentList.map((std, index) => (
                <tr key={std.id} className="no-break">
                  <td>{std.gr_number || "-"}</td>
                  <td>{startIndex + index + 1}</td>
                  <td className="sindhi">{std.name || "-"}</td>
                  <td className="sindhi">{std.father_name || "-"}</td>

                  {/* Marks - currently empty */}
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>

                  <td>
                    {std.date_of_birth
                      ? new Date(std.date_of_birth).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td>
                    {std.admission_date
                      ? new Date(std.admission_date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td></td>
                </tr>
              ));
            };

            return (
              <React.Fragment key={cls.id}>
                {/* Class Name Row */}
                <tr
                  className={`class-name-row ${classIndex > 0 ? "class-section" : ""}`}
                >
                  <td
                    colSpan={15}
                    className="class-header sindhi text-left pl-6"
                  >
                    {cls.name}
                  </td>
                </tr>

                {/* Boys Section */}
                {boys.length > 0 && (
                  <>
                    <tr className="gender-header no-break">
                      {/* <td
                        colSpan={15}
                        className="class-header sindhi"
                        style={{ backgroundColor: '#d1e7ff', fontSize: '13pt' }}
                      >
                        ڇوڪرا (Boys)
                      </td> */}
                    </tr>
                    {renderStudents(boys, 0)}
                  </>
                )}

                {/* Girls Section */}
                {girls.length > 0 && (
                  <>
                    <tr className="gender-header no-break">
                      <td
                        colSpan={15}
                        className="class-header sindhi"
                        style={{ backgroundColor: "#ffd1dc", fontSize: "13pt" }}
                      >
                        ڇوڪريون (Girls)
                      </td>
                    </tr>
                    {renderStudents(girls, boys.length)}
                  </>
                )}
                {/* No students message */}
                {classStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={15}
                      className="py-4 text-gray-500 italic text-center"
                    >
                      هن ڪلاس ۾ ڪوبه شاگرد موجود ناهي
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}

          {classes.length === 0 && (
            <tr>
              <td
                colSpan={15}
                className="py-8 text-center text-gray-600 text-lg"
              >
                ڪا به ڪلاس موجود ناهي
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="p-4 border-b print:hidden">
      <button
                    type="button"
                    onClick={handlePdfDownload}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
                  >
                    {
                      loadingPDF ?
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

                   {loadingPDF ? "انتظار ڪريو":" PDF ڊائونلوڊ ڪريو"}
                  </button>
      </div>
    </div>
  );
}

export default function ResultSheetUIWrapper() {
  return (
    <ProtectedRoute>
      <ResultSheetUI />
    </ProtectedRoute>
  );
}
