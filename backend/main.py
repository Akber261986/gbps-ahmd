# main.py
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from pathlib import Path
import uuid
from schema.schemas import (
    StudentCreate, StudentUpdate, StudentOut, ClassCreate, ClassOut,
    SchoolLeavingCertificateCreate, SchoolLeavingCertificateOut,
    GradeCreate, GradeOut, SubjectCreate, SubjectOut, StudentMarksheet,
    UserRegister, UserLogin, UserOut, Token, SchoolCreate, SchoolUpdate, SchoolOut,
    PasswordResetRequest, PasswordResetConfirm, PasswordResetResponse,
    GoogleLoginRequest, GoogleLoginResponse, UserProfileUpdate,
    ChatRequest, ChatResponse
)
from database import SessionLocal, engine, get_db
from typing import List
from models import Base, Student, Class, SchoolLeavingCertificate, Grade, Subject, User, School
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_active_user, require_school
)
from password_reset import (
    create_password_reset_token, verify_reset_token,
    reset_password_with_token, send_password_reset_email
)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import google.generativeai as genai
import os
from datetime import timedelta


Base.metadata.create_all(bind=engine)

# Disable automatic trailing slash redirects to preserve Authorization headers
app = FastAPI(
    title="School Management System - Backend",
    redirect_slashes=False
)

# Allow frontend (Next.js on localhost:3000) to connect
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3001")
# Support both the configured URL and common alternatives
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "profiles").mkdir(exist_ok=True)
(UPLOAD_DIR / "schools").mkdir(exist_ok=True)

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def save_upload_file(upload_file: UploadFile, directory: str) -> str:
    """Save uploaded file and return the file path."""
    # Validate file extension
    file_ext = Path(upload_file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / directory / unique_filename

    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    # Return relative path for URL
    return f"/uploads/{directory}/{unique_filename}"


@app.get("/")
def root():
    return {"message": "School Management System - Arbab Haji Muhammad Dal"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}


# ============ Authentication Endpoints ============

@app.post("/auth/register", response_model=UserOut)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user


@app.put("/auth/profile", response_model=UserOut)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile information."""
    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if email is being changed and if it's already taken
    if profile_data.email and profile_data.email != user.email:
        existing_user = db.query(User).filter(User.email == profile_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        user.email = profile_data.email

    # Update full name if provided
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name

    # Handle password change for non-OAuth users
    if profile_data.new_password:
        # Check if user is OAuth user
        if user.oauth_provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change password for OAuth users"
            )

        # Verify current password
        if not profile_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password"
            )

        if not verify_password(profile_data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        # Update password
        user.hashed_password = get_password_hash(profile_data.new_password)

    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/upload-profile-image")
def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload profile image for current user."""
    # Save the uploaded file
    file_path = save_upload_file(file, "profiles")

    # Update user's profile_image_url
    user = db.query(User).filter(User.id == current_user.id).first()
    user.profile_image_url = file_path
    db.commit()

    return {"profile_image_url": file_path}


# ============ Password Reset Endpoints ============

@app.post("/auth/forgot-password", response_model=PasswordResetResponse)
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request a password reset token."""
    token = create_password_reset_token(request.email, db)

    if not token:
        # Email doesn't exist in database
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address"
        )

    # Send email with reset link
    send_password_reset_email(request.email, token)

    return PasswordResetResponse(
        message="Password reset link has been sent to your email"
    )


@app.post("/auth/reset-password", response_model=PasswordResetResponse)
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using a valid token."""
    success = reset_password_with_token(request.token, request.new_password, db)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    return PasswordResetResponse(message="Password has been reset successfully")


# ============ Google OAuth Endpoints ============

@app.post("/auth/google", response_model=Token)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Login or register using Google OAuth."""
    try:
        # Verify the Google token
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

        if not GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )

        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            request.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Extract user information
        email = idinfo.get('email')
        google_id = idinfo.get('sub')
        full_name = idinfo.get('name')

        if not email or not google_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token"
            )

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if user:
            # User exists - update OAuth info if needed
            if not user.oauth_provider:
                user.oauth_provider = 'google'
                user.oauth_provider_id = google_id
                db.commit()
        else:
            # Create new user with Google OAuth
            user = User(
                email=email,
                full_name=full_name,
                oauth_provider='google',
                oauth_provider_id=google_id,
                is_active=True,
                is_superuser=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})

        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


# ============ School Management Endpoints ============

@app.post("/schools/onboard", response_model=SchoolOut)
@app.post("/schools/onboard/", response_model=SchoolOut)
def onboard_school(
    school_data: SchoolCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Onboard a new school for the current user."""
    # Check if user already has a school
    if current_user.school_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to a school"
        )

    # Check if SEMIS code already exists
    existing_school = db.query(School).filter(School.semis_code == school_data.semis_code).first()
    if existing_school:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SEMIS code already registered"
        )

    # Create new school
    new_school = School(**school_data.dict())
    db.add(new_school)
    db.commit()
    db.refresh(new_school)

    # Create 5 standard classes for government primary schools
    standard_classes = [
        'ڪلاس پھريون',
        'ڪلاس ٻيون',
        'ڪلاس ٽيون',
        'ڪلاس چوٿون',
        'ڪلاس پنجون'
    ]

    for class_name in standard_classes:
        new_class = Class(name=class_name, school_id=new_school.id)
        db.add(new_class)

    db.commit()

    # Associate user with school
    current_user.school_id = new_school.id
    db.commit()
    db.refresh(current_user)

    return new_school


@app.get("/schools/my-school", response_model=SchoolOut)
@app.get("/schools/my-school/", response_model=SchoolOut)
def get_my_school(
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Get the current user's school information."""
    school = db.query(School).filter(School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    return school


@app.put("/schools/my-school", response_model=SchoolOut)
@app.put("/schools/my-school/", response_model=SchoolOut)
def update_my_school(
    school_data: SchoolUpdate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Update the current user's school information."""
    school = db.query(School).filter(School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    # Update only provided fields
    for key, value in school_data.dict(exclude_unset=True).items():
        setattr(school, key, value)

    db.commit()
    db.refresh(school)
    return school


@app.put("/schools/update", response_model=SchoolOut)
@app.put("/schools/update/", response_model=SchoolOut)
def update_school(
    school_data: SchoolUpdate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Update the current user's school information."""
    school = db.query(School).filter(School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    # Update only provided fields
    for key, value in school_data.dict(exclude_unset=True).items():
        setattr(school, key, value)

    db.commit()
    db.refresh(school)
    return school


@app.post("/schools/upload-logo")
def upload_school_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Upload school logo."""
    # Save the uploaded file
    file_path = save_upload_file(file, "schools")

    # Update school's logo_url
    school = db.query(School).filter(School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    school.logo_url = file_path
    db.commit()

    return {"logo_url": file_path}


# ============ Student Management (Multi-tenant) ============

@app.post("/students/", response_model=dict)
def create_student(
    student: StudentCreate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Create a new student (requires authentication and school onboarding)."""
    # Check GR number uniqueness within the school
    if db.query(Student).filter(
        Student.school_id == current_user.school_id,
        Student.gr_number == student.gr_number
    ).first():
        raise HTTPException(400, "GR number already exists in your school")

    # Check admission class exists and belongs to the same school
    admission_class = db.query(Class).filter(
        Class.id == student.admission_class_id,
        Class.school_id == current_user.school_id
    ).first()
    if not admission_class:
        raise HTTPException(404, f"Admission class with id {student.admission_class_id} not found in your school")

    # Check current class if provided
    if student.current_class_id:
        current_class = db.query(Class).filter(
            Class.id == student.current_class_id,
            Class.school_id == current_user.school_id
        ).first()
        if not current_class:
            raise HTTPException(404, f"Current class with id {student.current_class_id} not found in your school")

    age = None
    if student.date_of_birth and student.admission_date:
        delta = student.admission_date - student.date_of_birth
        age = delta.days // 365

    # Schema has "address", model has "current_address"; use only model columns
    data = student.dict()
    data["current_address"] = data.pop("address", None)
    data["admission_age_years"] = age
    data["school_id"] = current_user.school_id  # Set school_id from current user

    # Set class_id for backward compatibility
    if not data.get("class_id"):
        data["class_id"] = student.admission_class_id

    model_keys = {c.key for c in Student.__table__.columns}
    data = {k: v for k, v in data.items() if k in model_keys}
    db_student = Student(**data)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    return {
        "id": db_student.id,
        "gr_number": db_student.gr_number,
        "name": db_student.name,
        "message": "Student enrolled successfully"
    }


@app.post("/students/batch", response_model=dict)
def batch_create_students(
    batch_data: dict,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """
    Batch upload multiple students at once (offline mode support).
    Accepts a list of students and processes them all.
    Returns success/failure counts and details.
    """
    students_data = batch_data.get("students", [])

    if not students_data:
        raise HTTPException(400, "No students provided")

    success_count = 0
    failed_count = 0
    errors = []
    created_students = []

    for idx, student_dict in enumerate(students_data):
        try:
            # Validate student data
            student = StudentCreate(**student_dict)

            # Check GR number uniqueness within the school
            if db.query(Student).filter(
                Student.school_id == current_user.school_id,
                Student.gr_number == student.gr_number
            ).first():
                errors.append({
                    "index": idx,
                    "gr_number": student.gr_number,
                    "name": student.name,
                    "error": "GR number already exists in your school"
                })
                failed_count += 1
                continue

            # Check admission class exists
            admission_class = db.query(Class).filter(
                Class.id == student.admission_class_id,
                Class.school_id == current_user.school_id
            ).first()
            if not admission_class:
                errors.append({
                    "index": idx,
                    "gr_number": student.gr_number,
                    "name": student.name,
                    "error": f"Admission class with id {student.admission_class_id} not found"
                })
                failed_count += 1
                continue

            # Check current class if provided
            if student.current_class_id:
                current_class = db.query(Class).filter(
                    Class.id == student.current_class_id,
                    Class.school_id == current_user.school_id
                ).first()
                if not current_class:
                    errors.append({
                        "index": idx,
                        "gr_number": student.gr_number,
                        "name": student.name,
                        "error": f"Current class with id {student.current_class_id} not found"
                    })
                    failed_count += 1
                    continue

            # Calculate age
            age = None
            if student.date_of_birth and student.admission_date:
                delta = student.admission_date - student.date_of_birth
                age = delta.days // 365

            # Prepare data
            data = student.dict()
            data["current_address"] = data.pop("address", None)
            data["admission_age_years"] = age
            data["school_id"] = current_user.school_id

            # Set class_id for backward compatibility
            if not data.get("class_id"):
                data["class_id"] = student.admission_class_id

            model_keys = {c.key for c in Student.__table__.columns}
            data = {k: v for k, v in data.items() if k in model_keys}

            # Create student
            db_student = Student(**data)
            db.add(db_student)
            db.flush()  # Flush to get the ID without committing

            created_students.append({
                "id": db_student.id,
                "gr_number": db_student.gr_number,
                "name": db_student.name
            })
            success_count += 1

        except Exception as e:
            errors.append({
                "index": idx,
                "gr_number": student_dict.get("gr_number", "Unknown"),
                "name": student_dict.get("name", "Unknown"),
                "error": str(e)
            })
            failed_count += 1

    # Commit all successful students
    if success_count > 0:
        db.commit()

    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "total": len(students_data),
        "errors": errors,
        "created_students": created_students,
        "message": f"Successfully created {success_count} students, {failed_count} failed"
    }


@app.post("/classes/")
def add_class(
    class_data: ClassCreate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Create a new class (requires authentication and school onboarding)."""
    # Check if class name already exists in this school
    if db.query(Class).filter(
        Class.school_id == current_user.school_id,
        Class.name == class_data.name
    ).first():
        raise HTTPException(400, "Class with this name already exists in your school")

    db_class = Class(
        name=class_data.name,
        school_id=current_user.school_id
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return {"id": db_class.id, "name": db_class.name, "message": "Class added successfully"}


@app.get("/classes/", response_model=List[ClassOut])
@app.get("/classes", response_model=List[ClassOut])
def list_classes(
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """List all classes for the current user's school."""
    return db.query(Class).filter(
        Class.school_id == current_user.school_id
    ).order_by(Class.id).all()


@app.get("/students/", response_model=List[StudentOut])
@app.get("/students", response_model=List[StudentOut])
def get_students(
    class_id: Optional[int] = None,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """List all students for the current user's school."""
    query = db.query(Student).filter(Student.school_id == current_user.school_id)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    return query.order_by(Student.gr_number).all()


@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Get a specific student (must belong to current user's school)."""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


# --- Strategy 2: اسٽوڊنٽ ڊيٽا اپڊيٽ (Update existing) ---

@app.put("/students/{student_id}", response_model=dict)
def update_student(
    student_id: int,
    student: StudentUpdate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Update an existing student (must belong to current user's school)."""
    db_student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    # GR: Check uniqueness within school, excluding current student
    existing = db.query(Student).filter(
        Student.school_id == current_user.school_id,
        Student.gr_number == student.gr_number,
        Student.id != student_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="GR number already exists")

    # Validate admission_class_id exists and belongs to same school
    admission_class = db.query(Class).filter(
        Class.id == student.admission_class_id,
        Class.school_id == current_user.school_id
    ).first()
    if not admission_class:
        raise HTTPException(status_code=404, detail=f"Admission class with id {student.admission_class_id} not found")

    # Validate current_class_id if provided
    if student.current_class_id:
        current_class = db.query(Class).filter(
            Class.id == student.current_class_id,
            Class.school_id == current_user.school_id
        ).first()
        if not current_class:
            raise HTTPException(status_code=404, detail=f"Current class with id {student.current_class_id} not found")

    # Build update dict
    age = None
    if student.date_of_birth and student.admission_date:
        delta = student.admission_date - student.date_of_birth
        age = delta.days // 365

    update_data = student.dict()
    update_data["current_address"] = update_data.pop("address", None)
    update_data["admission_age_years"] = age
    model_keys = {c.key for c in Student.__table__.columns}
    for key in list(update_data.keys()):
        if key not in model_keys:
            del update_data[key]

    for key, value in update_data.items():
        setattr(db_student, key, value)

    db.commit()
    db.refresh(db_student)
    return {
        "id": db_student.id,
        "gr_number": db_student.gr_number,
        "name": db_student.name,
        "message": "Student updated successfully"
    }


@app.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Delete a student (must belong to current user's school)."""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Delete associated leaving certificate if exists
    leaving_cert = db.query(SchoolLeavingCertificate).filter(
        SchoolLeavingCertificate.student_id == student_id
    ).first()
    if leaving_cert:
        db.delete(leaving_cert)

    db.delete(student)
    db.commit()
    return {"message": "Student and associated leaving certificate (if any) deleted successfully"}


# ============ School Leaving Certificate Endpoints (Multi-tenant) ============

@app.get("/school-leaving-certificates/", response_model=List[SchoolLeavingCertificateOut])
@app.get("/school-leaving-certificates", response_model=List[SchoolLeavingCertificateOut])
def get_all_school_leaving_certificates(
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Get all school leaving certificates for the current user's school."""
    # Get all students from the current user's school
    student_ids = db.query(Student.id).filter(
        Student.school_id == current_user.school_id
    ).all()
    student_ids = [sid[0] for sid in student_ids]

    # Get all certificates for these students
    certificates = db.query(SchoolLeavingCertificate).filter(
        SchoolLeavingCertificate.student_id.in_(student_ids)
    ).all()

    return certificates


@app.post("/school-leaving-certificates/", response_model=SchoolLeavingCertificateOut)
@app.post("/school-leaving-certificates", response_model=SchoolLeavingCertificateOut)
def create_school_leaving_certificate(
    certificate: SchoolLeavingCertificateCreate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Create a school leaving certificate (student must belong to current user's school)."""
    # Verify student exists and belongs to the same school
    student = db.query(Student).filter(
        Student.id == certificate.student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id {certificate.student_id} not found")

    # Check if student already has a leaving certificate
    existing_cert = db.query(SchoolLeavingCertificate).filter(
        SchoolLeavingCertificate.student_id == certificate.student_id
    ).first()
    if existing_cert:
        raise HTTPException(status_code=400, detail="Student already has a leaving certificate")

    # Create the certificate
    db_certificate = SchoolLeavingCertificate(**certificate.dict())
    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)

    # Update student record with all leaving information
    student.status = "left"
    student.leaving_date = certificate.leaving_date
    student.class_on_leaving = certificate.class_on_leaving
    student.leaving_reason = certificate.reason_for_leaving
    student.educational_ability = certificate.educational_ability
    student.character = certificate.character
    student.remarks = certificate.remarks
    db.commit()

    return db_certificate


@app.get("/school-leaving-certificates/{student_id}", response_model=SchoolLeavingCertificateOut)
@app.get("/school-leaving-certificates/{student_id}/", response_model=SchoolLeavingCertificateOut)
def get_school_leaving_certificate(
    student_id: int,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Get a school leaving certificate (student must belong to current user's school)."""
    # Verify student belongs to the same school
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    certificate = db.query(SchoolLeavingCertificate).filter(
        SchoolLeavingCertificate.student_id == student_id
    ).first()

    if not certificate:
        raise HTTPException(status_code=404, detail="School leaving certificate not found")

    return certificate


@app.put("/school-leaving-certificates/{cert_id}", response_model=SchoolLeavingCertificateOut)
@app.put("/school-leaving-certificates/{cert_id}/", response_model=SchoolLeavingCertificateOut)
def update_school_leaving_certificate(
    cert_id: int,
    certificate: SchoolLeavingCertificateCreate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Update a school leaving certificate (student must belong to current user's school)."""
    db_cert = db.query(SchoolLeavingCertificate).filter(
        SchoolLeavingCertificate.id == cert_id
    ).first()

    if not db_cert:
        raise HTTPException(status_code=404, detail="School leaving certificate not found")

    # Verify the student belongs to the same school
    student = db.query(Student).filter(
        Student.id == db_cert.student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in certificate.dict().items():
        setattr(db_cert, key, value)

    db.commit()
    db.refresh(db_cert)
    return db_cert


@app.delete("/school-leaving-certificates/{cert_id}")
@app.delete("/school-leaving-certificates/{cert_id}/")
def delete_school_leaving_certificate(
    cert_id: int,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Delete a school leaving certificate (student must belong to current user's school)."""
    db_cert = db.query(SchoolLeavingCertificate).filter(
        SchoolLeavingCertificate.id == cert_id
    ).first()

    if not db_cert:
        raise HTTPException(status_code=404, detail="School leaving certificate not found")

    # Verify the student belongs to the same school
    student = db.query(Student).filter(
        Student.id == db_cert.student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(db_cert)
    db.commit()
    return {"message": "School leaving certificate deleted successfully"}


# ============ Subject Endpoints (Multi-tenant) ============

@app.post("/subjects/", response_model=SubjectOut)
def create_subject(
    subject: SubjectCreate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Create a new subject (requires authentication and school onboarding)."""
    # Check if subject already exists in this school
    if db.query(Subject).filter(
        Subject.school_id == current_user.school_id,
        Subject.name == subject.name
    ).first():
        raise HTTPException(status_code=400, detail="Subject with this name already exists in your school")

    db_subject = Subject(**subject.dict(), school_id=current_user.school_id)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject


@app.get("/subjects/", response_model=List[SubjectOut])
@app.get("/subjects", response_model=List[SubjectOut])
def list_subjects(
    class_id: Optional[int] = None,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """List all subjects for the current user's school."""
    query = db.query(Subject).filter(Subject.school_id == current_user.school_id)
    if class_id:
        query = query.filter(Subject.class_id == class_id)
    return query.all()


# ============ Grade/Marksheet Endpoints (Multi-tenant) ============

@app.post("/grades/", response_model=GradeOut)
def create_grade(
    grade: GradeCreate,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Create a grade entry (student and subject must belong to current user's school)."""
    # Verify student exists and belongs to the same school
    student = db.query(Student).filter(
        Student.id == grade.student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id {grade.student_id} not found")

    # Verify subject exists and belongs to the same school
    subject = db.query(Subject).filter(
        Subject.id == grade.subject_id,
        Subject.school_id == current_user.school_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail=f"Subject with id {grade.subject_id} not found")

    # Create the grade
    db_grade = Grade(**grade.dict())
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade


@app.get("/grades/student/{student_id}", response_model=StudentMarksheet)
def get_student_marksheet(
    student_id: int,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Get student marksheet (student must belong to current user's school)."""
    # Get student info and verify it belongs to the same school
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.school_id == current_user.school_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get all grades for the student
    grades = db.query(Grade).filter(Grade.student_id == student_id).all()

    # Format response
    student_out = StudentOut.model_validate(student)
    grades_out = [GradeOut.model_validate(grade) for grade in grades]

    return StudentMarksheet(student_info=student_out, grades=grades_out)


@app.get("/grades/subject/{subject_id}", response_model=List[GradeOut])
def get_subject_grades(
    subject_id: int,
    current_user: User = Depends(require_school),
    db: Session = Depends(get_db)
):
    """Get all grades for a subject (subject must belong to current user's school)."""
    # Verify subject exists and belongs to the same school
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.school_id == current_user.school_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    grades = db.query(Grade).filter(Grade.subject_id == subject_id).all()
    return grades


# ============ AI CHATBOT ENDPOINT ============

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Chat with AI assistant using Google Gemini with school context."""
    try:
        # Configure Gemini API
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise HTTPException(
                status_code=500,
                detail="Gemini API key not configured"
            )

        genai.configure(api_key=gemini_api_key)

        # Get school information
        school = db.query(School).filter(School.id == current_user.school_id).first()

        # Get statistics
        total_students = db.query(Student).filter(Student.school_id == current_user.school_id).count()
        active_students = db.query(Student).filter(
            Student.school_id == current_user.school_id,
            Student.status == "active"
        ).count()
        left_students = db.query(Student).filter(
            Student.school_id == current_user.school_id,
            Student.status == "left"
        ).count()
        total_classes = db.query(Class).filter(Class.school_id == current_user.school_id).count()

        # Create system context
        system_instruction = f"""You are an AI assistant for a School Management System. You are helping users manage their school efficiently.

CURRENT SCHOOL CONTEXT:
- School Name: {school.school_name if school else 'N/A'}
- SEMIS Code: {school.semis_code if school else 'N/A'}
- Total Students: {total_students}
- Active Students: {active_students}
- Left Students: {left_students}
- Total Classes: {total_classes}
- User: {current_user.full_name or current_user.email}

SYSTEM FEATURES YOU CAN HELP WITH:
1. Student Management:
   - Add new students (Admission Form)
   - Search students by GR number, name, or class
   - Update student information
   - Delete student records
   - View student details and admission forms
   - Generate GR (General Register) documents

2. Class Management:
   - Create and manage classes
   - View students by class
   - Assign students to classes

3. Results & Grades:
   - Add student grades/marks
   - View marksheets
   - Generate result reports

4. Leaving Certificates:
   - Create school leaving certificates
   - View and print certificates

5. Reports & Documents:
   - Generate admission forms
   - Print GR documents
   - Export student data

NAVIGATION GUIDE:
- Dashboard: /dashboard - Overview and statistics
- Students List: /students - View all students
- New Admission: /admission - Add new student
- Update Student: /admin/students - Search and update/delete
- Results: /results - Manage grades and marks
- Leaving Certificate: /leaving-certificate - Create certificates
- Classes: /admin/classes - Manage classes
- Profile: /profile - User profile settings
- School Settings: /school-settings - School information

HOW TO HELP USERS:
- Answer questions about how to use features
- Guide them to the right page for their task
- Explain the admission process
- Help troubleshoot issues
- Provide step-by-step instructions
- Explain what GR numbers are and how they work
- Help with data entry best practices

LANGUAGE:
- Respond in the same language the user uses
- Support Sindhi (سنڌي), Urdu (اردو), and English
- Be friendly and helpful

Remember: You are an assistant that GUIDES users. You cannot directly perform actions like deleting students, but you can tell them exactly how to do it and which page to visit."""

        # Initialize the model with system instruction
        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            system_instruction=system_instruction
        )

        # Build conversation history - map 'assistant' to 'model' for Gemini
        history = []
        for msg in request.history:
            role = "model" if msg.role == "assistant" else msg.role
            history.append({
                "role": role,
                "parts": [msg.content]
            })

        # Start chat with history
        chat = model.start_chat(history=history)

        # Send message and get response
        response = chat.send_message(request.message)

        return ChatResponse(response=response.text)

    except Exception as e:
        # Log the actual error for debugging
        print(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app --host 127.0.0.1 --reload --port 8000")