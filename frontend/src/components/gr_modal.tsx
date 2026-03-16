"use client";

import React from "react";
import { Student, Class } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";

interface GRRegisterPageProps {
  students: Student[];
  classes: Class[];
}

const GRRegisterPage: React.FC<GRRegisterPageProps> = ({
  students,
  classes,
}) => {
  const { school } = useSchool();

  const getClassName = (classId: number) => {
    return classes.find(c => c.id === classId)?.name || "";
  };

  return (
    <div className="print-area bg-white border border-black shadow-lg">
      <div className="text-center border-b border-black p-3">
        <h1 className="text-xl font-bold">{school?.school_name || 'اسڪول'}</h1>
        {school?.semis_code && (
          <p className="text-sm">SEMIS Code: {school.semis_code}</p>
        )}
        <h2 className="mt-2 text-lg font-semibold underline">
          جنرل رجسٽر
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <colgroup>
            <col style={{ width: "100px" }} /> // GR Number
            <col style={{ width: "200px" }} /> // Student Name
            <col style={{ width: "200px" }} /> // Father's Name
            <col style={{ width: "250px" }} /> // Place of Birth
            <col style={{ width: "250px" }} /> // Date of Birth (Digits)
            <col style={{ width: "150px" }} /> // Date of Birth (Words)
            <col style={{ width: "100px" }} /> // Religion
            <col style={{ width: "100px" }} /> // Caste
            <col style={{ width: "150px" }} /> // Previous School
            <col style={{ width: "120px" }} /> // Class Admitted To
            <col style={{ width: "250px" }} /> // Admission Date
            <col style={{ width: "200px" }} /> // GR Number of Previous School (if certificate brought)
            <col style={{ width: "250px" }} /> // Leaving Date
            <col style={{ width: "200px" }} /> // Class at Leaving
            <col style={{ width: "200px" }} /> // Reason for Leaving
            <col style={{ width: "100px" }} /> // Educational Ability
            <col style={{ width: "100px" }} /> // Character
            <col style={{ width: "100px" }} /> // Remarks
          </colgroup>

          <thead>
            <tr className="bg-gray-200">
              {[
                "جنرل رجسٽر نمبر",
                "شاگرد جو نالو",
                "پيءُ جو نالو",
                "پيدائش جي جاءِ",
                "پيدائش جي تاريخ (انگن ۾)",
                "پيدائش جي تاريخ (لفظن ۾)",
                "مذهب",
                "ذات",
                "ڪھڙي اسڪول مان آيو",
                "ڪھڙي درجي ۾ داخل ٿيو",
                "داخلا جي تاريخ",
                "اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر",
                "اسڪول ڇڏڻ جي تاريخ",
                "اسڪول ڇڏڻ وقت ڪھڙي درجي ۾ پڙھندو ھو",
                "اسڪول ڇڏڻ جو سبب",
                "تعليمي لياقت",
                "چال چلت",
                "ريمارڪس",
              ].map((head, i) => (
                <th
                  key={i}
                  className="border border-black px-2 py-1 text-center font-bold text-xl "
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300 text-center text-semibold text-lg">
            {students.map(student => (
              <tr key={student.id} className="h-12">
                <td className="border px-2 text-center">{student.gr_number}</td>
                <td className="border px-2">{student.name}</td>
                <td className="border px-2">{student.father_name}</td>
                <td className="border px-2">{student.place_of_birth}</td>
                <td className="border px-2 text-center w-24">
                  {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("en-GB") : ""}
                </td>
                <td className="border px-2">
                  {student.date_of_birth_in_letter}
                </td>
                <td className="border px-2">{student.qom == "مسلمان" ? "اسلام" : student.qom }</td>
                <td className="border px-2">{student.caste}</td>
                <td className="border px-2">{student.previous_school}</td>
                <td className="border px-2 text-center">
                  {getClassName(student.admit_in_class ? parseInt(student.admit_in_class) : student.class_id)}
                </td>
                <td className="border px-2 w-24">
                  {(student.admission_date) ? new Date(student.admission_date).toLocaleDateString("en-GB") : ""}
                </td>

                {/* Leaving-related fields (empty if active) */}
                <td className="border px-2 text-sm font-normal w-32"
                >
                  {student.gr_of_previos_school}
                </td>
                <td className="border px-2 w-24"
                >
                  {student.leaving_date ? new Date(student.leaving_date).toLocaleDateString("en-GB") : ""}
                </td>
                <td className="border px-2"
                >
                 {student.class_on_leaving} 
                </td>
                <td className="border px-2"
                >
                  {student.leaving_reason }
                </td>
                <td className="border px-2"
                >
                  {student.educational_ability}
                </td>
                <td className="border px-2"
                >
                  {student.character}
                </td>
                <td className="border px-2"
                >
                  {student.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GRRegisterPage;
