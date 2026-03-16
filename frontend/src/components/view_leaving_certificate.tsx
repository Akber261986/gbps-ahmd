import { useSchool } from "@/contexts/SchoolContext";

type ViewLeavingCertificateProps = {
  formData: {
    [key: string]: any;
  };
};

const ViewLeavingCertificate = ({ formData }: ViewLeavingCertificateProps) => {
  const { school } = useSchool();

  const Row = ({ no, label, value }: any) => (
    <div className="flex items-end text-[18px] leading-8">
      <span className="w-8">{no}</span>
      <span className="whitespace-nowrap ml-2">{label}</span>

      <div className="flex-1 border-b border-gray-700 mx-3 text-center text-xl">
        {value || ""}
      </div>
    </div>
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="flex justify-center mt-8" dir="rtl">
      <div
        className="
        w-[800px]
        bg-[#f5f0c9]
        border-[6px]
        border-green-700
        p-10
        shadow-xl
      "
      >
        {/* Form Number */}
        <div className="text-right text-sm mb-2">فارم نمبر 16</div>

        {/* Title */}
        <h1 className="text-center text-4xl font-bold mb-6">
          اسڪول ڇڏڻ جو سرٽيفڪيٽ
        </h1>

        {/* School */}
        <div className="flex justify-center mb-4 text-2xl space-x-4 flex-col items-center">
          <span>
            اسڪول جو نالو:
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
            label="شاگرد جو نالو"
            value={formData.student_name}
          />

          <Row
            no="3."
            label="والد جو نالو"
            value={formData.father_name}
          />

          <Row
            no="4."
            label="قوم"
            value={formData.qom}
          />

          <Row
            no="5."
            label="ذات"
            value={formData.caste}
          />

          <Row
            no="6."
            label="پيدائش جي جاءِ"
            value={formData.place_of_birth}
          />

          <Row
            no="7."
            label="ڄمڻ جي تاريخ"
            value={formatDate(formData.date_of_birth)}
          />

          <Row
            no="8."
            label="ڄمڻ جي تاريخ (لفظن ۾)"
            value={formData.date_of_birth_in_letter}
          />

          <Row
            no="9."
            label="داخلا جي تاريخ"
            value={formatDate(formData.admission_date)}
          />

          <Row
            no="10."
            label="پويون اسڪول"
            value={formData.previous_school}
          />
          <Row
            no="11."
            label="اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر"
            value={formData.gr_of_previous_school}
          />

          <Row
            no="12."
            label="اسڪول ڇڏڻ جي تاريخ"
            value={formatDate(formData.leaving_date)}
          />

          <Row
            no="13."
            label="اسڪول ڇڏڻ وقت ڪلاس"
            value={formData.class_on_leaving}
          />

          <Row
            no="14."
            label="اسڪول ڇڏڻ جو سبب"
            value={formData.reason_for_leaving}
          />

          <Row
            no="15."
            label="تعليمي قابليت"
            value={formData.educational_ability}
          />

          <Row
            no="16."
            label="چال چلت"
            value={formData.character}
          />

          <Row
            no="17."
            label="ريمارڪس"
            value={formData.remarks}
          />
        </div>

        {/* Declaration */}
        <p className="mt-8 text-sm text-center">
          سرٽيفڪيٽ ڏجي ٿو ته مهي ڄاڻايل تفصيل اسڪول جي جنرل رجسٽر مطابق صحيح آهن.
        </p>

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

export default ViewLeavingCertificate;
