# Image Upload Issue & Solutions

## 🚨 Current Status

**Image uploads are DISABLED in production (Vercel deployment)**

### Why?

Vercel's serverless environment has a **read-only file system**. The backend cannot create directories or save files to disk, which causes the following error:

```
OSError: [Errno 30] Read-only file system: 'uploads'
```

### What's Affected?

- ✅ **Working**: All core features (students, classes, results, certificates, etc.)
- ❌ **Not Working**:
  - Profile picture uploads
  - School logo uploads
  - Any file upload functionality

---

## 🔧 Solutions

### Option 1: AWS S3 (Recommended for Production)

**Best for**: Production deployments, scalability, reliability

#### Pros:
- Industry standard
- Highly reliable and scalable
- Excellent Python SDK (boto3)
- Very cheap (~$0.023 per GB/month)
- Works with any deployment platform

#### Cons:
- Requires AWS account setup
- Slightly more complex configuration

#### Implementation Steps:

1. **Create AWS Account & S3 Bucket**
   - Go to https://aws.amazon.com/s3/
   - Create a new bucket (e.g., `gbps-ahmd-uploads`)
   - Set bucket to public read access for images
   - Note your bucket name and region

2. **Install boto3**
   ```bash
   cd backend
   uv add boto3
   ```

3. **Add Environment Variables to Vercel**
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=gbps-ahmd-uploads
   AWS_REGION=us-east-1
   ```

4. **Update backend/main.py**
   ```python
   import boto3
   from botocore.exceptions import ClientError

   # Initialize S3 client
   s3_client = boto3.client(
       's3',
       aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
       aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
       region_name=os.getenv('AWS_REGION', 'us-east-1')
   )

   def save_upload_file(upload_file: UploadFile, directory: str) -> str:
       """Save uploaded file to S3 and return the URL."""
       # Validate file extension
       file_ext = Path(upload_file.filename).suffix.lower()
       if file_ext not in ALLOWED_EXTENSIONS:
           raise HTTPException(
               status_code=status.HTTP_400_BAD_REQUEST,
               detail=f"File type {file_ext} not allowed"
           )

       # Generate unique filename
       unique_filename = f"{directory}/{uuid.uuid4()}{file_ext}"
       bucket_name = os.getenv('AWS_S3_BUCKET_NAME')

       try:
           # Upload to S3
           s3_client.upload_fileobj(
               upload_file.file,
               bucket_name,
               unique_filename,
               ExtraArgs={'ContentType': upload_file.content_type}
           )

           # Return public URL
           return f"https://{bucket_name}.s3.amazonaws.com/{unique_filename}"
       except ClientError as e:
           raise HTTPException(
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
               detail=f"Failed to upload file: {str(e)}"
           )
   ```

5. **Update file upload endpoints**
   - Replace local file saving with S3 upload
   - Store S3 URLs in database instead of local paths

---

### Option 2: Cloudinary (Easiest for Images)

**Best for**: Quick setup, image-focused applications

#### Pros:
- Free tier: 25GB storage, 25GB bandwidth/month
- Optimized for images (automatic resizing, optimization)
- Very easy to set up
- Built-in CDN
- Image transformations on-the-fly

#### Cons:
- Limited to images/videos
- Free tier limits

#### Implementation Steps:

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com/
   - Sign up for free account
   - Note your Cloud Name, API Key, and API Secret

2. **Install Cloudinary SDK**
   ```bash
   cd backend
   uv add cloudinary
   ```

3. **Add Environment Variables to Vercel**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Update backend/main.py**
   ```python
   import cloudinary
   import cloudinary.uploader

   # Configure Cloudinary
   cloudinary.config(
       cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
       api_key=os.getenv('CLOUDINARY_API_KEY'),
       api_secret=os.getenv('CLOUDINARY_API_SECRET')
   )

   def save_upload_file(upload_file: UploadFile, directory: str) -> str:
       """Save uploaded file to Cloudinary and return the URL."""
       # Validate file extension
       file_ext = Path(upload_file.filename).suffix.lower()
       if file_ext not in ALLOWED_EXTENSIONS:
           raise HTTPException(
               status_code=status.HTTP_400_BAD_REQUEST,
               detail=f"File type {file_ext} not allowed"
           )

       try:
           # Upload to Cloudinary
           result = cloudinary.uploader.upload(
               upload_file.file,
               folder=directory,
               resource_type="auto"
           )

           # Return secure URL
           return result['secure_url']
       except Exception as e:
           raise HTTPException(
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
               detail=f"Failed to upload file: {str(e)}"
           )
   ```

---

### Option 3: Vercel Blob Storage

**Best for**: If you want to stay within Vercel ecosystem

#### Pros:
- Integrated with Vercel
- Simple setup
- Good for Vercel deployments

#### Cons:
- Requires Node.js/JavaScript (not ideal for Python backend)
- Would need to create separate Next.js API routes for uploads
- More complex architecture

#### Implementation Steps:

1. **Install Vercel Blob in Frontend**
   ```bash
   cd frontend
   npm install @vercel/blob
   ```

2. **Create Next.js API Route for Uploads**
   ```typescript
   // frontend/src/app/api/upload/route.ts
   import { put } from '@vercel/blob';
   import { NextResponse } from 'next/server';

   export async function POST(request: Request) {
     const { searchParams } = new URL(request.url);
     const filename = searchParams.get('filename');

     const blob = await put(filename!, request.body!, {
       access: 'public',
     });

     return NextResponse.json(blob);
   }
   ```

3. **Update Frontend Upload Logic**
   - Upload files to Next.js API route instead of backend
   - Store blob URLs in database via backend API

---

### Option 4: Database Storage (Quick Fix - Not Recommended)

**Best for**: Testing only, not production

#### Pros:
- No external service needed
- Works immediately
- Simple implementation

#### Cons:
- Increases database size significantly
- Slower performance
- Not scalable
- Database backups become huge

#### Implementation Steps:

1. **Update Database Schema**
   ```python
   # Add BYTEA column for image data
   profile_image_data = Column(LargeBinary, nullable=True)
   ```

2. **Store Base64 Encoded Images**
   ```python
   import base64

   def save_upload_file(upload_file: UploadFile, directory: str) -> str:
       """Save uploaded file as base64 in database."""
       file_data = upload_file.file.read()
       base64_data = base64.b64encode(file_data).decode('utf-8')

       # Store base64_data in database
       # Return data URL
       return f"data:{upload_file.content_type};base64,{base64_data}"
   ```

---

## 📋 Comparison Table

| Solution | Setup Difficulty | Cost | Scalability | Best For |
|----------|-----------------|------|-------------|----------|
| **AWS S3** | Medium | Very Low | Excellent | Production |
| **Cloudinary** | Easy | Free tier | Good | Images only |
| **Vercel Blob** | Medium | Pay-as-you-go | Good | Vercel ecosystem |
| **Database** | Easy | Free | Poor | Testing only |

---

## 🎯 Recommended Approach

### For Production:
**Use AWS S3** - Most reliable, scalable, and cost-effective

### For Quick Testing:
**Use Cloudinary** - Easiest to set up, free tier is generous

### For MVP/Demo:
**Keep uploads disabled** - Core functionality works fine without it

---

## 🔄 Migration Steps (When Ready)

1. **Choose a solution** from above
2. **Set up the cloud storage service** (AWS/Cloudinary/etc.)
3. **Add environment variables** to Vercel backend
4. **Update `save_upload_file()` function** in `backend/main.py`
5. **Test locally** with new storage
6. **Deploy to Vercel**
7. **Test uploads** on production
8. **Update frontend** if needed (for direct uploads)

---

## 📝 Current Code Location

**File**: `backend/main.py`
**Lines**: 85-92 (save_upload_file function)

```python
def save_upload_file(upload_file: UploadFile, directory: str) -> str:
    """Save uploaded file and return the file path."""
    if IS_SERVERLESS:
        # In serverless environment, file uploads are not supported without cloud storage
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="File uploads require cloud storage configuration in serverless environment"
        )
```

**Replace this function** with one of the implementations above.

---

## 🐛 Testing Checklist

After implementing cloud storage:

- [ ] Profile picture upload works
- [ ] School logo upload works
- [ ] Images display correctly
- [ ] Old local URLs (if any) are migrated
- [ ] File size limits are enforced
- [ ] File type validation works
- [ ] Error handling is proper
- [ ] Images are publicly accessible
- [ ] CORS is configured correctly (if needed)

---

## 📞 Support Resources

- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/
- **Cloudinary Documentation**: https://cloudinary.com/documentation
- **Vercel Blob Documentation**: https://vercel.com/docs/storage/vercel-blob
- **boto3 Documentation**: https://boto3.amazonaws.com/v1/documentation/api/latest/index.html

---

**Last Updated**: March 17, 2026
**Status**: Uploads disabled in production, awaiting cloud storage implementation
