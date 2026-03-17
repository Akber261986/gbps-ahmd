'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CertificateDocument from '@/components/CertificateDocument';
import { leavingCertificateApi, SchoolLeavingCertificate } from '@/lib/api';
import { generatePDF } from '@/lib/pdfGenerator';

function LeavingCertificateContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const certRef = useRef<HTMLElement>(null);

  const [data, setData] = useState<SchoolLeavingCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setError('Student ID missing');
      setLoading(false);
      return;
    }

    leavingCertificateApi
      .getByStudentId(Number(studentId))
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load certificate'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <p className="p-10">Loading…</p>;
  if (error || !data) return <p className="p-10 text-red-600">{error}</p>;

  const handlePdfDownload = async () => {
    if (!certRef.current) {
      alert("Certificate not found");
      return;
    }

    try {
      setLoadingPdf(true);

      await generatePDF(certRef.current, {
        filename: `leaving-certificate-${data?.gr_number || 'certificate'}.pdf`,
        orientation: 'portrait',
        format: 'a4',
        margin: [10, 10, 10, 10]
      });

      setLoadingPdf(false);
    } catch (err) {
      alert("PDF download failed.");
      console.error(err);
      setLoadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ACTION BAR */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-end gap-3 print:hidden">
        <button
          onClick={handlePdfDownload}
          disabled={loadingPdf}
          className="px-6 py-2 bg-black text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingPdf ? "تيار ڪري رهيو آهي..." : "ڊائون لوڊ PDF"}
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          پرنٽ ڪريو
        </button>
      </div>

      {/* DOCUMENT */}
      <div className="flex justify-center">
        <CertificateDocument ref={certRef} data={data} />
      </div>
    </div>
  );
}

export default function LeavingCertificatePage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <LeavingCertificateContent />
    </Suspense>
  );
}
