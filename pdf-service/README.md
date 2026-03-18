# PDF Generation Service

Standalone Node.js service for generating PDFs using Puppeteer. This service handles all PDF generation for the GBPS School Management System.

## Why a Separate Service?

Vercel's serverless environment has limitations with Puppeteer (missing system libraries, cold starts, timeouts). This dedicated service runs on a traditional server environment where Puppeteer works perfectly.

## Features

- ✅ Generates PDFs from HTML templates
- ✅ Supports Sindhi/Urdu RTL text
- ✅ Maintains exact design from original templates
- ✅ No timeout issues
- ✅ Works reliably on Railway/Render/DigitalOcean

## API Endpoints

### 1. POST /pdf/admission-form
Generate admission form PDF.

**Request Body:**
```json
{
  "student": {
    "gr_number": "123",
    "name": "Student Name",
    "father_name": "Father Name",
    "admission_date": "2024-01-01",
    "date_of_birth": "2010-01-01",
    ...
  },
  "school": {
    "school_name": "School Name",
    "semis_code": "12345"
  },
  "classes": [
    { "id": 1, "name": "Class 1" }
  ]
}
```

**Response:** PDF file (application/pdf)

---

### 2. POST /pdf/gr
Generate GR register PDF.

**Request Body:**
```json
{
  "students": [
    {
      "gr_number": "123",
      "name": "Student Name",
      ...
    }
  ],
  "classes": [
    { "id": 1, "name": "Class 1" }
  ],
  "school": {
    "school_name": "School Name",
    "semis_code": "12345"
  }
}
```

**Response:** PDF file (application/pdf)

---

### 3. POST /pdf/leaving-certificate
Generate leaving certificate PDF.

**Request Body:**
```json
{
  "data": {
    "gr_number": "123",
    "student_name": "Student Name",
    "father_name": "Father Name",
    ...
  },
  "school": {
    "school_name": "School Name",
    "semis_code": "12345"
  }
}
```

**Response:** PDF file (application/pdf)

---

### 4. POST /pdf/resultsheet
Generate result sheet PDF.

**Request Body:**
```json
{
  "students": [...],
  "classes": [...],
  "school": {...}
}
```

**Response:** PDF file (application/pdf)

---

### 5. POST /pdf/generic
Generate PDF from URL or HTML.

**Request Body (URL):**
```json
{
  "url": "https://example.com/page"
}
```

**Request Body (HTML):**
```json
{
  "html": "<html><body>Content</body></html>"
}
```

**Response:** PDF file (application/pdf)

---

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup

1. Install dependencies:
```bash
cd pdf-service
npm install
```

2. Start the server:
```bash
npm start
```

The service will run on `http://localhost:3001`

### Test the Service

```bash
# Test health check
curl http://localhost:3001/

# Test PDF generation
curl -X POST http://localhost:3001/pdf/admission-form \
  -H "Content-Type: application/json" \
  -d '{"student": {...}, "school": {...}, "classes": [...]}' \
  --output test.pdf
```

---

## Deploy to Railway (Recommended - Free Tier)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. You get $5 free credit per month (enough for 500+ hours)

### Step 2: Deploy from GitHub

1. Push this `pdf-service` folder to your GitHub repository:
```bash
cd pdf-service
git init
git add .
git commit -m "Initial PDF service"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. In Railway dashboard:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy

3. Get your service URL:
   - Click on your deployment
   - Go to "Settings" → "Domains"
   - Click "Generate Domain"
   - You'll get: `https://your-service.railway.app`

### Step 3: Configure Environment (Optional)
If needed, add environment variables in Railway:
- Go to "Variables" tab
- Add: `NODE_ENV=production`

---

## Deploy to Render (Alternative - Free Tier)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** pdf-service
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Click "Create Web Service"
7. Get your URL: `https://pdf-service.onrender.com`

---

## Update Next.js Frontend

After deploying, update your Next.js API routes to call this service.

### Option 1: Proxy Through Next.js (Recommended)

Keep your existing Next.js API routes, but change them to proxy to the PDF service:

**Example: `frontend/src/app/api/pdf/admission-form/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    const authHeader = req.headers.get("authorization") || "";

    // Fetch data from your backend
    const [studentRes, schoolRes, classesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/my-school`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        headers: { Authorization: authHeader },
      }),
    ]);

    const student = await studentRes.json();
    const school = schoolRes.ok ? await schoolRes.json() : {};
    const classes = classesRes.ok ? await classesRes.json() : [];

    // Call PDF service
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/pdf/admission-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, school, classes })
    });

    if (!pdfResponse.ok) {
      throw new Error('PDF generation failed');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=admission-form.pdf",
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}
```

### Option 2: Call PDF Service Directly from Frontend

Update your frontend to call the PDF service directly (requires CORS to be enabled on PDF service).

---

## Environment Variables

Add to Vercel (for Next.js frontend):

```
PDF_SERVICE_URL=https://your-service.railway.app
```

---

## Troubleshooting

### PDF service not starting
- Check logs: `railway logs` or check Render dashboard
- Ensure Node.js version is 18+
- Verify all dependencies installed

### PDF generation fails
- Check if Puppeteer installed correctly
- Verify request body format matches API docs
- Check service logs for detailed error messages

### Timeout errors
- Railway/Render free tier has no timeout limits (unlike Vercel)
- If still timing out, check your data size

---

## Cost Estimate

### Railway (Recommended)
- **Free tier:** $5 credit/month
- **Usage:** ~500 hours of runtime
- **Cost for school app:** $0/month (well within free tier)

### Render
- **Free tier:** 750 hours/month
- **Limitation:** Spins down after 15 min inactivity (first request takes 30s)
- **Cost:** $0/month

### Upgrade if needed
- Railway: $5/month for always-on
- Render: $7/month for always-on

---

## Monitoring

### Railway
- View logs: Dashboard → Logs tab
- View metrics: Dashboard → Metrics tab

### Render
- View logs: Dashboard → Logs
- View metrics: Dashboard → Metrics

---

## Support

If you encounter issues:
1. Check service logs
2. Verify request format matches API docs
3. Test locally first
4. Check Railway/Render status page

---

## License

MIT
