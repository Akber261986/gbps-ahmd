"use client";

import { useSchool } from "@/contexts/SchoolContext";
import { X } from "lucide-react";

type ViewLeavingCertificateProps = {
  data: {
    [key: string]: any;
  };
  isOpen?: boolean;
  onClose?: () => void;
  onPrint?: () => void;
  loadingPdf?: boolean;
};

const ViewLeavingCertificate = ({
  data,
  isOpen = true,
  onClose,
  onPrint,
  loadingPdf = false
}: ViewLeavingCertificateProps) => {
  const { school } = useSchool();

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const Row = ({ no, label, value }: any) => (
    <div className="flex items-end mx-1 sm:mx-2 text-[10px] sm:text-xs md:text-sm min-h-[16px] sm:min-h-[20px]">
      <span className="w-5 sm:w-6 md:w-7">{no}</span>
      <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-normal">{label}</span>
      <div className="flex-1 border-b border-black mx-1 sm:mx-2 md:mx-4 pb-0.5 sm:pb-1 text-center text-xs sm:text-sm md:text-base font-bold">
        {value || ""}
      </div>
    </div>
  );

  const TwoColumnRow = ({ no1, label1, value1, no2, label2, value2 }: any) => (
    <div className="flex gap-1 sm:gap-2 md:gap-3 mx-1 sm:mx-2 min-h-[16px] sm:min-h-[20px]">
      <div className="flex items-end text-[10px] sm:text-xs md:text-sm flex-1">
        <span className="w-5 sm:w-6 md:w-7">{no1}</span>
        <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-normal">{label1}</span>
        <div className="flex-1 border-b border-black mx-1 sm:mx-2 pb-0.5 sm:pb-1 text-center text-xs sm:text-sm md:text-base font-bold">
          {value1 || ""}
        </div>
      </div>
      <div className="flex items-end text-[10px] sm:text-xs md:text-sm flex-1">
        <span className="w-5 sm:w-6 md:w-7">{no2}</span>
        <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-normal">{label2}</span>
        <div className="flex-1 border-b border-black mx-1 sm:mx-2 pb-0.5 sm:pb-1 text-center text-xs sm:text-sm md:text-base font-bold">
          {value2 || ""}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-aut">
        <div className="relative w-full min-h-full sm:min-h-0 sm:my-8 sm:h-auto sm:max-h-[90vh] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white sm:rounded-lg shadow-xl flex flex-col">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="fixed sm:absolute top-3 right-3 sm:top-4 sm:right-4 z-[60] bg-white hover:bg-gray-100 rounded-full p-2 sm:p-2.5 shadow-lg transition-colors border border-gray-200"
              aria-label="Close"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div
              className="flex justify-center items-start min-h-full p-3 sm:p-4 md:p-6"
              dir="rtl"
            >
              <div className="w-full max-w-3xl">
                <div
                  className="relative w-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-3 sm:p-4 md:p-6 lg:p-8"
                  style={{
                    backgroundImage: "url('/images/slc.png')",
                    aspectRatio: "200/265",
                  }}
                >
                  <div className="w-full max-w-xl pt-24 lg:pt-28 px-6 sm:px-0 pb-8 sm:pb-0 relative bg-amber-40 font-leeka">
                    {/* Logo */}
                    <img
                      src={school?.logo_url || "/images/logo_sindh_gov.png"}
                      alt="Logo"
                      className="absolute w-10 sm:w-16 md:w-20 lg:w-24 h-auto rounded-full top-20 sm:top-16 left-1/2 transform -translate-1/2"
                    />

                    {/* Header */}
                    <div className="mb-1 sm:mb-2 md:mb-3 relative">
                      <div className="absolute left-1/2 top-8 sm:top-0 md:top-12 -translate-x-1/2 -translate-y-1/2">
                        <svg viewBox="0 0 570 450" className="w-80 sm:w-96 md:w-xl lg:w-2xl h-auto">
                          <defs>
                            <path id="curve-slc" d="M 0,240 A 100,75 0 0,1 550,260" />
                          </defs>

                          <text className="fill-black" style={{ textAnchor: "middle"}}>
                            <textPath
                              href="#curve-slc"
                              startOffset="50%"
                              className="text-3xl lg:text-4xl font-bold"
                            >
                              {school?.school_name || ""} تعلقو {school?.taluka} ضلعو{" "}
                              {school?.district}
                            </textPath>
                          </text>
                        </svg>
                      </div>

                      {/* SEMIS Code */}
                      <div
                        className="absolute text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wider text-gray-800 left-1/2 -top-2 sm:-top-4"
                        style={{ transform: "translate(-50%, -50%)" }}
                      >
                        <span>سيمس ڪوڊ: </span>
                        <strong className="font-serif">
                          {school?.semis_code || ""}
                        </strong>
                      </div>

                      {/* Title */}
                      <h2
                        className="text-center text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 mt-6 sm:mt-8"
                        style={{fontFamily: "Leeka, sans-serif"}}
                      >
                        <strong>اسڪول ڇڏڻ جو سرٽيفڪيٽ</strong>
                      </h2>
                    </div>

                    <div className="space-y-0.5 sm:space-y-1">
                      <Row no="1." label="جنرل رجسٽر نمبر" value={data.gr_number} />

                      <TwoColumnRow
                        no1="2."
                        label1="شاگرد جو نالو"
                        value1={data.student_name}
                        no2="3."
                        label2="پيءُ جو نالو"
                        value2={data.father_name}
                      />

                      <TwoColumnRow
                        no1="4."
                        label1="قوم"
                        value1={data.qom}
                        no2="5."
                        label2="ذات"
                        value2={data.caste}
                      />

                      <Row no="6." label="پيدائش جاءِ" value={data.place_of_birth} />
                      <Row no="7." label="پيدائش تاريخ" value={formatDate(data.date_of_birth)} />
                      <Row no="8." label="پيدائش لفظن ۾" value={data.date_of_birth_in_letter} />
                      <Row no="9." label="داخلا تاريخ" value={formatDate(data.admission_date)} />
                      <Row no="10." label="پھرين ڪھڙي اسڪول ۾ پڙھندو ھو / ھئي" value={data.previos_school || data.previous_school || ''} />
                      <Row no="11." label="اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر" value={data.gr_of_previous_school || data.gr_of_previos_school || ''} />

                      <TwoColumnRow
                        no1="12."
                        label1="تعليمي لياقت"
                        value1={data.educational_ability || data.educational_qualification || ''}
                        no2="13."
                        label2="چال چلت"
                        value2={data.character || data.conduct || ''}
                      />

                      <Row no="14." label="ڪھڙي ڪلاس ۾ پڙھندو ھو / ھئي" value={data.class_on_leaving || ''} />
                      <Row no="15." label="اسڪول ڇڏڻ جي تاريخ" value={formatDate(data.leaving_date)} />
                      <Row no="16." label="اسڪول ڇڏڻ جو سبب" value={data.reason_for_leaving || data.leaving_reason || ''} />
                      <Row no="17." label="ريمارڪس" value={data.remarks || ''} />
                    </div>

                    {/* Note */}
                    <div className="text-[8px] sm:text-[10px] md:text-xs mt-3 sm:mt-4 mr-4 sm:mr-8">
                      * سرٽيفڪيٽ ٿو ڏجي تہ مٿيون تفصيل جنرل رجسٽر مطابق درست آھي.
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-evenly mt-8 sm:mt-10 md:mt-12 lg:mt-16">
                      <div className="text-center w-[30%]">
                        <div className="border-t border-black mb-0.5 sm:mb-1 md:mb-2"></div>
                        <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                          صحيح ڪلاس ٽيچر
                        </p>
                      </div>

                      <div className="text-center w-[30%]">
                        <div className="border-t border-black mb-0.5 sm:mb-1 md:mb-2"></div>
                        <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                          صحيح هيڊ ماسٽر
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {(onClose || onPrint) && (
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 px-2 sm:px-0">
                    {onClose && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base"
                      >
                        بند ڪريو
                      </button>
                    )}
                    {onPrint && (
                      <button
                        type="button"
                        onClick={onPrint}
                        disabled={loadingPdf}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {loadingPdf ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                        ) : (
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
                        )}
                        {loadingPdf ? "انتظار ڪريو" : "PDF ڊائونلوڊ ڪريو"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewLeavingCertificate;
