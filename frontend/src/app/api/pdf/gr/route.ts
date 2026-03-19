import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf-service";

export async function GET(req: NextRequest) {
  try {
    console.log('=== GR PDF Generation Started ===');

    // Check if studentId is provided in query params
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    console.log('Student ID:', studentId || 'All students');

    // Get authorization header - Vercel may move it to x-vercel-sc-headers
    let authHeader =
      req.headers.get('authorization') ||
      req.headers.get('Authorization') ||
      '';

    // If not found, check Vercel's special header
    if (!authHeader) {
      const vercelHeaders = req.headers.get('x-vercel-sc-headers');
      if (vercelHeaders) {
        try {
          const parsed = JSON.parse(vercelHeaders);
          authHeader = parsed.Authorization || '';
        } catch (e) {
          console.error('Failed to parse x-vercel-sc-headers:', e);
        }
      }
    }

    console.log('Auth header present:', !!authHeader);
    console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'NONE');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    if (!authHeader) {
      console.error('No authorization header found!');
      return NextResponse.json(
        { error: "No authorization header provided" },
        { status: 401 }
      );
    }

    console.log('Fetching data from backend...');

    // Remove trailing slash from API URL to prevent double slashes
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

    let studentsResponse;
    if (studentId) {
      // Fetch single student
      studentsResponse = await fetch(`${apiUrl}/students/${studentId}`, {
        headers: { 'Authorization': authHeader }
      });
    } else {
      // Fetch all students
      studentsResponse = await fetch(`${apiUrl}/students`, {
        headers: { 'Authorization': authHeader }
      });
    }

    const [classesResponse, schoolResponse] = await Promise.all([
      fetch(`${apiUrl}/classes`, {
        headers: { 'Authorization': authHeader }
      }),
      fetch(`${apiUrl}/schools/my-school`, {
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

    // Generate appropriate filename
    const filename = studentId
      ? `gr-${students[0]?.gr_number || studentId}.pdf`
      : 'gr-register.pdf';

    // Call PDF service using reusable function
    return await generatePDF(
      '/pdf/gr',
      { students, classes, school },
      filename
    );

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
