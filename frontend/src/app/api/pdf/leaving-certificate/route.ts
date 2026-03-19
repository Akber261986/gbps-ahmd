import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf-service";

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

    const authHeader = req.headers.get("authorization") || "";
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    // Fetch the certificate data and school data from backend API
    console.log('Fetching data from backend...');
    const [certResponse, schoolResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/school-leaving-certificates/${studentId}`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: { Authorization: authHeader },
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

    // Call PDF service using reusable function
    return await generatePDF(
      '/pdf/leaving-certificate',
      { data, school },
      `leaving-certificate-${data.gr_number}.pdf`
    );

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
