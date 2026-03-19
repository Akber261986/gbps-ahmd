'use client';

import { useState, useEffect } from 'react';
import { studentApi, classApi } from '@/lib/api';
import { Student, Class } from '@/lib/api';
import GRRegisterPage from '@/components/gr_modal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAuthHeader } from '@/lib/auth';

const GRComponent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const classesResponse = await classApi.getAll();
        setClasses(classesResponse.data);

        // Fetch all students
        const studentsResponse = await studentApi.getAll();
        setStudents(studentsResponse.data);
      } catch (err) {
        setError('Failed to load GR data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


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

  const handlePdfDownload = async () => {
    try {
      // Call the specific GR register PDF API route
      const response = await fetch("/api/pdf/gr", {
        method: "GET",
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText} ${errText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "gr-register.pdf";
      document.body.appendChild(a);
      a.click();
      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("PDF download failed.");
      console.error(err);
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
      <div className="print-area">
        <div className="p-4 border-b print:hidden">
          <button
            onClick={handlePdfDownload}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Download PDF
          </button>
        </div>
        <GRRegisterPage students={students} classes={classes} />
      </div>
    </>
  );
};

export default function GRComponentWrapper() {
  return (
    <ProtectedRoute>
      <GRComponent />
    </ProtectedRoute>
  );
}
