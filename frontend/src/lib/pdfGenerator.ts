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
  const {
    filename,
    orientation = 'portrait',
    format = 'a4',
  } = options;

  try {
    // Simply trigger browser print dialog
    // This is more reliable and preserves all styling
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Please allow popups to download PDF');
    }

    // Clone the element and its styles
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Create a complete HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            @page {
              size: ${format} ${orientation};
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            ${Array.from(document.styleSheets)
              .map(sheet => {
                try {
                  return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
                } catch (e) {
                  return '';
                }
              })
              .join('\n')}
          </style>
        </head>
        <body>
          ${clonedElement.outerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    };
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};
