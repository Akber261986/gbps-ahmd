from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import School, Student
from auth import get_current_user
from cloudinary_config import upload_image, delete_image
import re

router = APIRouter()

# Allowed image types
ALLOWED_EXTENSIONS = {'image/jpeg', 'image/jpg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile):
    """Validate image file type and size"""
    if file.content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )

    # Read file to check size
    file_content = file.file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit."
        )

    # Reset file pointer
    file.file.seek(0)
    return file_content

@router.post("/upload/school-logo")
async def upload_school_logo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload school logo"""

    # Get user's school
    school = db.query(School).filter(School.id == current_user["school_id"]).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    # Validate image
    file_content = validate_image(file)

    try:
        # Delete old logo if exists
        if school.logo_url:
            # Extract public_id from URL
            old_public_id = extract_public_id(school.logo_url)
            if old_public_id:
                delete_image(old_public_id)

        # Upload new logo
        result = upload_image(
            file_content=file_content,
            folder="school_logos",
            public_id=f"school_{school.id}_logo"
        )

        # Update school record
        school.logo_url = result["url"]
        db.commit()
        db.refresh(school)

        return {
            "message": "School logo uploaded successfully",
            "logo_url": school.logo_url
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload/student-photo/{student_id}")
async def upload_student_photo(
    student_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload student profile picture"""

    # Get student
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user["school_id"]
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate image
    file_content = validate_image(file)

    try:
        # Delete old photo if exists
        if student.profile_picture_url:
            old_public_id = extract_public_id(student.profile_picture_url)
            if old_public_id:
                delete_image(old_public_id)

        # Upload new photo
        result = upload_image(
            file_content=file_content,
            folder="student_photos",
            public_id=f"student_{student.id}_photo"
        )

        # Update student record
        student.profile_picture_url = result["url"]
        db.commit()
        db.refresh(student)

        return {
            "message": "Student photo uploaded successfully",
            "profile_picture_url": student.profile_picture_url
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/school-logo")
async def delete_school_logo(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete school logo"""

    school = db.query(School).filter(School.id == current_user["school_id"]).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    if not school.logo_url:
        raise HTTPException(status_code=404, detail="No logo to delete")

    try:
        # Delete from Cloudinary
        public_id = extract_public_id(school.logo_url)
        if public_id:
            delete_image(public_id)

        # Update database
        school.logo_url = None
        db.commit()

        return {"message": "School logo deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/student-photo/{student_id}")
async def delete_student_photo(
    student_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete student profile picture"""

    student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user["school_id"]
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not student.profile_picture_url:
        raise HTTPException(status_code=404, detail="No photo to delete")

    try:
        # Delete from Cloudinary
        public_id = extract_public_id(student.profile_picture_url)
        if public_id:
            delete_image(public_id)

        # Update database
        student.profile_picture_url = None
        db.commit()

        return {"message": "Student photo deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def extract_public_id(url: str) -> str:
    """Extract Cloudinary public_id from URL"""
    # Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    match = re.search(r'/upload/(?:v\d+/)?(.+)\.\w+$', url)
    if match:
        return match.group(1)
    return None
