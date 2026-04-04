"use client";

import { forwardRef } from "react";
import { SchoolLeavingCertificate } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";

interface Props {
  data: SchoolLeavingCertificate;
}

const CertificateDocument = forwardRef<HTMLElement, Props>(({ data }, ref) => {
  const { school } = useSchool();

  return (
    <section
      ref={ref}
      id="certificate-print"
      className="w-[210mm] min-h-[297mm] bg-white text-black p-10"
    >
      {/* PRINT CSS */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 12mm;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          #certificate-print,
          #certificate-print * {
            visibility: visible;
          }

          #certificate-print {
            position: absolute;
            inset: 0;
          }
        }
      `}</style>

      {/* BORDER */}
      <div className="border-[6px] border-double border-black p-8 min-h-full">
        {/* HEADER */}
        <header className="text-center mb-8">
          <p className="text-sm text-right">فارم نمبر 16</p>
          <h1 className="text-3xl font-bold mt-2"> ڇڏڻ جو سرٽيفڪيٽ</h1>
          <p className="mt-2 font-semibold">
            {school?.school_name || 'اسڪول'}
          </p>
        </header>

        {/* FIELDS */}
        <div className="space-y-4 text-[15px]">
          <Field label="1. جنرل رجسٽر نمبر" value={data.gr_number} />
          <Field label="2. شاگرد جو نالو" value={data.student_name} />
          <Field label="3. والد جو نالو" value={data.father_name} />
          <Field label="4. قوم" value={data.qom} />
          <Field label="5. ذات" value={data.caste}/>
          <Field label="6. پيدائش جي جاءِ" value={data.place_of_birth} />
          <Field label="7. ڄمڻ جي تاريخ" value={data.date_of_birth} />
          <Field label="8. ڄمڻ جي تاريخ (لفظن ۾)" value={data.date_of_birth_in_letter} />
          <Field
            label="9. داخلا جي تاريخ"
            value={formatDate(data.admission_date)}
          />
          <Field label="10. پويون اسڪول" value={data.previous_school || ""} />
          <Field label="11. اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر" value={data.gr_of_previos_school || ""} />
          <Field
            label="12. اسڪول ڇڏڻ جي تاريخ"
            value={formatDate(data.leaving_date)}
          />
          <Field label="13. اسڪول ڇڏڻ وقت ڪلاس" value={data.class_on_leaving || ''} />
          <Field label="14. اسڪول ڇڏڻ جو سبب" value={data.reason_for_leaving || ''} />
          <Field label="15. تعليمي قابليت" value={data.educational_ability || ''} />
          <Field label="16. چال چلت" value={data.character || ''} />
          <Field label="17. ريمارڪس" value={data.remarks || ""} />
        </div>

        {/* DECLARATION */}
        <p className="mt-8 text-sm">
          سرٽيفڪيٽ ڏجي ٿو ته مٿي ڄاڻايل تفصيل اسڪول جي جنرل رجسٽر مطابق صحيح
          آهن.
        </p>

        {/* SIGNATURES */}
        <div className="mt-16 flex justify-between text-sm">
          <div className="text-center">
            <div className="border-t w-48 mx-auto"></div>
            <p className="mt-2">صحيح ڪلاس ماستر</p>
          </div>
          <div className="text-center">
            <div className="border-t w-48 mx-auto"></div>
            <p className="mt-2">صحيح هيڊ ماستر</p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CertificateDocument;

/* ---------- Helpers ---------- */

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-1/3">{label}</span>
      <span className="flex-1 border-b border-black">{value || ""}</span>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ur-PK");
}
