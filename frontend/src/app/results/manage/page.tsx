"use client";

import { useState, useEffect } from "react";
import { resultSheetApi, ResultSheet, studentApi, classApi } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAuthHeader } from "@/lib/auth";

const ResultSheetManagePage = () => {
  const { school } = useSchool();
  const [resultSheets, setResultSheets] = useState<ResultSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadingSummary, setDownloadingSummary] = useState(false);

  useEffect(() => {
    fetchResultSheets();
  }, []);

  const fetchResultSheets = async () => {
    try {
      setLoading(true);
      const response = await resultSheetApi.getAll();
      setResultSheets(response.data);
    } catch (err) {
      setError("Failed to load result sheets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear) return;

    try {
      setCreating(true);
      await resultSheetApi.create({
        academic_year: newYear,
        title: newTitle || undefined,
      });
      setShowCreateForm(false);
      setNewYear("");
      setNewTitle("");
      fetchResultSheets();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create result sheet");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this result sheet?")) return;

    try {
      await resultSheetApi.delete(id);
      fetchResultSheets();
    } catch (err) {
      alert("Failed to delete result sheet");
      console.error(err);
    }
  };

  const handleDownloadPDF = async (resultSheet: ResultSheet) => {
    try {
      setDownloadingId(resultSheet.id);

      // Fetch the snapshot data for this result sheet
      const snapshotResponse = await resultSheetApi.getSnapshot(resultSheet.id);
      const { students, classes, academic_year } = snapshotResponse.data;

      // Generate PDF using the snapshot data
      const response = await fetch("/api/pdf/resultsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          students: students,
          classes: classes,
          school: school,
          academicYear: academic_year,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resultsheet-${resultSheet.academic_year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF");
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadSummaryPDF = async (resultSheet: ResultSheet) => {
    try {
      setDownloadingSummary(true);

      // Fetch statistics for this result sheet
      const statsResponse = await resultSheetApi.getStatistics(resultSheet.id);
      const { statistics, academic_year } = statsResponse.data;

      // Fetch classes
      const classesResponse = await classApi.getAll();
      const classes = classesResponse.data;

      // Generate summary PDF
      const response = await fetch("/api/pdf/summary-resultsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          classes: classes,
          school: school,
          academicYear: academic_year,
          statistics: statistics,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-resultsheet-${resultSheet.academic_year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download summary PDF");
      console.error(err);
    } finally {
      setDownloadingSummary(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            رزلٽ شيٽ مئنيجمينٽ
          </h1>
          <p className="text-2xl font-bold opacity-90">
            {school?.school_name || "اسڪول"}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-green-100">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Create Button */}
          <div className="mb-6 flex gap-4 items-center">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              نئون رزلٽ شيٽ ٺاهيو
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreate}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                نئون رزلٽ شيٽ ٺاهيو
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    تعليمي سال (مثال: 2025-2026)
                  </label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2025-2026"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    عنوان (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: ساليانو امتحان"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                  {creating ? "محفوظ ڪري رهيو آهي..." : "محفوظ ڪريو"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-all"
                >
                  منسوخ ڪريو
                </button>
              </div>
            </form>
          )}

          {/* Result Sheets List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              موجود رزلٽ شيٽس
            </h3>

            {resultSheets.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                <p>ڪو به رزلٽ شيٽ موجود ناهي</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resultSheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200"
                  >
                    <div className="mb-4 flex items-center justify-around">
                      <h4 className="text-xl font-bold text-gray-900 ">
                        {sheet.academic_year}
                      </h4>
                      {sheet.title && (
                        <p className="text-sm text-gray-600">{sheet.title}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        ٺاهي وئي : {new Date(sheet.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <button
                        onClick={() => handleDownloadPDF(sheet)}
                        disabled={downloadingId === sheet.id}
                        className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {downloadingId === sheet.id ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
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
                            <span>ڊائونلوڊ ٿي رهيو...</span>
                          </>
                        ) : (
                          <>
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            <span>تفصيلي رزلٽ شيٽ</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadSummaryPDF(sheet)}
                        disabled={downloadingSummary}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {downloadingSummary ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
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
                            <span>ڊائونلوڊ ٿي رهيو...</span>
                          </>
                        ) : (
                          <>
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span>اختصار رزلٽ شيٽ</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(sheet.id)}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>ڊليٽ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResultSheetManagePageWrapper() {
  return (
    <ProtectedRoute>
      <ResultSheetManagePage />
    </ProtectedRoute>
  );
}
