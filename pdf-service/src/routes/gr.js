const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// POST /pdf/gr
router.post('/', async (req, res) => {
  let browser;

  try {
    console.log('=== GR PDF Generation Started ===');

    const { students, classes, school } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    // Helper function to get class name
    const getClassName = (classId) => {
      return classes?.find(c => c.id === classId)?.name || '';
    };

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
<html lang="ur" dir="rtl">

<head>
    <meta charset="UTF-8" />
    <title>GR Register</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'MB Nargis New', 'MB Khursheed', sans-serif;
            direction: rtl;
        }

        .container {
            background: #fff;
            padding: 6mm;
        }

        .header {
            display: flex;
            flex-direction: row;
            justify-content:space-evenly;
            align-items: center;
            text-align: center;
            padding-bottom: 5mm;
            margin-bottom: 5mm;
        }

        .header h1 {
            font-size: 26px;
            font-weight: bold;
        }

        .header p {
            font-size: 18px;
            margin-top: 2mm;
        }

        .header h2 {
            margin-top: 3mm;
            font-size: 18px;
            text-decoration: underline;
            text-underline-offset: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 2mm;
            text-align: center;
            vertical-align: middle;
            height: 10mm;
        }

        th {
            background: #e5e7eb;
            font-weight: 600;
        }

        thead {
            display: table-header-group;
        }

        @page {
            size: legal landscape;
            margin: 10mm;
        }
        .school-info {
            display: flex;
            flex-direction: row;
            gap: 8px;
            align-items: center;
            margin-top: 3mm;
        }
        .school-info .semis {
            font-size: 20px;
            color: rgb(243, 102, 102);
        }
        .school-info .code {
            text-decoration: underline;
            text-underline-offset: 4px;
        }

    </style>
</head>

<body>

    <div class="container">

        <div class="header">
            <h1>شاگردن جي حاضري جو جنرل رجسٽر</h1>
            <p>${school?.school_name || 'اسڪول'}</p>
            <div class="school-info">
                <p class="semis">سيمس ڪوڊ</p>
                <p class="code">${school?.semis_code || ''}</p>
            </div>
        </div>

        <table>

            <!-- EXPLICIT COLUMN WIDTHS -->
            <colgroup>
                <col style="width:14mm">
                <col style="width:35mm">
                <col style="width:35mm">
                <col style="width:28mm">
                <col style="width:22mm">
                <col style="width:22mm">
                <col style="width:14mm">
                <col style="width:10mm">
                <col style="width:22mm">
                <col style="width:18mm">
                <col style="width:22mm">
                <col style="width:14mm">
                <col style="width:22mm">
                <col style="width:20mm">
                <col style="width:20mm">
                <col style="width:16mm">
                <col style="width:16mm">
                <col style="width:20mm">
            </colgroup>

            <thead>
                <tr>
                    <th>جنرل رجسٽر نمبر</th>
                    <th>شاگرد جو نالو</th>
                    <th>پيءُ جو نالو</th>
                    <th>پيدائش جي جاءِ</th>
                    <th>پيدائش جي تاريخ (انگن ۾)</th>
                    <th>پيدائش جي تاريخ (لفظن ۾)</th>
                    <th>مذهب</th>
                    <th>ذات</th>
                    <th>ڪھڙي اسڪول مان آيو</th>
                    <th>ڪھڙي درجي ۾ داخل ٿيو</th>
                    <th>داخلا جي تاريخ</th>
                    <th>اسڪول ڇڏڻ جو سرٽيفڪيٽ</th>
                    <th>اسڪول ڇڏڻ جي تاريخ</th>
                    <th>اسڪول ڇڏڻ وقت درجو</th>
                    <th>اسڪول ڇڏڻ جو سبب</th>
                    <th>تعليمي لياقت</th>
                    <th>چال چلت</th>
                    <th>ريمارڪس</th>
                </tr>
            </thead>
            <tbody>
              ${students.map((student) => `
                <tr>
                  <td>${student.gr_number || ''}</td>
                  <td>${student.name || ''}</td>
                  <td>${student.father_name || ''}</td>
                  <td>${student.place_of_birth || ''}</td>
                  <td>${student.date_of_birth || ''}</td>
                  <td>${student.date_of_birth_words || ''}</td>
                  <td>${student.religion || ''}</td>
                  <td>${student.caste || ''}</td>
                  <td>${student.previous_school || ''}</td>
                  <td>${getClassName(student.admission_class_id)}</td>
                  <td>${student.admission_date || ''}</td>
                  <td>${student.leaving_certificate_number || ''}</td>
                  <td>${student.leaving_date || ''}</td>
                  <td>${student.leaving_class_id ? getClassName(student.leaving_class_id) : ''}</td>
                  <td>${student.reason_for_leaving || ''}</td>
                  <td>${student.educational_qualification || ''}</td>
                  <td>${student.conduct || ''}</td>
                  <td>${student.remarks || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=gr-register.pdf');
    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('=== GR PDF Generation Error ===');
    console.error('Error:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router;
