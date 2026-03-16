"use client";

import React, { useEffect, useState } from "react";
import { Class, Student, classApi, studentApi } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";

export default function ResultSheetUI() {
  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stdRes, clsRes] = await Promise.all([
          studentApi.getAll(),
          classApi.getAll(),
        ]);

        setStudents(stdRes.data || []);
        setClasses(clsRes.data || []);
      } catch (err) {
        setError("ڊيٽا لوڊ نه ٿي سگهي");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-xl">لوڊ ٿي رهيو آهي…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 text-xl">{error}</div>
    );
  }

  return (
    <div className="w-full bg-white text-black print-area px-4 py-6">
      {/* PRINT + TABLE RULES */}
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
          padding: 2mm;
        }

        .sindhi {
          direction: rtl;
          text-align: center;
        }

        .header-wrapper {
          padding-bottom: 4mm;
        }

        .class-header {
          background-color: #e5e5e5;
          font-weight: bold;
          font-size: 15pt;
          padding: 4mm;
          text-align: right;
        }

        .no-break {
          page-break-inside: avoid;
        }

        .row-height {
          // height: 24mm;
        }
      `}</style>

      {/* MAIN TABLE (ONLY ONE TABLE — IMPORTANT) */}
      <table>
        {/* COLUMN WIDTHS */}
        <colgroup>
          <col style={{ width: "20mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "42mm" }} />
          <col style={{ width: "42mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "20mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "18mm" }} />
          <col style={{ width: "22mm" }} />
          <col style={{ width: "24mm" }} />
          <col style={{ width: "24mm" }} />
          <col style={{ width: "22mm" }} />
        </colgroup>

        {/* ===== REPEATING HEADER ===== */}
        <thead>
          {/* SCHOOL HEADER */}
          <tr>
            <th colSpan={15}>
              <div className="sindhi py-3">
                <h1 className="text-center font-bold text-5xl mb-3">
                  جديد رزلٽ شيٽ ـ سال
                  <span className="underline">____________</span>
                </h1>

                <div className="flex justify-between items-center text-2xl px-6 flex-wrap gap-4">
                  <p>نقشوامتحان جي مارڪن جو</p>

                  <p className="font-extrabold underline italic">
                    {school?.school_name || 'اسڪول'}
                  </p>

                  <p>
                    جي درجي <span className="underline">____________</span>
                  </p>

                  <p className="whitespace-nowrap">
                    جو ساليانو امتحان تاريخ
                    <span className="underline">_____</span> مھينو
                    <span className="underline">___________</span>
                    سال <span className="underline">__________</span> تي ٿيو
                  </p>
                </div>
              </div>
            </th>
          </tr>

          {/* SUBJECT HEADER */}
          <tr className="row-height">
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
            <th>100</th>
            <th>100</th>
            <th>100</th>
            <th>100</th>
            <th>100</th>
            <th>100</th>
            <th>100</th>
            <th>100</th>
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.current_class_id === cls.id);

            return (
              <React.Fragment key={cls.id}>
                {/* CLASS ROW */}
                <tr className="no-break">
                  <td colSpan={15} className="class-header sindhi">
                    {cls.name}
                  </td>
                </tr>

                {/* STUDENTS */}
                {classStudents.map((std, index) => (
                  <tr key={std.id} className="no-break row-height">
                    <td>{std.gr_number || ""}</td>
                    <td>{index + 1}</td>
                    <td className="sindhi">{std.name || ""}</td>
                    <td className="sindhi">{std.father_name || ""}</td>

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
                        ? new Date(std.date_of_birth).toLocaleDateString(
                            "ur-PK",
                          )
                        : ""}
                    </td>
                    <td>
                      {std.admission_date
                        ? new Date(std.admission_date).toLocaleDateString(
                            "ur-PK",
                          )
                        : ""}
                    </td>
                    <td></td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
