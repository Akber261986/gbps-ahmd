const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS, mbLeekaShabir } = require('../utils/fontLoader');

const router = express.Router();

// POST /pdf/leaving-certificate
router.post('/', async (req, res) => {
  let browser;

  try {
    const { data, school } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Certificate data is required' });
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0', 'MB-Leeka-Shabir-Kumbhar-2.0.ttf')}

/* ✅ A4 Setup */
@page {
  size: A4 portrait;
  margin: 10mm;
}

html, body {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'MB Sindhi Web SK 2.0';
  direction: rtl;
  font-size: 14px;
}

/* ✅ Paper */
.paper {
  width: 190mm;
  min-height: 277mm;
  margin: auto;
  background: #f5f0c9;
  border: 4px solid #2c7a4b;
  padding: 10mm;
  box-sizing: border-box;
}

/* ✅ Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6mm;
}

.logo {
  width: 20mm;
  height: 20mm;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.photo {
  width: 25mm;
  height: 30mm;
  border: 1px solid #000;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.center-header {
  flex: 1;
  text-align: center;
}

.title {
  font-size: 24px;
  font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';
  margin-bottom: 2mm;
}

.school-name {
  font-size: 16px;
  font-weight: bold;
}

.sem-code {
  font-size: 14px;
}

/* ✅ Rows */
.row {
  display: flex;
  align-items: flex-end;
  margin: 5mm 0;
  font-size: 16px;
}

.number {
  width: 8mm;
}

.label {
  margin: 0 4mm;
  white-space: nowrap;
}

.line {
  flex: 1;
  border-bottom: 1px solid #000;
  min-height: 6mm;
  text-align: center;
}

/* ✅ Two Column Row */
.two-col {
  display: flex;
  gap: 8mm;
}

.col {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

/* ✅ Declaration */
.declaration {
  margin-top: 10mm;
  font-size: 13px;
}

/* ✅ Signatures */
.signatures {
  margin-top: 20mm;
  display: flex;
  justify-content: space-between;
}

.sign {
  width: 45%;
  text-align: center;
}

.sign-line {
  border-top: 1px solid #000;
  margin-bottom: 3mm;
}
</style>

</head>

<body>

<div class="paper">

  <div style="text-align:left; font-size:12px;">فارم نمبر 16</div>

  <div class="header">

    <div class="logo">
      ${school?.logo_url ? `<img src="${school.logo_url}" />` : ''}
    </div>

    <div class="center-header">
      <div class="title">اسڪول ڇڏڻ جو سرٽيفڪيٽ</div>
      <div class="school-name">${school?.school_name || '—'}</div>
      <div class="sem-code">سيمس ڪوڊ: ${school?.semis_code || '—'}</div>
    </div>

    <div class="photo">
      ${data?.student_photo_url ? `<img src="${data.student_photo_url}" />` : ''}
    </div>

  </div>

  <div class="row">
    <div class="number">1.</div>
    <div class="label">جنرل رجسٽر نمبر</div>
    <div class="line">${data.gr_number || ''}</div>
  </div>

  <div class="row">
    <div class="number">2.</div>
    <div class="label">شاگرد جو نالو</div>
    <div class="line">${data.student_name || ''}</div>
  </div>

  <div class="row">
    <div class="number">3.</div>
    <div class="label">والد جو نالو</div>
    <div class="line">${data.father_name || ''}</div>
  </div>

  <div class="two-col">
    <div class="col">
      <div class="number">4.</div>
      <div class="label">قوم</div>
      <div class="line">${data.qom || ''}</div>
    </div>
    <div class="col">
      <div class="number">5.</div>
      <div class="label">ذات</div>
      <div class="line">${data.caste || ''}</div>
    </div>
  </div>

  <div class="row">
    <div class="number">6.</div>
    <div class="label">پيدائش جي جاءِ</div>
    <div class="line">${data.place_of_birth || ''}</div>
  </div>

  <div class="row">
    <div class="number">7.</div>
    <div class="label">ڄمڻ جي تاريخ</div>
    <div class="line">${formatDate(data.date_of_birth)}</div>
  </div>

  <div class="row">
    <div class="number">8.</div>
    <div class="label">ڄمڻ جي تاريخ (لفظن ۾)</div>
    <div class="line">${data.date_of_birth_in_letter || ''}</div>
  </div>

  <div class="row">
    <div class="number">9.</div>
    <div class="label">داخلا جي تاريخ</div>
    <div class="line">${formatDate(data.admission_date)}</div>
  </div>

  <div class="row">
    <div class="number">10.</div>
    <div class="label">پويون اسڪول</div>
    <div class="line">${data.previous_school || ''}</div>
  </div>

  <div class="row">
    <div class="number">11.</div>
    <div class="label">پوئين اسڪول جو رجسٽر نمبر</div>
    <div class="line">${data.gr_of_previous_school || ''}</div>
  </div>

  <div class="row">
    <div class="number">12.</div>
    <div class="label">اسڪول ڇڏڻ جي تاريخ</div>
    <div class="line">${formatDate(data.leaving_date)}</div>
  </div>

  <div class="row">
    <div class="number">13.</div>
    <div class="label">ڇڏڻ وقت ڪلاس</div>
    <div class="line">${data.class_on_leaving || ''}</div>
  </div>

  <div class="row">
    <div class="number">14.</div>
    <div class="label">ڇڏڻ جو سبب</div>
    <div class="line">${data.reason_for_leaving || ''}</div>
  </div>

  <div class="row">
    <div class="number">15.</div>
    <div class="label">تعليمي قابليت</div>
    <div class="line">${data.educational_ability || ''}</div>
  </div>

  <div class="row">
    <div class="number">16.</div>
    <div class="label">چال چلت</div>
    <div class="line">${data.character || ''}</div>
  </div>

  <div class="row">
    <div class="number">17.</div>
    <div class="label">ريمارڪس</div>
    <div class="line">${data.remarks || ''}</div>
  </div>

  <div class="declaration">
    سرٽيفڪيٽ ڏجي ٿو ته مهي ڄاڻايل تفصيل اسڪول جي جنرل رجسٽر مطابق صحيح آهن۔
  </div>

  <div class="signatures">
    <div class="sign">
      <div class="sign-line"></div>
      صحيح هيڊ ماسٽر / هيڊ مسٽريس
    </div>

    <div class="sign">
      <div class="sign-line"></div>
      صحيح ڪلاس ماسٽر / ماسترياڻي
    </div>
  </div>

</div>

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
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // ⭐ critical
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leaving-certificate-${data.gr_number}.pdf`
    );

    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;