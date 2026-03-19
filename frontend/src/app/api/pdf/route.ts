import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  try {
    console.log('=== Generic PDF Generation Started ===');
    console.log('Target URL:', url);
    console.log('APP_URL:', process.env.APP_URL);

    const fullUrl = `${process.env.APP_URL}${url}`;
    console.log('Full URL:', fullUrl);

    // Call PDF service using reusable function
    return await generatePDF(
      '/pdf/generic',
      { url: fullUrl },
      'result.pdf'
    );

  } catch (error: any) {
    console.error('=== Generic PDF Generation Error ===');
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
