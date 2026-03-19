const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// POST /pdf/leaving-certificate
router.post('/', async (req, res) => {
  let browser;

  try {
    console.log('=== Leaving Certificate PDF Generation Started ===');

    const { data, school } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Certificate data is required' });
    }

    // Format dates
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB');
    };

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'MB Nargis New', 'MB Khursheed', sans-serif;
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
              <strong>${school?.school_name || '—'}</strong>
            </div>
            <div>
              <span>سيمس ڪوڊ: </span>
              <strong>${school?.semis_code || '—'}</strong>
            </div>
          </div>

          <div class="row">
            <span class="number">1.</span>
            <span class="label">جنرل رجسٽر نمبر</span>
            <span class="line">${data.gr_number || ''}</span>
          </div>

          <div class="row">
            <span class="number">2.</span>
            <span class="label">شاگرد جو نالو</span>
            <span class="line">${data.student_name || ''}</span>
          </div>

          <div class="row">
            <span class="number">3.</span>
            <span class="label">والد جو نالو</span>
            <span class="line">${data.father_name || ''}</span>
          </div>

          <div class="row">
            <span class="number">4.</span>
            <span class="label">قوم</span>
            <span class="line">${data.qom || ''}</span>

            <span class="number">5.</span>
            <span class="label">ذات</span>
            <span class="line">${data.caste || ''}</span>
          </div>

          <div class="row">
            <span class="number">6.</span>
            <span class="label">پيدائش جي جاءِ</span>
            <span class="line">${data.place_of_birth || ''}</span>
          </div>

          <div class="row">
            <span class="number">7.</span>
            <span class="label">ڄمڻ جي تاريخ</span>
            <span class="line">${formatDate(data.date_of_birth)}</span>
          </div>

          <div class="row">
            <span class="number">8.</span>
            <span class="label">ڄمڻ جي تاريخ (لفظن ۾)</span>
            <span class="line">${data.date_of_birth_in_letter || ''}</span>
          </div>

          <div class="row">
            <span class="number">9.</span>
            <span class="label">داخلا جي تاريخ</span>
            <span class="line">${formatDate(data.admission_date)}</span>
          </div>

          <div class="row">
            <span class="number">10.</span>
            <span class="label">پويون اسڪول</span>
            <span class="line">${data.previous_school || ''}</span>
          </div>

          <div class="row">
            <span class="number">11.</span>
            <span class="label">اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر</span>
            <span class="line">${data.gr_of_previous_school || ''}</span>
          </div>

          <div class="row">
            <span class="number">12.</span>
            <span class="label">اسڪول ڇڏڻ جي تاريخ</span>
            <span class="line">${formatDate(data.leaving_date)}</span>
          </div>

          <div class="row">
            <span class="number">13.</span>
            <span class="label">اسڪول ڇڏڻ وقت ڪلاس</span>
            <span class="line">${data.class_on_leaving || ''}</span>
          </div>

          <div class="row">
            <span class="number">14.</span>
            <span class="label">اسڪول ڇڏڻ جو سبب</span>
            <span class="line">${data.reason_for_leaving || ''}</span>
          </div>

          <div class="row">
            <span class="number">15.</span>
            <span class="label">تعليمي قابليت</span>
            <span class="line">${data.educational_ability || ''}</span>
          </div>

          <div class="row">
            <span class="number">16.</span>
            <span class="label">چال چلت</span>
            <span class="line">${data.character || ''}</span>
          </div>

          <div class="row">
            <span class="number">17.</span>
            <span class="label">ريمارڪس</span>
            <span class="line">${data.remarks || ''}</span>
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
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=leaving-certificate-${data.gr_number}.pdf`);
    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('=== Leaving Certificate PDF Generation Error ===');
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
