# Deploy PDF Service to Hugging Face Spaces

## Step-by-Step Deployment Guide

### Step 1: Create Hugging Face Account
1. Go to https://huggingface.co/join
2. Sign up (free, no credit card required)
3. Verify your email

### Step 2: Create a New Space
1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Configure:
   - **Space name:** `pdf-service` (or any name you prefer)
   - **License:** MIT
   - **Select the Space SDK:** Docker
   - **Space hardware:** CPU basic (free)
   - **Visibility:** Public (or Private if you prefer)
4. Click "Create Space"

### Step 3: Upload Your Code

#### Option A: Using Git (Recommended)

1. Clone your new space:
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/pdf-service
cd pdf-service
```

2. Copy all files from this pdf-service directory:
```bash
# From your project root
cp -r pdf-service/* path/to/cloned/pdf-service/
```

3. Push to Hugging Face:
```bash
cd path/to/cloned/pdf-service
git add .
git commit -m "Initial PDF service deployment"
git push
```

#### Option B: Using Web Interface

1. In your Space page, click "Files" tab
2. Click "Add file" → "Upload files"
3. Upload all files from the `pdf-service` directory:
   - `Dockerfile`
   - `package.json`
   - `src/` folder (all files)
   - `.gitignore`
4. Click "Commit changes to main"

### Step 4: Wait for Build

1. Hugging Face will automatically build your Docker container
2. Check the "Logs" tab to see build progress
3. Build takes 5-10 minutes (first time)
4. When done, you'll see "Running" status

### Step 5: Get Your Service URL

Your PDF service will be available at:
```
https://YOUR_USERNAME-pdf-service.hf.space
```

Example: `https://akber261986-pdf-service.hf.space`

### Step 6: Test Your Service

Test the health endpoint:
```bash
curl https://YOUR_USERNAME-pdf-service.hf.space/
```

You should see:
```json
{
  "status": "ok",
  "service": "PDF Generation Service",
  "version": "1.0.0",
  "endpoints": [...]
}
```

Test PDF generation:
```bash
curl -X POST https://YOUR_USERNAME-pdf-service.hf.space/pdf/generic \
  -H "Content-Type: application/json" \
  -d '{"html":"<html><body><h1>Test</h1></body></html>"}' \
  --output test.pdf
```

### Step 7: Update Your Next.js Frontend

Add environment variable in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `PDF_SERVICE_URL`
   - **Value:** `https://YOUR_USERNAME-pdf-service.hf.space`
   - **Environments:** Production, Preview, Development
3. Click "Save"
4. Redeploy your frontend

### Step 8: Update Next.js API Routes

Update your Next.js API routes to call the Hugging Face service.

Example: `frontend/src/app/api/pdf/admission-form/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:7860';

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

    // Call PDF service on Hugging Face
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

---

## Troubleshooting

### Build fails
- Check "Logs" tab in Hugging Face Space
- Ensure Dockerfile is in root directory
- Verify all dependencies in package.json

### Service not responding
- Check if Space is "Running" (not "Building" or "Stopped")
- Wait 1-2 minutes after build completes
- Check logs for errors

### PDF generation fails
- Test locally first: `npm start` in pdf-service directory
- Verify request body format matches API docs
- Check Hugging Face Space logs

### CORS errors
- CORS is already enabled in the service
- If issues persist, check browser console for details

---

## Updating Your Service

To update the service after making changes:

```bash
cd path/to/cloned/pdf-service
# Make your changes
git add .
git commit -m "Update service"
git push
```

Hugging Face will automatically rebuild and redeploy.

---

## Monitoring

- **Logs:** Check Space → Logs tab
- **Status:** Space shows "Running" when healthy
- **Usage:** Free tier has no strict limits for CPU spaces

---

## Cost

- ✅ **100% Free** - No credit card required
- ✅ CPU basic tier is free forever
- ✅ No usage limits for reasonable traffic
- ✅ Always-on (doesn't spin down)

---

## Support

If you encounter issues:
1. Check Hugging Face Space logs
2. Test locally first (`npm start`)
3. Verify Dockerfile is correct
4. Check Hugging Face status page

---

## Alternative: Hugging Face with Git LFS

If your space is large, you may need Git LFS:

```bash
git lfs install
git lfs track "*.pdf"
git add .gitattributes
git commit -m "Add Git LFS"
git push
```

But for this PDF service, regular git is sufficient.
