import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf-service";

export async function GET(req: NextRequest) {
  try {
    console.log('=== Resultsheet PDF Generation Started ===');

    // Get authorization header - Vercel may move it to x-vercel-sc-headers
    let authHeader = req.headers.get('authorization') || '';

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
    const [studentsRes, classesRes, schoolRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        headers: { 'Authorization': authHeader }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: { 'Authorization': authHeader }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: { 'Authorization': authHeader }
      }),
    ]);

    // Log response status for debugging
    console.log('Students API status:', studentsRes.status);
    console.log('Classes API status:', classesRes.status);
    console.log('School API status:', schoolRes.status);

    if (!studentsRes.ok) {
      const errorText = await studentsRes.text();
      console.error('Students API error:', errorText);
      throw new Error(`Failed to fetch students: ${studentsRes.status} - ${errorText}`);
    }

    if (!classesRes.ok) {
      const errorText = await classesRes.text();
      console.error('Classes API error:', errorText);
      throw new Error(`Failed to fetch classes: ${classesRes.status} - ${errorText}`);
    }

    const students = await studentsRes.json();
    const classes = await classesRes.json();
    const school = schoolRes.ok ? await schoolRes.json() : { school_name: 'اسڪول مئنيجمينٽ سسٽم', semis_code: '' };

    console.log('Data fetched successfully. Students:', students.length, 'Classes:', classes.length);

    // Call PDF service using reusable function
    return await generatePDF(
      '/pdf/resultsheet',
      { students, classes, school },
      'resultsheet.pdf'
    );

  } catch (e: any) {
    console.error('=== Resultsheet PDF Generation Error ===');
    console.error('Error name:', e.name);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    return NextResponse.json({
      error: e.message,
      details: e.stack,
      name: e.name
    }, { status: 500 });
  }
}
