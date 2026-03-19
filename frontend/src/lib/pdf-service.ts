const PDF_SERVICE_URL = (process.env.PDF_SERVICE_URL || 'https://gbps-ahmd-production.up.railway.app').replace(/\/$/, '');

/**
 * Calls the Railway PDF service and returns the PDF as a Response
 * @param endpoint - The PDF service endpoint (e.g., '/pdf/admission-form')
 * @param data - The data to send to the PDF service
 * @param filename - The filename for the downloaded PDF
 * @returns Response with PDF binary data
 */
export async function generatePDF(
  endpoint: string,
  data: any,
  filename: string
): Promise<Response> {
  try {
    console.log(`Calling PDF service: ${PDF_SERVICE_URL}${endpoint}`);

    const pdfResponse = await fetch(`${PDF_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('PDF service response status:', pdfResponse.status);

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('PDF service error:', errorText);
      throw new Error(`PDF generation failed: ${pdfResponse.status} - ${errorText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');

    // Convert ArrayBuffer to Buffer to prevent JSON serialization
    const buffer = Buffer.from(pdfBuffer);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });

  } catch (error: any) {
    console.error('PDF generation error:', error.message);
    throw error;
  }
}
