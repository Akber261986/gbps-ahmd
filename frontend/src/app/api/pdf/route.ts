import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  let browser;
  try {
    console.log('=== Generic PDF Generation Started ===');
    console.log('Target URL:', url);
    console.log('APP_URL:', process.env.APP_URL);

    const fullUrl = `${process.env.APP_URL}${url}`;
    console.log('Full URL:', fullUrl);

    console.log('Launching Puppeteer with Chromium...');
    const execPath = await chromium.executablePath();
    console.log('Chromium executable path:', execPath);

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: execPath,
      headless: chromium.headless,
    });

    console.log('Browser launched successfully');
    const page = await browser.newPage();
    console.log('New page created');

    console.log('Navigating to URL...');
    await page.goto(fullUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    console.log('Page loaded, waiting for body selector...');
    await page.waitForSelector('body', { timeout: 5000 });
    console.log('Body selector found');

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=result.pdf",
      },
    });
  } catch (error: any) {
    console.error('=== PDF Generation Error ===');
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
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}
