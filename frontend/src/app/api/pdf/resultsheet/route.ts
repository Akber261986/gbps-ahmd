import { NextRequest, NextResponse } from "next/server";
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';

export async function GET(req: NextRequest) {
  let browser;

  try {
    console.log('=== Resultsheet PDF Generation Started ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Vercel:', !!process.env.VERCEL);
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
    const school = schoolRes.ok ? await schoolRes.json() : { name: 'اسڪول مئنيجمينٽ سسٽم', semis_code: '' };

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
  <meta charset="UTF-8" />
  <title>Result Sheet</title>

  <style>
    @page {
      size: legal landscape;
      margin: 10mm 8mm;
    }

    body {
      margin: 0;
      font-family: serif;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      display: table-header-group;
    }

    th,
    td {
      border: 1px solid #000;
      font-size: 15pt;
      text-align: center;
      vertical-align: middle;
    }

    .sindhi {
      direction: rtl;
    }

    .sindhi .header-title {
      font-size: 26pt;
      font-weight: bold;

    }

    .s-name {
      font-weight: bold;
      font-size: 16pt;
      text-decoration: underline;
      text-underline-offset: 6px;
    }

    .header-sub {
      font-size: 14pt;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10mm;
      padding: 1mm;
    }

    .class-header {
      background: #e5e5e5;
      font-weight: bold;
      font-size: 14pt;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Force each class to start on a new page */
    .class-section {
      page-break-before: always;
    }

    /* Don't break the first class to a new page */
    .class-section:first-child {
      page-break-before: auto;
    }

    .class-break {
      page-break-before: always;
    }

    tr {
      height: 13mm;
    }
  </style>
</head>

<body>

  <table>

    <!-- ================== REPEATING HEADER ================== -->
    <thead>
      <tr>
        <th colspan="15" class="sindhi">
          <div class="header-title">جديد رزلٽ شيٽ - سال 2026</div>
          <div class="header-sub">
            <span>

              نقشو امتحان جي مارڪن جو
            </span>

            <span class="s-name">${school.school_name || 'اسڪول'}</span>
            <span>

              جي درجي ـــــــــــــــــــ جو ساليانو امتحان تاريخ ـــــــــــ مھينو ـــــــــــــــــــــ سال
              ـــــــــــــــــــــ
            </span>
          </div>
        </th>
      </tr>

      <tr>
        <th rowspan="2" style="width: 18mm;">جنرل رجسٽر نمبر</th>
        <th rowspan="2" style="width: 18mm">ڳاڻيٽي جو نمبر</th>
        <th rowspan="2" style="width: 40mm">شاگرد جو نالو</th>
        <th rowspan="2" style="width: 40mm">پيءُجو نالو </th>
        <th style="width: 18mm">دينيات</th>
        <th style="width: 18mm">مادري زبان</th>
        <th style="width: 18mm">رياضي</th>
        <th style="width: 18mm">سماجي</th>
        <th style="width: 18mm">سائنس</th>
        <th style="width: 18mm">اردو</th>
        <th style="width: 18mm">انگلش</th>
        <th style="width: 18mm">ڊرائنگ</th>
        <th rowspan="2" style="width: 28mm">ڄمڻ جي تاريخ</th>
        <th rowspan="2" style="width: 28mm">داخلا جي تاريخ</th>
        <th rowspan="2" style="width: 20mm">پاس يا ناپاس</th>
      </tr>

      <tr>
        <th>100</th>
        <th>100</th>
        <th>100</th>
        <th>100</th>
        <th>100</th>
        <th>100</th>
        <th>100</th>
        <th>100</th>
      </tr>
    </thead>
<!-- ================== BODY ================== -->
          <tbody>
            ${classes
              .map((cls: any, classIndex: number) => {
                const classStudents = students.filter(
                  (s: any) => s.current_class_id === cls.id,
                );
                const boys = classStudents.filter(
                  (s: any) =>
                    s.gender === "ڇوڪرو" ||
                    s.gender === "boy" ||
                    s.gender === "Male" ||
                    s.gender === "Boy",
                );
                const girls = classStudents.filter(
                  (s: any) =>
                    s.gender === "ڇوڪري" ||
                    s.gender === "girl" ||
                    s.gender === "Female" ||
                    s.gender === "Girl",
                );

                const renderStudents = (
                  studentList: any[],
                  startIndex: number,
                ) => {
                  return studentList
                    .map(
                      (std: any, index: number) => `
                  <tr class="no-break">
                    <td>${std.gr_number || "-"}</td>
                    <td>${startIndex + index + 1}</td>
                    <td class="sindhi">${std.name || "-"}</td>
                    <td class="sindhi">${std.father_name || "-"}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${std.date_of_birth ? new Date(std.date_of_birth).toLocaleDateString("en-GB") : ""}</td>
                    <td>${std.admission_date ? new Date(std.admission_date).toLocaleDateString("en-GB") : ""}</td>
                    <td></td>
                  </tr>
                `,
                    )
                    .join("");
                };

                return `
                <!-- Class Name Row -->
                <tr class="class-name-row ${classIndex > 0 ? "class-section" : ""}">
                  <td colspan="15" class="class-header sindhi">
                    ${cls.name}
                  </td>
                </tr>

                ${
                  boys.length > 0
                    ? `
                  ${renderStudents(boys, 0)}
                `
                    : ""
                }

                ${
                  girls.length > 0
                    ? `
                  <!-- Girls Section -->
                  <tr class="gender-header no-break">
                    <td colspan="15" class="class-header sindhi" style="background-color: #ffd1dc; font-size: 13pt;">
                      ڇوڪريون (Girls)
                    </td>
                  </tr>
                  ${renderStudents(girls, boys.length)}
                `
                    : ""
                }

                ${
                  classStudents.length === 0
                    ? `
                  <tr>
                    <td colspan="15" style="padding: 4mm; text-align: center; color: #9ca3af; font-style: italic;">
                      هن ڪلاس ۾ ڪوبه شاگرد موجود ناهي
                    </td>
                  </tr>
                `
                    : ""
                }
              `;
              })
              .join("")}

            ${
              classes.length === 0
                ? `
              <tr>
                <td colspan="15" style="padding: 8mm; text-align: center; color: #4b5563; font-size: 14pt;">
                  ڪي به ڪلاس موجود ناهي
                </td>
              </tr>
            `
                : ""
            }
          </tbody>

</table>
</body>
</html>
`;

    console.log('Data fetched successfully. Students:', students.length, 'Classes:', classes.length);
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

    await page.setContent(html, { waitUntil: "networkidle0" });
    console.log('HTML content set');

    const pdf = await page.pdf({
      format: "A4" as any,
      landscape: true,
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "8mm",
        right: "8mm",
      },
    });

    console.log('PDF generated successfully, size:', pdf.length, 'bytes');

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resultsheet.pdf",
      },
    });
  } catch (e: any) {
    console.error('=== PDF Generation Error ===');
    console.error('Error name:', e.name);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    return NextResponse.json({
      error: e.message,
      details: e.stack,
      name: e.name
    }, { status: 500 });
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}
