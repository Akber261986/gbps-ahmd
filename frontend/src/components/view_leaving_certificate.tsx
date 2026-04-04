import { useSchool } from "@/contexts/SchoolContext";

type ViewLeavingCertificateProps = {
  data: {
    [key: string]: any;
  };
};

const ViewLeavingCertificate = ({ data }: ViewLeavingCertificateProps) => {
  const { school } = useSchool();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const Field = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-center gap-2 mx-2 min-h-[25px]">
      <div className="inline-flex items-baseline gap-1 whitespace-nowrap">
        <span className="inline-block w-7 font-['Times_New_Roman']">{label.split('.')[0]}.</span>
        <span className="inline-block text-[17px]">{label.split('.')[1]}</span>
      </div>
      <div className="flex-1 border-b border-black text-center text-lg leading-none mb-0.5">
        <span className="font-['Times_New_Roman']">{value || ""}</span>
      </div>
    </div>
  );

  const PairRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-between gap-3 mx-2">
      {children}
    </div>
  );

  const FieldRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-center gap-1.5 min-h-[30px] flex-1">
      <div className="inline-flex items-baseline gap-1 whitespace-nowrap">
        <span className="inline-block w-7 font-['Times_New_Roman']">{label.split('.')[0]}.</span>
        <span className="inline-block text-[17px]">{label.split('.')[1]}</span>
      </div>
      <div className="flex-1 border-b border-black text-center text-lg leading-none mb-0.5">
        <span className="font-['Times_New_Roman']">{value || ""}</span>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center mt-8" dir="rtl">
      {/* POST BODY WITH BACKGROUND */}
      <div
        className="relative w-[200mm] h-[260mm] flex items-center justify-center bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/slc.png')`,
          padding: '0 10mm'
        }}
      >
        {/* PAPER CONTENT */}
        <div className="w-[140mm]">
          {/* HEADER SECTION */}
          <div className="flex flex-col items-center justify-around mb-4">
            <div className="text-center text-2xl font-bold">
              {school?.school_name || ''}
            </div>
            <div className="flex items-center justify-between w-[350px] text-base">
              <span>تعلقو</span>
              <span>{school?.taluka || ''}</span>
              <span>ضلعو</span>
              <span>{school?.district || ''}</span>
              <span>سيمس ڪوڊ: {school?.semis_code || ''}</span>
            </div>
            <div className="text-center text-2xl font-bold my-2">
              <b>اسڪول ڇڏڻ جو سرٽيفڪيٽ</b>
            </div>
          </div>

          {/* FIELDS */}
          <div className="space-y-2 text-[18px]">
            <Field label="1. جنرل رجسٽر نمبر" value={data.gr_number} />

            <PairRow>
              <FieldRow label="2. شاگرد جو نالو" value={data.student_name} />
              <FieldRow label="3. پيءُ جو نالو" value={data.father_name} />
            </PairRow>

            <PairRow>
              <FieldRow label="4. قوم" value={data.qom} />
              <FieldRow label="5. ذات" value={data.caste} />
            </PairRow>

            <Field label="6. پيدائش جاءِ" value={data.place_of_birth} />
            <Field label="7. پيدائش تاريخ" value={formatDate(data.date_of_birth)} />
            <Field label="8. پيدائش لفظن ۾" value={data.date_of_birth_in_letter} />
            <Field label="9. داخلا تاريخ" value={formatDate(data.admission_date)} />
            <Field label="10. پھرين ڪھڙي اسڪول ۾ پڙھندو ھو / ھئي" value={data.previos_school || data.previous_school || ''} />
            <Field label="11. اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر" value={data.gr_of_previous_school || data.gr_of_previos_school || ''} />

            <PairRow>
              <FieldRow label="12. تعليمي لياقت" value={data.educational_ability || data.educational_qualification || ''} />
              <FieldRow label="13. چال چلت" value={data.character || data.conduct || ''} />
            </PairRow>

            <Field label="14. ڪھڙي ڪلاس ۾ پڙھندو ھو / ھئي" value={data.class_on_leaving || ''} />
            <Field label="15. اسڪول ڇڏڻ جي تاريخ" value={formatDate(data.leaving_date)} />
            <Field label="16. اسڪول ڇڏڻ جو سبب" value={data.reason_for_leaving || data.leaving_reason || ''} />
            <Field label="17. ريمارڪس" value={data.remarks || ''} />
          </div>

          {/* DECLARATION */}
          <div className="text-xs mt-5 mr-10">
            * سرٽيفڪيٽ ٿو ڏجي تہ مٿيون تفصيل جنرل رجسٽر مطابق درست آھي.
          </div>

          {/* SIGNATURES */}
          <div className="mt-16 flex justify-evenly text-lg">
            <div className="text-center w-2/5">
              <div className="border-t border-black mb-1"></div>
              <p>صحيح ڪلاس ٹيچر</p>
            </div>
            <div className="text-center w-2/5">
              <div className="border-t border-black mb-1"></div>
              <p>صحيح هيڊ ماسٽر</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeavingCertificate;
