// Test examples for PDF service endpoints
// Run these after starting the server with: npm start

const PDF_SERVICE_URL = 'http://localhost:3001';

// Example 1: Test admission form PDF
async function testAdmissionForm() {
  const response = await fetch(`${PDF_SERVICE_URL}/pdf/admission-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student: {
        gr_number: '123',
        name: 'احمد علي',
        father_name: 'علي محمد',
        admission_date: '2024-01-15',
        date_of_birth: '2010-05-20',
        date_of_birth_in_letter: 'ويهه مئي ٻه هزار ڏهه',
        qom: 'سنڌي',
        caste: 'راجپوت',
        guardian_name: 'علي محمد',
        relation_with_guardian: 'پيءُ',
        guardian_occupation: 'زميندار',
        place_of_birth: 'حيدرآباد',
        previous_school: 'گورنمينٽ پرائمري اسڪول',
        admission_class_id: 1
      },
      school: {
        school_name: 'گورنمينٽ بوائز پرائمري اسڪول',
        semis_code: '12345'
      },
      classes: [
        { id: 1, name: 'ڪلاس 1' },
        { id: 2, name: 'ڪلاس 2' }
      ]
    })
  });

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const fs = require('fs');
    fs.writeFileSync('test-admission-form.pdf', Buffer.from(buffer));
    console.log('✅ Admission form PDF generated: test-admission-form.pdf');
  } else {
    console.error('❌ Failed:', await response.text());
  }
}

// Example 2: Test GR register PDF
async function testGR() {
  const response = await fetch(`${PDF_SERVICE_URL}/pdf/gr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      students: [
        {
          gr_number: '101',
          name: 'احمد علي',
          father_name: 'علي محمد',
          place_of_birth: 'حيدرآباد',
          date_of_birth: '2010-05-20',
          date_of_birth_words: 'ويهه مئي ٻه هزار ڏهه',
          religion: 'اسلام',
          caste: 'راجپوت',
          previous_school: 'گورنمينٽ پرائمري اسڪول',
          admission_class_id: 1,
          admission_date: '2024-01-15'
        },
        {
          gr_number: '102',
          name: 'فاطمه بي بي',
          father_name: 'محمد حسن',
          place_of_birth: 'ڪراچي',
          date_of_birth: '2011-03-10',
          date_of_birth_words: 'ڏهه مارچ ٻه هزار يارهن',
          religion: 'اسلام',
          caste: 'سيد',
          previous_school: '',
          admission_class_id: 1,
          admission_date: '2024-01-15'
        }
      ],
      classes: [
        { id: 1, name: 'ڪلاس 1' },
        { id: 2, name: 'ڪلاس 2' }
      ],
      school: {
        school_name: 'گورنمينٽ بوائز پرائمري اسڪول',
        semis_code: '12345'
      }
    })
  });

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const fs = require('fs');
    fs.writeFileSync('test-gr.pdf', Buffer.from(buffer));
    console.log('✅ GR register PDF generated: test-gr.pdf');
  } else {
    console.error('❌ Failed:', await response.text());
  }
}

// Example 3: Test leaving certificate PDF
async function testLeavingCertificate() {
  const response = await fetch(`${PDF_SERVICE_URL}/pdf/leaving-certificate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        gr_number: '123',
        student_name: 'احمد علي',
        father_name: 'علي محمد',
        qom: 'سنڌي',
        caste: 'راجپوت',
        place_of_birth: 'حيدرآباد',
        date_of_birth: '2010-05-20',
        date_of_birth_in_letter: 'ويهه مئي ٻه هزار ڏهه',
        admission_date: '2024-01-15',
        previous_school: 'گورنمينٽ پرائمري اسڪول',
        gr_of_previous_school: '100',
        leaving_date: '2024-12-20',
        class_on_leaving: 'ڪلاس 5',
        reason_for_leaving: 'منتقلي',
        educational_ability: 'سٺو',
        character: 'سٺو',
        remarks: ''
      },
      school: {
        school_name: 'گورنمينٽ بوائز پرائمري اسڪول',
        semis_code: '12345'
      }
    })
  });

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const fs = require('fs');
    fs.writeFileSync('test-leaving-certificate.pdf', Buffer.from(buffer));
    console.log('✅ Leaving certificate PDF generated: test-leaving-certificate.pdf');
  } else {
    console.error('❌ Failed:', await response.text());
  }
}

// Example 4: Test generic PDF from HTML
async function testGenericHTML() {
  const response = await fetch(`${PDF_SERVICE_URL}/pdf/generic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: sans-serif; padding: 20px; direction: rtl; }
            h1 { color: #2c7a4b; text-align: center; }
          </style>
        </head>
        <body>
          <h1>ٽيسٽ دستاويز</h1>
          <p>هي هڪ ٽيسٽ PDF آهي جيڪو HTML مان ٺاهيو ويو آهي.</p>
        </body>
        </html>
      `
    })
  });

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const fs = require('fs');
    fs.writeFileSync('test-generic.pdf', Buffer.from(buffer));
    console.log('✅ Generic PDF generated: test-generic.pdf');
  } else {
    console.error('❌ Failed:', await response.text());
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting PDF service tests...\n');

  try {
    await testAdmissionForm();
    await testGR();
    await testLeavingCertificate();
    await testGenericHTML();
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run tests
runAllTests();
