const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// POST /pdf/resultsheet
router.post('/', async (req, res) => {
  let browser;

  try {
    console.log('=== Resultsheet PDF Generation Started ===');

    const { students, classes, school } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    if (!classes || !Array.isArray(classes)) {
      return res.status(400).json({ error: 'Classes array is required' });
    }

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
      font-family: 'MB Sindhi Web SK 2.0', sans-serif;
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
      text-align: center;
      vertical-align: middle;
    }

    th {
      font-size: 18px;
    }

    td {
      font-size: 20px;
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

            <span class="s-name">${school?.school_name || 'اسڪول'}</span>
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
              .map((cls, classIndex) => {
                const classStudents = students.filter(
                  (s) => s.current_class_id === cls.id,
                );
                const boys = classStudents.filter(
                  (s) =>
                    s.gender === "ڇوڪرو" ||
                    s.gender === "boy" ||
                    s.gender === "Male" ||
                    s.gender === "Boy",
                );
                const girls = classStudents.filter(
                  (s) =>
                    s.gender === "ڇوڪري" ||
                    s.gender === "girl" ||
                    s.gender === "Female" ||
                    s.gender === "Girl",
                );

                const renderStudents = (
                  studentList,
                  startIndex,
                ) => {
                  return studentList
                    .map(
                      (std, index) => `
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

    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '8mm',
        right: '8mm'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resultsheet.pdf');
    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('=== Resultsheet PDF Generation Error ===');
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
