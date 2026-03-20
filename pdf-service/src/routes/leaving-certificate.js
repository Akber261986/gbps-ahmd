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
  margin: 0;
  font-size: 14px;
}

.paper {
  width: 190mm;
  min-height: 277mm;
  margin: auto;
  border: 3px solid #2c7a4b;
  padding: 10mm;
  background: #f5f0c9;
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 4mm;
  font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';
}

.center {
  text-align: center;
  margin-bottom: 2mm;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5mm 0;
}

.number { width: 10mm; }
.label { width: 80mm; }
.line {
  flex: 1;
  border-bottom: 1px solid black;
  text-align: center;
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