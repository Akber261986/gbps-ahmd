const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS, mbLeekaShabir } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { student, school, classes } = req.body;

    const admissionClass = classes?.find(c => c.id === student.admission_class_id);
    const className = admissionClass?.name || '';

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '';

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0','MB-Leeka-Shabir-Kumbhar-2.0.ttf')}

@page { size: A4; margin: 10mm; }

body {
  font-family: 'MB Sindhi Web SK 2.0';
  margin: 0;
  font-size: 14px;
}

/* paper */
.paper {
  width: 190mm;
  min-height: 277mm;
  margin: auto;
  border: 3px solid #2c7a4b;
  padding: 10mm;
  background: #f5f0c9;
}

/* header */
.title {
  text-align: center;
  font-size: 24px;
  font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';
  margin-bottom: 4mm;
}

.center {
  text-align: center;
  margin-bottom: 2mm;
}

/* rows */
.row {
  display: flex;
  align-items: center;
  margin: 5mm 0;
}

.number {
  width: 10mm;
}

.label {
  width: 70mm;
}

.line {
  flex: 1;
  border-bottom: 1px solid black;
  text-align: center;
  padding-bottom: 2mm;
}

/* two col */
.two {
  display: flex;
  gap: 10mm;
}

.col {
  flex: 1;
  display: flex;
}

/* signatures */
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
  border-top: 1px solid black;
  margin-bottom: 3mm;
}
</style>
</head>

<body>

<div class="paper">

<div class="title">داخلہ فارم</div>

<div class="center"><b>${school?.school_name || ''}</b></div>
<div class="center">سيمس ڪوڊ: ${school?.semis_code || ''}</div>

<div class="row">
  <div class="number">1.</div>
  <div class="label">جنرل رجسٽر نمبر</div>
  <div class="line">${student.gr_number || ''}</div>
</div>

<div class="row">
  <div class="number">2.</div>
  <div class="label">داخلہ جي تاريخ</div>
  <div class="line">${formatDate(student.admission_date)}</div>
</div>

<div class="row">
  <div class="number">3.</div>
  <div class="label">شاگرد جو نالو</div>
  <div class="line">${student.name || ''}</div>
</div>

<div class="row">
  <div class="number">4.</div>
  <div class="label">والد جو نالو</div>
  <div class="line">${student.father_name || ''}</div>
</div>

<div class="two">
  <div class="col">
    <div class="number">5.</div>
    <div class="label">قوم</div>
    <div class="line">${student.qom || ''}</div>
  </div>
  <div class="col">
    <div class="number">6.</div>
    <div class="label">ذات</div>
    <div class="line">${student.caste || ''}</div>
  </div>
</div>

<div class="row">
  <div class="number">7.</div>
  <div class="label">سرپرست جو نالو</div>
  <div class="line">${student.guardian_name || ''}</div>
</div>

<div class="row">
  <div class="number">8.</div>
  <div class="label">سرپرست جو ڌنڌو</div>
  <div class="line">${student.guardian_occupation || ''}</div>
</div>

<div class="row">
  <div class="number">9.</div>
  <div class="label">پيدائش جي جاءِ</div>
  <div class="line">${student.place_of_birth || ''}</div>
</div>

<div class="row">
  <div class="number">10.</div>
  <div class="label">پيدائش جي تاريخ</div>
  <div class="line">${formatDate(student.date_of_birth)}</div>
</div>

<div class="row">
  <div class="number">11.</div>
  <div class="label">پيدائش (لفظن ۾)</div>
  <div class="line">${student.date_of_birth_in_letter || ''}</div>
</div>

<div class="row">
  <div class="number">12.</div>
  <div class="label">پويون اسڪول</div>
  <div class="line">${student.previous_school || ''}</div>
</div>

<div class="row">
  <div class="number">13.</div>
  <div class="label">داخلہ ڪلاس</div>
  <div class="line">${className}</div>
</div>

<div class="row">
  <div class="number">14.</div>
  <div class="label">سرپرست جي صحيح</div>
  <div class="line"></div>
</div>

<div class="signatures">
  <div class="sign">
    <div class="sign-line"></div>
    ڪلاس ٽيچر
  </div>
  <div class="sign">
    <div class="sign-line"></div>
    هيڊ ماسٽر
  </div>
</div>

</div>
</body>
</html>
`;

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.end(pdf);

  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;