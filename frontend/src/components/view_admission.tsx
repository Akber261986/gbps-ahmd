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
      <div className="flex items-end text-[18px] leading-8">
        <span className="w-8">{no}</span>
        <span className="whitespace-nowrap ml-2">{label}</span>

        <div className="flex-1 border-b border-gray-700 mx-3 text-center text-xl">
          {value || ""}
        </div>
      </div>
  );

  const TwoColumnRow = ({ no1, label1, value1, no2, label2, value2 }: any) => (
    <div className="flex gap-4">
      <div className="flex items-end text-[18px] leading-8 flex-1">
        <span className="w-8">{no1}</span>
        <span className="whitespace-nowrap ml-2">{label1}</span>
        <div className="flex-1 border-b border-gray-700 mx-3 text-center text-xl">
          {value1 || ""}
        </div>
      </div>
      <div className="flex items-end text-[18px] leading-8 flex-1">
        <span className="w-8">{no2}</span>
        <span className="whitespace-nowrap ml-2">{label2}</span>
        <div className="flex-1 border-b border-gray-700 mx-3 text-center text-xl">
          {value2 || ""}
        </div>
      </div>
    </div>
  );


  const age = student_age(formData.date_of_birth, formData.admission_date);
  return (
    <div className="flex justify-center mt-8 px-4" dir="rtl">
    <div
      className="
      w-full
      max-w-[800px]
      bg-[#f5f0c9]
      border-[6px]
      border-green-700
      p-6
      md:p-10
      shadow-xl
    "
    >
      {/* Title */}
      <h1 className="text-center text-4xl font-bold mb-6">
        داخلہ فارم
      </h1>

      {/* School */}
      <div className="flex justify-center mb-4 text-2xl space-x-4 flex-col items-center">

        <span>
          <b className="mr-2">
            {school?.school_name || "—"}
          </b>
        </span>
        <span>
          سيمس ڪوڊ:
          <b className="mr-2">
            {school?.semis_code || "—"}
          </b>
        </span>

      </div>

      <div className="space-y-2">

        <Row no="1." label="جنرل رجسٽر نمبر" value={formData.gr_number} />

        <Row
          no="2."
          label="داخلہ جي تاريخ"
          value={new Date(formData.admission_date).toLocaleDateString("en-GB")}
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
          value2={formData.guardian_relation}
          />

        <Row
          no="9."
          label="سرپرست جو ڌنڌو"
          value={formData.guardian_occupation  }
        />

        <Row
          no="11."
          label="پيدائش جي جاءِ"
          value={formData.place_of_birth}
        />

        <Row
          no="10."
          label="پيدائش جي تاريخ"
          value={new Date(formData.date_of_birth).toLocaleDateString("en-GB") }
        />

        <Row
          no="12."
          label="پيدائش جي تاريخ لفظن ۾"
          value={formData.date_of_birth_in_letter}
        />

        <Row
          no="13."
          label="ڪھڙي اسڪول مان آيو"
          value={formData.previous_school}
        />

        <Row
          no="14."
          label=" ڪهڙي ڪلاس ۾ داخل ٿيو / ٿي"
          value={className}
        />

        <Row
          no="15."
          label="سرپرست جي صحيح"
          value="" // No value, just a line for signature
        />

        <Row
          no="16."
          label="داخلہ وقت عمر"
          value={age ? `${age.y} سال، ${age.m} مهينا، ${age.d} ڏينهن` : "—"}
        />
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-20 text-lg">
        <div className="text-center w-1/2">
          <div className="border-t border-black mb-2 w-2/3 mx-auto"></div>
          صحيح هيڊ ماسٽر / هيڊ مسٽريس
        </div>

        <div className="text-center w-1/2">
          <div className="border-t border-black mb-2 w-2/3 mx-auto"></div>
          صحيح ڪلاس ماسٽر / ماسترياڻي
        </div>
      </div>
    </div>
  </div>
  );
};

export default ViewAdmission;