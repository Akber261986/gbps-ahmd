import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf-service";

export async function POST(req: NextRequest) {
  try {
    console.log('=== Summary Resultsheet PDF Generation Started ===');

    // Parse request body
    const body = await req.json();
    const { classes, school, academicYear, statistics } = body;

    console.log('Received data - Classes:', classes?.length, 'Statistics:', statistics?.length, 'Academic Year:', academicYear);

    if (!classes || !statistics) {
      throw new Error('Missing required data: classes and statistics');
    }

    // Call PDF service
    return await generatePDF(
      '/pdf/summary-resultsheet',
      { classes, school, academicYear, statistics },
      `summary-resultsheet-${academicYear || 'current'}.pdf`
    );

  } catch (e: any) {
    console.error('=== Summary Resultsheet PDF Generation Error ===');
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
