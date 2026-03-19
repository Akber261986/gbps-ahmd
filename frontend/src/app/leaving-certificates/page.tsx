"use client";

import { useState, useEffect } from "react";
import { leavingCertificateApi, SchoolLeavingCertificate } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ViewLeavingCertificate from "@/components/view_leaving_certificate";
import { getToken } from "@/lib/auth";

const LeavingCertificatesPage = () => {
  const { school } = useSchool();
  const [certificates, setCertificates] = useState<SchoolLeavingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<SchoolLeavingCertificate | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await leavingCertificateApi.getAll();
        setCertificates(response.data);
      } catch (err) {
        setError("Failed to load leaving certificates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = searchTerm
      ? cert.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.gr_number.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesSearch;
  });

  const handleViewCertificate = (certificate: SchoolLeavingCertificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const handlePrintCertificate = async () => {
    if (!selectedCertificate || !selectedCertificate.student_id) return;

    try {
      setLoadingPdf(true);
      const token = getToken();

      const response = await fetch(`/api/pdf/leaving-certificate?studentId=${selectedCertificate.student_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoadingPdf(false);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leaving-certificate-${selectedCertificate.gr_number}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("PDF ڊائونلوڊ ڪرڻ ۾ مسئلو آيو");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">اسڪول ڇڏڻ جا سرٽيفڪيٽ</h1>
          <p className="text-2xl font-bold opacity-90">
            {school?.school_name || 'اسڪول'}
          </p>
          {school?.semis_code && (
            <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="نالو، والد جو نالو يا GR نمبر سان ڳولا ڪريو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
              />
            </div>

            <a
              href="/leaving-certificate"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 text-center"
            >
              نئون سرٽيفڪيٽ ٺاهيو
            </a>
          </div>

          {/* Certificates Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    GR نمبر
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    سريل نمبر
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    نالو
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    والد جو نالو
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ڪلاس
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ڇڏڻ جي تاريخ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-md font-medium text-gray-500 uppercase tracking-wider"
                  >
                    عمل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCertificates.length > 0 ? (
                  filteredCertificates.map((cert, index) => (
                    <tr
                      key={cert.id}
                      className={` ${index % 2 === 0 ? "bg-gray-300" : "bg-blue-50"} rounded-lg`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {cert.gr_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {cert.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {cert.father_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {cert.class_on_leaving}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {new Date(cert.leaving_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          سرٽيفڪيٽ ڏسو
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "ڪوبه سرٽيفڪيٽ نه لڌو"
                        : "ڪوبه سرٽيفڪيٽ نه آهي"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">ڪل سرٽيفڪيٽ</p>
              <p className="text-xl font-bold text-blue-700">
                {certificates.length}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && selectedCertificate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCertificateModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="text-xl font-semibold text-gray-800">
                  اسڪول ڇڏڻ جو سرٽيفڪيٽ - {selectedCertificate.student_name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="بند ڪريو"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <ViewLeavingCertificate formData={selectedCertificate} />

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    بند ڪريو
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
                  >
                    {loadingPdf ? (
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function LeavingCertificatesPageWrapper() {
  return (
    <ProtectedRoute>
      <LeavingCertificatesPage />
    </ProtectedRoute>
  );
}
