import student_age from "@/lib/student_age";
import { NextRequest, NextResponse } from "next/server";

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
    console.log('=== Admission Form PDF Generation Started ===');
    console.log('Student ID:', studentId);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Vercel:', !!process.env.VERCEL);

    // fetch admission data
    const authHeader = req.headers.get("authorization") || "";
    console.log('Auth header present:', !!authHeader);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    console.log('Fetching data from backend...');
    const [studentRes, schoolRes, classesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        headers: {
          Authorization: authHeader,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: {
          Authorization: authHeader,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: {
          Authorization: authHeader,
        },
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

    // Find the admission class name
    const admissionClass = classes.find((c: any) => c.id === student.admission_class_id);
    const className = admissionClass ? admissionClass.name : "";
    const age = student_age(student.date_of_birth, student.admission_date);

    // Format dates
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB");
    };

    // Format age in Sindhi
    const ageFormatted = age ? `${age.y} سال، ${age.m} مهينا، ${age.d} ڏينهن` : "—";

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>

body{
  font-family: 'sans-serif';
  direction: rtl;
  padding:0;
  margin:0;
}

.paper{
    background:#f5f0c9;
    border:6px solid #2c7a4b;
    padding:40px;
  }
  
  .title{
    text-align:center;
    font-size:28px;
    font-weight:bold;
    margin-bottom:15px;
  }
  
  .top{
    display:flex;
    justify-content:space-between;
    font-size:14px;
    margin-bottom:15px;
  }
  
  .row{
    display:flex;
    align-items:flex-end;
    margin:10px 8px;
    font-size:14px;
    min-height:24px;
  }
  
  .number{
    width:30px;
  }
  
  .label{
    white-space:nowrap;
  }
  
  .line{
    flex:1;
    border-bottom:1px solid #000;
    margin:8px 16px;
    text-align:center;
    font-size:16px;
  }

  .two-col-row{
    display:flex;
    gap:16px;
    margin:10px 8px;
    min-height:24px;
  }

  .col{
    flex:1;
    display:flex;
    align-items:flex-end;
    font-size:14px;
  }
  
.signatures{
  margin-top:40px;
  display:flex;
  justify-content:space-between;
}

.sign{
  text-align:center;
  width:40%;
  font-size:14px;
}

.sign-line{
  border-top:1px solid #000;
  margin-bottom:5px;
}

</style>
</head>

<body>

<div class="paper">

<div class="title">داخلہ فارم</div>

<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:15px; font-size:18px;">
  <div style="margin-bottom:8px;">
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
<span class="line">${student.gr_number || ""}</span>
</div>

<div class="row">
<span class="number">2.</span>
<span class="label">داخلہ جي تاريخ</span>
<span class="line">${formatDate(student.admission_date)}</span>
</div>

<div class="row">
<span class="number">3.</span>
<span class="label">شاگرد جو نالو</span>
<span class="line">${student.name || ""}</span>
</div>

<div class="row">
<span class="number">4.</span>
<span class="label">والد جو نالو</span>
<span class="line">${student.father_name || ""}</span>
</div>

<div class="two-col-row">
  <div class="col">
    <span class="number">5.</span>
    <span class="label">قوم</span>
    <span class="line">${student.qom || ""}</span>
  </div>
  <div class="col">
    <span class="number">6.</span>
    <span class="label">ذات</span>
    <span class="line">${student.caste || ""}</span>
  </div>
</div>

<div class="two-col-row">
  <div class="col">
    <span class="number">7.</span>
    <span class="label"> سرپرست جو نالو</span>
    <span class="line">${student.guardian_name || ""}</span>
  </div>
  <div class="col">
    <span class="number">8.</span>
    <span class="label"> بمعہ مائيٽي</span>
    <span class="line">${student.relation_with_guardian || ""}</span>
  </div>
</div>

<div class="row">
<span class="number">9.</span>
<span class="label">سرپرست جو ڌنڌو</span>
<span class="line">${student.guardian_occupation || ""}</span>
</div>

<div class="row">
<span class="number">10.</span>
<span class="label">پيدائش جي جاءِ</span>
<span class="line">${student.place_of_birth}</span>
</div>

<div class="row">
<span class="number">11.</span>
<span class="label">پيدائش جي تاريخ</span>
<span class="line">${formatDate(student.date_of_birth)}</span>
</div>

<div class="row">
<span class="number">12.</span>
<span class="label">پيدائش جي تاريخ لفظن ۾</span>
<span class="line">${student.date_of_birth_in_letter || ""}</span>
</div>

<div class="row">
<span class="number">13.</span>
<span class="label">ڪھڙي اسڪول مان آيو</span>
<span class="line">${student.previous_school || ""}</span>
</div>

<div class="row">
<span class="number">14.</span>
<span class="label"> ڪهڙي ڪلاس ۾ داخل ٿيو / ٿي</span>
<span class="line">${className}</span>
</div>

<div class="row">
<span class="number">15.</span>
<span class="label">سرپرست جي صحيح</span>
<span class="line"></span>
</div>

<div class="row">
<span class="number">16.</span>
<span class="label">داخلہ وقت عمر</span>
<span class="line">${age ? age.y : ""} سال</span>
<span class="line">${age ? age.m : ""} مھينا </span>
<span class="line">${age ? age.d : ""} ڏينھن</span>
</div>

<div class="signatures">

<div class="sign">
<div class="sign-line"></div>
<p>صحيح ڪلاس ماسٽر / ماسترياڻي</p>
</div>

<div class="sign">
<div class="sign-line"></div>
<p>صحيح هيڊ ماسٽر / هيڊ مسٽريس</p>
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
      // Production: Use puppeteer-core + chromium (full package with bundled libraries)
      const puppeteerCore = await import('puppeteer-core');
      const chromium = await import('@sparticuz/chromium');

      const execPath = await chromium.default.executablePath();
      console.log('Production - Chromium executable path:', execPath);

      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath: execPath,
        headless: chromium.default.headless,
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
    await page.setContent(html, { waitUntil: "networkidle0" });
    console.log('HTML content set');

    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    console.log('PDF generated successfully, size:', pdf.length, 'bytes');

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=admission-form.pdf",
      },
    });

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

  } finally {

    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }

  }
}