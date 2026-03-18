import { NextRequest, NextResponse } from "next/server";
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  let browser;
  try {
    console.log('=== Leaving Certificate PDF Generation Started ===');
    console.log('Student ID:', studentId);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Vercel:', !!process.env.VERCEL);

    const authHeader = req.headers.get("authorization") || "";
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    // Fetch the certificate data and school data from your backend API
    console.log('Fetching data from backend...');
    const [certResponse, schoolResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/school-leaving-certificates/${studentId}`, {
        headers: {
          Authorization: authHeader,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: {
          Authorization: authHeader,
        },
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

    // Format dates
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB");
    };

    // Generate HTML content with the data
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'sans-serif';
            direction: rtl;
            padding: 0;
            margin: 0;
          }

          .paper {
            background: #f5f0c9;
            border: 6px solid #2c7a4b;
            padding: 40px;
          }

          .form-number {
            text-align: right;
            font-size: 12px;
            margin-bottom: 10px;
          }

          .title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
          }

          .school-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 15px;
            font-size: 18px;
          }

          .school-info div {
            margin-bottom: 8px;
          }

          .row {
            display: flex;
            align-items: flex-end;
            margin: 10px 8px;
            font-size: 14px;
            min-height: 24px;
          }

          .number {
            width: 30px;
          }

          .label {
            white-space: nowrap;
          }

          .line {
            flex: 1;
            border-bottom: 1px solid #000;
            margin: 8px 16px;
            text-align: center;
            font-size: 16px;
          }

          .declaration {
            margin-top: 30px;
            margin-right: 8px;
            font-size: 12px;
          }

          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }

          .sign {
            text-align: center;
            width: 40%;
            font-size: 14px;
          }

          .sign-line {
            border-top: 1px solid #000;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="paper">
          <div class="form-number">فارم نمبر 16</div>

          <div class="title">اسڪول ڇڏڻ جو سرٽيفڪيٽ</div>

          <div class="school-info">
            <div>
              <strong>${school.school_name || "—"}</strong>
            </div>
            <div>
              <span>سيمس ڪوڊ: </span>
              <strong>${school.semis_code || "—"}</strong>
            </div>
          </div>

          <div class="row">
            <span class="number">1.</span>
            <span class="label">جنرل رجسٽر نمبر</span>
            <span class="line">${data.gr_number || ""}</span>
          </div>

          <div class="row">
            <span class="number">2.</span>
            <span class="label">شاگرد جو نالو</span>
            <span class="line">${data.student_name || ""}</span>
          </div>

          <div class="row">
            <span class="number">3.</span>
            <span class="label">والد جو نالو</span>
            <span class="line">${data.father_name || ""}</span>
          </div>

          <div class="row">
            <span class="number">4.</span>
            <span class="label">قوم</span>
            <span class="line">${data.qom || ""}</span>

            <span class="number">5.</span>
            <span class="label">ذات</span>
            <span class="line">${data.caste || ""}</span>
          </div>

          <div class="row">
            <span class="number">6.</span>
            <span class="label">پيدائش جي جاءِ</span>
            <span class="line">${data.place_of_birth || ""}</span>
          </div>

          <div class="row">
            <span class="number">7.</span>
            <span class="label">ڄمڻ جي تاريخ</span>
            <span class="line">${formatDate(data.date_of_birth)}</span>
          </div>

          <div class="row">
            <span class="number">8.</span>
            <span class="label">ڄمڻ جي تاريخ (لفظن ۾)</span>
            <span class="line">${data.date_of_birth_in_letter || ""}</span>
          </div>

          <div class="row">
            <span class="number">9.</span>
            <span class="label">داخلا جي تاريخ</span>
            <span class="line">${formatDate(data.admission_date)}</span>
          </div>

          <div class="row">
            <span class="number">10.</span>
            <span class="label">پويون اسڪول</span>
            <span class="line">${data.previous_school || ""}</span>
          </div>

          <div class="row">
            <span class="number">11.</span>
            <span class="label">اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر</span>
            <span class="line">${data.gr_of_previous_school || ""}</span>
          </div>

          <div class="row">
            <span class="number">12.</span>
            <span class="label">اسڪول ڇڏڻ جي تاريخ</span>
            <span class="line">${formatDate(data.leaving_date)}</span>
          </div>

          <div class="row">
            <span class="number">13.</span>
            <span class="label">اسڪول ڇڏڻ وقت ڪلاس</span>
            <span class="line">${data.class_on_leaving || ""}</span>
          </div>

          <div class="row">
            <span class="number">14.</span>
            <span class="label">اسڪول ڇڏڻ جو سبب</span>
            <span class="line">${data.reason_for_leaving || ""}</span>
          </div>

          <div class="row">
            <span class="number">15.</span>
            <span class="label">تعليمي قابليت</span>
            <span class="line">${data.educational_ability || ""}</span>
          </div>

          <div class="row">
            <span class="number">16.</span>
            <span class="label">چال چلت</span>
            <span class="line">${data.character || ""}</span>
          </div>

          <div class="row">
            <span class="number">17.</span>
            <span class="label">ريمارڪس</span>
            <span class="line">${data.remarks || ""}</span>
          </div>

          <div class="declaration">
            سرٽيفڪيٽ ڏجي ٿو ته مهي ڄاڻايل تفصيل اسڪول جي جنرل رجسٽر مطابق صحيح آهن.
          </div>

          <div class="signatures">
            <div class="sign">
              <div class="sign-line"></div>
              <p>صحيح هيڊ ماسٽر / هيڊ مسٽريس</p>
            </div>

            <div class="sign">
              <div class="sign-line"></div>
              <p>صحيح ڪلاس ماسٽر / ماسترياڻي</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Data fetched successfully');
    console.log('Launching Puppeteer with Chromium...');

    // Use different approach based on environment
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Production: Use puppeteer-core + chromium-min with remote pack
      console.log('Production mode - Using chromium-min with remote pack');

      // Use environment variable for remote Chromium pack URL
      const chromiumPackUrl = process.env.CHROMIUM_PACK_URL ||
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar';

      console.log('Chromium pack URL:', chromiumPackUrl);

      const execPath = await chromium.executablePath(chromiumPackUrl);
      console.log('Production - Chromium executable path:', execPath);

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: execPath,
        headless: chromium.headless,
      });
    } else {
      // Development: Use full puppeteer package
      const puppeteer = await import('puppeteer');
      console.log('Development - Using bundled Chromium');

      browser = await puppeteer.default.launch({
        headless: true,
      });
    }

    console.log('Browser launched successfully');
    const page = await browser.newPage();
    console.log('New page created');

    console.log('Setting HTML content...');
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });
    console.log('HTML content set');

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=leaving-certificate-${data.gr_number}.pdf`,
      },
    });
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
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}
