// lib/pdfConverter.ts
'use client';

interface PdfOptions {
  filename?: string;
  margin?: number | [number, number, number, number]; // top, right, bottom, left (in mm)
  image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
  html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean };
  jsPDF?: {
    unit?: 'pt' | 'mm' | 'in' | 'px';
    format?: string | [number, number];
    orientation?: 'portrait' | 'landscape';
  };
  pagebreak?: { mode?: string[]; avoid?: string[] };
}

/**
 * Converts an HTML element (via ref) to a downloadable PDF
 *
 * @param elementRef - React ref to the DOM element you want to convert
 * @param fileName - Name of the downloaded PDF file (without .pdf)
 * @param options - Optional customization
 * @returns Promise that resolves when PDF is generated & download starts
 */
export async function generatePdfFromElement(
  elementRef: React.RefObject<HTMLElement | null>,
  fileName: string = 'document',
  options: PdfOptions = {}
): Promise<void> {
  if (!elementRef?.current) {
    console.error('No element found to convert to PDF');
    return;
  }

  // Dynamically import html2pdf only on client side
  const html2pdf = (await import('html2pdf.js')).default;

  const defaultOptions: PdfOptions = {
    margin: 10,                     // mm
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,                     // higher = better quality (but bigger file & slower)
      useCORS: true,                // important if you have external images
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    // Optional: add class to hide unwanted elements during capture
    document.body.classList.add('pdf-exporting');

    await html2pdf()
      .set(finalOptions)
      .from(elementRef.current)
      .save();

    console.log('PDF generated and download started');
  } catch (err) {
    console.error('PDF generation failed:', err);
  } finally {
    document.body.classList.remove('pdf-exporting');
  }
}