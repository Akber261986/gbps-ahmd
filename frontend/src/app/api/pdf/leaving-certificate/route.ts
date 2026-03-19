import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = (process.env.PDF_SERVICE_URL || 'https://gbps-ahmd-production.up.railway.app').replace(/\/$/, '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log('=== Leaving Certificate PDF Generation Started ===');
    console.log('Student ID:', studentId);
    console.log('PDF Service URL:', PDF_SERVICE_URL);

    const authHeader = req.headers.get("authorization") || "";
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    // Fetch the certificate data and school data from backend API
    console.log('Fetching data from backend...');
    const [certResponse, schoolResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/school-leaving-certificates/${studentId}`, {
        headers: {
          Authorization: authHeader,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: {
          Authorization: authHeader,
        },
      })
    ]);

    console.log('Certificate API status:', certResponse.status);
    console.log('School API status:', schoolResponse.status);

    if (!certResponse.ok) {
      const errorText = await certResponse.text();
      console.error('Certificate API error:', errorText);
      throw new Error(`Failed to fetch certificate data: ${certResponse.status} - ${errorText}`);
    }

    const data = await certResponse.json();
    const school = schoolResponse.ok ? await schoolResponse.json() : { school_name: 'اسڪول', semis_code: '' };

    console.log('Data fetched successfully');
    console.log('Calling PDF service on Railway...');

    // Call Railway PDF service
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/pdf/leaving-certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        school
      })
    });

    console.log('PDF service response status:', pdfResponse.status);

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('PDF service error:', errorText);
      throw new Error(`PDF generation failed: ${pdfResponse.status} - ${errorText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=leaving-certificate-${data.gr_number}.pdf`,
      },
    });
  } catch (error: any) {
    console.error('=== Leaving Certificate PDF Generation Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: error.message,
        name: error.name,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
