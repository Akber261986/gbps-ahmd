const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS, mbLeekaShabir } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { data, school } = req.body;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '';

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0', 'MB-Leeka-Shabir-Kumbhar-2.0.ttf')}

@page { size: A4; margin: 10mm; }

body {
    font-family: 'MB Sindhi Web SK 2.0';
    direction: rtl;
    padding: 0;
    margin: 0;
    line-height: 1.6;
    background: #e0e0e0;
    display: flex;
    justify-content: center;
    padding: 20px;
}

.paper {
    background: #f5f0c9;
    border: 6px solid #2c7a4b;
    padding: 30px;
    width: 200mm;
    min-height: 290mm;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    page-break-inside: avoid;
    page-break-after: avoid;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.form-number {
    text-align: right;
    font-size: 16px;
    margin-bottom: 8px;
}

.title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    line-height: 1.4;
}

.school-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    line-height: 1.5;
}

.school-info div {
    margin-bottom: 8px;
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 8px;
    font-size: 18px;
    min-height: 30px;
    line-height: 1.5;
    position: relative;
}

.number {
    display: inline-block;
    width: 28px;
    vertical-align: bottom;
}

.label {
    display: inline-block;
    white-space: nowrap;
    line-height: 1.5;
    vertical-align: bottom;
}

.line {
    display: inline-block;
    width: calc(100% - 250px);
    border-bottom: 1px solid #000;
    margin: 0 14px 4px 14px;
    text-align: center;
    font-size: 20px;
    line-height: 1.8;
    vertical-align: bottom;
}

.row.two-fields .line {
    width: calc(50% - 150px);
}

.declaration {
    margin-top: 20px;
    margin-right: 8px;
    font-size: 11px;
}

.signatures {
    margin-top: 25px;
    display: flex;
    justify-content: space-between;
}

.sign {
    text-align: center;
    width: 40%;
    font-size: 13px;
}

.sign-line {
    border-top: 1px solid #000;
    margin-bottom: 5px;
}
</style>
</head>


<body>

    <div class="paper">

        <div class="title">اسڪول ڇڏڻ جو سرٽيفڪيٽ</div>

        <div class="center"><b>${school?.school_name || ''}</b></div>
        <div class="center">سيمس ڪوڊ: ${school?.semis_code || ''}</div>

        <div class="row">
            <div>
                <div class="number">1.</div>
                <div class="label">GR نمبر</div>
            </div>
            <div class="line">${data.gr_number}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">2.</div>
                <div class="label">شاگرد</div>
            </div>
            <div class="line">${data.student_name}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">3.</div>
                <div class="label">والد</div>
            </div>
            <div class="line">${data.father_name}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">4.</div>
                <div class="label">قوم</div>
            </div>
            <div class="line">${data.qom}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">5.</div>
                <div class="label">ذات</div>
            </div>
            <div class="line">${data.caste}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">6.</div>
                <div class="label">پيدائش جاءِ</div>
            </div>
            <div class="line">${data.place_of_birth}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">7.</div>
                <div class="label">پيدائش تاريخ</div>
            </div>
            <div class="line">${formatDate(data.date_of_birth)}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">8.</div>
                <div class="label">پيدائش لفظن ۾</div>
            </div>
            <div class="line">${data.date_of_birth_in_letter}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">9.</div>
                <div class="label">داخلا تاريخ</div>
            </div>
            <div class="line">${formatDate(data.admission_date)}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">10.</div>
                <div class="label">ڇڏڻ تاريخ</div>
            </div>
            <div class="line">${formatDate(data.leaving_date)}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">11.</div>
                <div class="label">ڇڏڻ وقت ڪلاس</div>
            </div>
            <div class="line">${data.class_on_leaving}</div>
        </div>
        <div class="row">
            <div>
                <div class="number">12.</div>
                <div class="label">سبب</div>
            </div>
            <div class="line">${data.reason_for_leaving}</div>
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