import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = (process.env.PDF_SERVICE_URL || 'https://gbps-ahmd-production.up.railway.app').replace(/\/$/, '');

export async function GET(req: NextRequest) {
  try {
    console.log('=== GR PDF Generation Started ===');
    console.log('PDF Service URL:', PDF_SERVICE_URL);

    // Check if studentId is provided in query params
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    console.log('Student ID:', studentId || 'All students');

    // Fetch students, classes, and school data from backend API
    const authHeader = req.headers.get('authorization') || '';
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    console.log('Fetching data from backend...');
    let studentsResponse;
    if (studentId) {
      // Fetch single student
      studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        headers: { 'Authorization': authHeader }
      });
    } else {
      // Fetch all students
      studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        headers: { 'Authorization': authHeader }
      });
    }

    const [classesResponse, schoolResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: { 'Authorization': authHeader }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: { 'Authorization': authHeader }
      })
    ]);

    console.log('Students API status:', studentsResponse.status);
    console.log('Classes API status:', classesResponse.status);
    console.log('School API status:', schoolResponse.status);

    if (!studentsResponse.ok) {
      const errorText = await studentsResponse.text();
      console.error('Students API error:', errorText);
      throw new Error(`Failed to fetch students: ${studentsResponse.status} - ${errorText}`);
    }

    if (!classesResponse.ok) {
      const errorText = await classesResponse.text();
      console.error('Classes API error:', errorText);
      throw new Error(`Failed to fetch classes: ${classesResponse.status} - ${errorText}`);
    }

    const studentData = await studentsResponse.json();
    // If single student, wrap in array for consistent processing
    const students = studentId ? [studentData] : studentData;
    const classes = await classesResponse.json();
    const school = schoolResponse.ok ? await schoolResponse.json() : { school_name: 'اسڪول', semis_code: '' };

    console.log('Data fetched successfully. Students:', students.length, 'Classes:', classes.length);
    console.log('Calling PDF service on Railway...');

    // Call Railway PDF service
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/pdf/gr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        students,
        classes,
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

    // Generate appropriate filename
    const filename = studentId
      ? `gr-${students[0]?.gr_number || studentId}.pdf`
      : 'gr-register.pdf';

    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes, filename:', filename);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error: any) {
    console.error('=== GR PDF Generation Error ===');
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
