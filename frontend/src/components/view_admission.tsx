"use client";

import { useSchool } from "@/contexts/SchoolContext";
import student_age from "@/lib/student_age";

type ClassType = {
  id: number | string;
  name: string;
};

type ViewAdmissionProps = {
  formData: {
    [key: string]: any;
    class_id?: number | string;
  };
  classes: ClassType[];
};

const ViewAdmission = ({ formData, classes }: ViewAdmissionProps) => {
  const { school } = useSchool();

  const className =
    classes.find((c: ClassType) => c.id === formData.class_id)?.name || "-";

  const Row = ({ no, label, value }: any) => (
    <div className="flex items-end mx-2 text-xs sm:text-sm min-h-[18px]">
      <span className="w-6 sm:w-8">{no}</span>
      <span className="whitespace-nowrap text-xs sm:text-sm">{label}</span>
      <div className="flex-1 border-b border-black mx-2 sm:mx-4 pb-1 text-center text-sm sm:text-base font-bold">
        {value || ""}
      </div>
    </div>
  );

  const TwoColumnRow = ({ no1, label1, value1, no2, label2, value2 }: any) => (
    <div className="flex gap-2 sm:gap-4 mx-2 min-h-[18px]">
      <div className="flex items-end text-xs sm:text-sm flex-1">
        <span className="w-6 sm:w-8">{no1}</span>
        <span className="whitespace-nowrap text-xs sm:text-sm">{label1}</span>
        <div className="flex-1 border-b border-black mx-2 sm:mx-4 pb-1 text-center text-sm sm:text-base font-bold">
          {value1 || ""}
        </div>
      </div>
      <div className="flex items-end text-xs sm:text-sm flex-1">
        <span className="w-6 sm:w-8">{no2}</span>
        <span className="whitespace-nowrap text-xs sm:text-sm">{label2}</span>
        <div className="flex-1 border-b border-black mx-2 sm:mx-4 pb-1 text-center text-sm sm:text-base font-bold">
          {value2 || ""}
        </div>
      </div>
    </div>
  );

  const age = student_age(formData.date_of_birth, formData.admission_date);

  return (
    <div className="flex justify-center items-center min-h-screen p-4" dir="rtl">
      <div className="w-full max-w-4xl p-10">
        <div
          className="relative w-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4 sm:p-8"
          style={{
            backgroundImage: "url('/images/admission_form_frame.png')",
            aspectRatio: "180/240",
          }}
        >
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">
                {school?.school_name || ""}
              </h1>
              <div className="flex justify-center gap-2 sm:gap-4 text-base sm:text-lg md:text-xl mb-2 sm:mb-4">
                <span>سيمس ڪوڊ: </span>
                <strong>{school?.semis_code || ""}</strong>
              </div>
              <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold mb-2">
                داخلا فارم
              </h2>
            </div>

            <div className="space-y-1">
              <Row no="1." label="جنرل رجسٽر نمبر" value={formData.gr_number} />

              <Row
                no="2."
                label="داخلہ جي تاريخ"
                value={formData.admission_date ? new Date(formData.admission_date).toLocaleDateString("en-GB") : ""}
              />

              <Row
                no="3."
                label="شاگرد جو نالو"
                value={formData.name}
              />

              <Row
                no="4."
                label="والد جو نالو"
                value={formData.father_name}
              />

              <TwoColumnRow
                no1="5."
                label1="قوم"
                value1={formData.qom}
                no2="6."
                label2="ذات"
                value2={formData.caste}
              />

              <TwoColumnRow
                no1="7."
                label1=" سرپرست جو نالو"
                value1={formData.guardian_name}
                no2="8."
                label2=" بمعہ مائيٽي"
                value2={formData.relation_with_guardian}
              />

              <Row
                no="9."
                label="سرپرست جو ڌنڌو"
                value={formData.guardian_occupation}
              />

              <TwoColumnRow
                no1="10."
                label1="پيدائش جي جاءِ"
                value1={formData.place_of_birth}
                no2="11."
                label2="تعلقو"
                value2={school?.taluka || ""}
              />

              <Row
                no="13."
                label="پيدائش جي تاريخ"
                value={formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString("en-GB") : ""}
              />

              <Row
                no="14."
                label="پيدائش جي تاريخ لفظن ۾"
                value={formData.date_of_birth_in_letter}
              />

              <Row
                no="15."
                label="ڪھڙي اسڪول مان آيو"
                value={formData.previous_school}
              />

              <Row
                no="16."
                label=" ڪهڙي ڪلاس ۾ داخل ٿيو / ٿي"
                value={className}
              />

              <Row
                no="17."
                label="سرپرست جي صحيح"
                value=""
              />

              <Row
                no="18."
                label="داخلہ وقت عمر"
                value={age ? `${age.y} سال، ${age.m} مهينا، ${age.d} ڏينهن` : "—"}
              />
            </div>

            {/* Signatures */}
            <div className="flex justify-evenly mt-12 sm:mt-16 md:mt-24">
              <div className="text-center w-[30%]">
                <div className="border-t border-black mb-1 sm:mb-2"></div>
                <p className="text-xs sm:text-sm">صحيح ڪلاس ماسٽر / ماسترياڻي</p>
              </div>

              <div className="text-center w-[30%]">
                <div className="border-t border-black mb-1 sm:mb-2"></div>
                <p className="text-xs sm:text-sm">صحيح هيڊ ماسٽر / هيڊ مسٽريس</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAdmission;