const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { students, classes, school, academicYear } = req.body;

    // Use provided academic year or default to current year
    const displayYear = academicYear || new Date().getFullYear();

    // Separate students by gender for each class
    const getStudentsByGender = (classStudents) => {
      const boys = classStudents.filter(s =>
        s.gender === "ڇوڪرو" || s.gender === "boy" || s.gender === "Male" || s.gender === "Boy"
      );
      const girls = classStudents.filter(s =>
        s.gender === "ڇوڪري" || s.gender === "girl" || s.gender === "Female" || s.gender === "Girl"
      );
      return { boys, girls };
    };

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}

/* PAGE SETUP - LEGAL LANDSCAPE */
@page {
  size: legal landscape;
  margin: 10mm 8mm;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'MB Sindhi Web SK 2.0';
  direction: rtl;
  font-size: 16pt;
}

/* TABLE STYLING */
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* HEADER REPEAT */
thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

/* PREVENT ROW BREAKING */
tr {
  page-break-inside: avoid;
}

.no-break {
  page-break-inside: avoid;
}

/* CELLS */
th, td {
  border: 1px solid #000;
  padding: 2mm;
  text-align: center;
  vertical-align: middle;
  font-size: 16pt;
}

/* HEADER CELLS */
th {
  background: #e5e7eb;
}

/* SINDHI TEXT */
.sindhi {
  direction: rtl;
  text-align: center;
}

/* CLASS HEADER */
.class-header {
  background-color: #e5e5e5;
  font-weight: bold;
  font-size: 14pt;
  padding: 2mm;
  text-align: right;
  padding-right: 6mm;
}

/* GENDER HEADER */
.gender-header {
  background-color: #ffd1dc;
  font-weight: bold;
  font-size: 13pt;
  padding: 2mm;
}

/* PAGE BREAKS */
.class-section {
  page-break-before: always;
}

.class-section:first-child {
  page-break-before: auto;
}

.class-name-row {
  page-break-after: avoid;
}

/* ROW HEIGHT */
.tr {
  height: 20mm;
}

/* TITLE STYLING */
.title-header {
  font-size: 24pt;
  font-weight: bold;
  padding: 4mm;
}

.subtitle {
  font-size: 14pt;
  padding: 2mm;
}

</style>
</head>

<body>

<table>

<colgroup>
  <col style="width: 20mm" /> <!-- GR -->
  <col style="width: 18mm" /> <!-- Roll -->
  <col style="width: 42mm" /> <!-- Student Name -->
  <col style="width: 42mm" /> <!-- Father Name -->
  <col style="width: 18mm" /> <!-- دينيات -->
  <col style="width: 18mm" /> <!-- مادري زبان -->
  <col style="width: 18mm" /> <!-- رياضي -->
  <col style="width: 18mm" /> <!-- سماجي اڀياس -->
  <col style="width: 20mm" /> <!-- جنرل سائنس -->
  <col style="width: 18mm" /> <!-- اردو -->
  <col style="width: 18mm" /> <!-- انگلش -->
  <col style="width: 22mm" /> <!-- ڊرائنگ / فنون -->
  <col style="width: 24mm" /> <!-- DOB -->
  <col style="width: 24mm" /> <!-- Admission Date -->
  <col style="width: 22mm" /> <!-- Pass/Fail -->
</colgroup>

<thead>

<tr>
  <th colspan="15" class="sindhi">
    <div class="title-header">جديد رزلٽ شيٽ - سال ـ ${displayYear}</div>
    <div class="subtitle">
      <span>نقشو امتحان جي مارڪن جو</span>
      <span style="font-weight: bold; text-decoration: underline; margin: 0 10px;">${school?.school_name || 'اسڪول'}</span>
      <span>جي درجي ـــــــــــــــــــ جو ساليانو امتحان تاريخ ـــــــــــ مھينو ـــــــــــــــــــــ سال ـــــــــــــــــــــ</span>
    </div>
  </th>
</tr>

<tr class="tr">
  <th rowspan="2" class="sindhi">جنرل رجسٽر نمبر</th>
  <th rowspan="2" class="sindhi">ڳاڻيٽي جو نمبر</th>
  <th rowspan="2" class="sindhi">شاگرد جو نالو</th>
  <th rowspan="2" class="sindhi">پيءُ جو نالو</th>
  <th class="sindhi">دينيات</th>
  <th class="sindhi">مادري زبان</th>
  <th class="sindhi">رياضي</th>
  <th class="sindhi">سماجي اڀياس</th>
  <th class="sindhi">جنرل سائنس</th>
  <th class="sindhi">اردو</th>
  <th class="sindhi">انگلش</th>
  <th class="sindhi">ڊرائنگ / علم فنون</th>
  <th rowspan="2" class="sindhi">ڄمڻ جي تاريخ</th>
  <th rowspan="2" class="sindhi">داخلا جي تاريخ</th>
  <th rowspan="2" class="sindhi">پاس يا ناپاس</th>
</tr>

<tr>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
  <th class="sindhi">100</th>
</tr>

</thead>

<tbody>

${classes.map((cls, classIndex) => {
  const classStudents = students.filter(s => s.current_class_id === cls.id);
  const { boys, girls } = getStudentsByGender(classStudents);

  const renderStudents = (studentList, startIndex) => {
    return studentList.map((s, idx) => `
<tr class="no-break">
  <td>${s.gr_number || '-'}</td>
  <td>${startIndex + idx + 1}</td>
  <td class="sindhi">${s.name || '-'}</td>
  <td class="sindhi">${s.father_name || '-'}</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td>${s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('en-GB') : '—'}</td>
  <td>${s.admission_date ? new Date(s.admission_date).toLocaleDateString('en-GB') : '—'}</td>
  <td></td>
</tr>
    `).join('');
  };

  return `
<!-- Class Name Row -->
<tr class="${classIndex > 0 ? 'class-section class-name-row' : 'class-name-row'}">
  <td colspan="15" class="class-header sindhi">${cls.name}</td>
</tr>

<!-- Boys Section -->
${boys.length > 0 ? renderStudents(boys, 0) : ''}

<!-- Girls Section -->
${girls.length > 0 ? `
<tr class="no-break">
  <td colspan="15" class="gender-header sindhi">ڇوڪريون (Girls)</td>
</tr>
${renderStudents(girls, boys.length)}
` : ''}

${classStudents.length === 0 ? `
<tr>
  <td colspan="15" style="padding: 10mm; text-align: center; color: #666;">هن ڪلاس ۾ ڪوبه شاگرد موجود ناهي</td>
</tr>
` : ''}
  `;
}).join('')}

</tbody>

</table>

</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true // ⭐ MUST for header repeat consistency
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resultsheet.pdf');
    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;