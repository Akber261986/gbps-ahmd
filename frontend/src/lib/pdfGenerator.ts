interface PDFOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  format?: string;
  margin?: number | [number, number] | [number, number, number, number];
}

export const generatePDF = async (
  element: HTMLElement,
  options: PDFOptions
): Promise<void> => {
  // Dynamically import html2pdf only in the browser
  const html2pdf = (await import('html2pdf.js')).default;

  const {
    filename,
    orientation = 'portrait',
    format = 'a4',
    margin = 10
  } = options;

  const opt = {
    margin: margin,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: {
      unit: 'mm' as const,
      format: format,
      orientation: orientation
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};
