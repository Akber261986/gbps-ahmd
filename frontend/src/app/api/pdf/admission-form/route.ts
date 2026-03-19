import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://gbps-ahmd-production.up.railway.app';

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
    console.log('=== Admission Form PDF Generation Started ===');
    console.log('Student ID:', studentId);
    console.log('PDF Service URL:', PDF_SERVICE_URL);

    // Fetch admission data from backend
    const authHeader = req.headers.get("authorization") || "";
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    console.log('Fetching data from backend...');
    const [studentRes, schoolRes, classesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        headers: {
          Authorization: authHeader,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: {
          Authorization: authHeader,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: {
          Authorization: authHeader,
        },
      }),
    ]);

    console.log('Student API status:', studentRes.status);
    console.log('School API status:', schoolRes.status);
    console.log('Classes API status:', classesRes.status);

    if (!studentRes.ok) {
      const errorText = await studentRes.text();
      console.error('Student API error:', errorText);
      throw new Error(`Failed to fetch student data: ${studentRes.status} - ${errorText}`);
    }

    const student = await studentRes.json();
    const school = schoolRes.ok ? await schoolRes.json() : { school_name: "اسڪول", semis_code: "" };
    const classes = classesRes.ok ? await classesRes.json() : [];

    console.log('Data fetched successfully');
    console.log('Calling PDF service on Railway...');

    // Call Railway PDF service
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/pdf/admission-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student,
        school,
        classes
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
        "Content-Disposition": "attachment; filename=admission-form.pdf",
      },
    });

  } catch (error: any) {
    console.error('=== Admission Form PDF Generation Error ===');
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
