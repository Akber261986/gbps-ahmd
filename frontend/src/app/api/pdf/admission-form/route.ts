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
    console.log('=== Admission Form PDF Generation Started ===');
    console.log('Student ID:', studentId);

    // Get authorization header - Vercel may move it to x-vercel-sc-headers
    let authHeader = req.headers.get("authorization") || "";

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
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    console.log('Fetching data from backend...');
    const [studentRes, schoolRes, classesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: { Authorization: authHeader },
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

    // Call PDF service using reusable function
    return await generatePDF(
      '/pdf/admission-form',
      { student, school, classes },
      'admission-form.pdf'
    );

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
