import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = (process.env.PDF_SERVICE_URL || 'https://gbps-ahmd-production.up.railway.app').replace(/\/$/, '');

export async function GET(req: NextRequest) {
  try {
    console.log('=== Resultsheet PDF Generation Started ===');
    console.log('PDF Service URL:', PDF_SERVICE_URL);

    const authHeader = req.headers.get('authorization') || '';
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    console.log('Fetching data from backend...');
    const [studentsRes, classesRes, schoolRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        headers: {
          'Authorization': authHeader
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: {
          'Authorization': authHeader
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: {
          'Authorization': authHeader
        }
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
    console.log('Calling PDF service on Railway...');

    // Call Railway PDF service
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/pdf/resultsheet`, {
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
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resultsheet.pdf",
      },
    });
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
