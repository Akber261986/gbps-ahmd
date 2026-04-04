from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

# Pydantic model for creating student (admission form data)
class StudentCreate(BaseModel):
    gr_number: str
    admission_date: date
    name: str
    father_name: str
    qom: Optional[str] = None # قوم = مسلمان، هندو، عيسائي وغيره
    caste: Optional[str] = None
    relation_with_guardian: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_occupation: Optional[str] = None
    place_of_birth: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: date
    date_of_birth_in_letter: str
    previous_school: Optional[str] = None
    gr_of_previos_school: Optional[str] = None

    # Three separate class fields
    admission_class_id: int  # Class at admission (for GR, admission forms)
    current_class_id: Optional[int] = None  # Current class (for result sheets, grades)

    # Legacy field for backward compatibility
    class_id: Optional[int] = None

    gender: str # ڇوڪرو يا ڇوڪري
    roll_number: Optional[str] = None


class StudentUpdate(BaseModel):
    """Same as create - for PUT; allows updating student without 'GR already exists' on self."""
    gr_number: str
    admission_date: date
    name: str
    father_name: str
    qom: Optional[str] = None
    caste: Optional[str] = None
    relation_with_guardian: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_occupation: Optional[str] = None
    place_of_birth: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: date
    date_of_birth_in_letter: Optional[str] = None
    previous_school: Optional[str] = None
    gr_of_previos_school: Optional[str] = None

    # Three separate class fields
    admission_class_id: int
    current_class_id: Optional[int] = None

    # Legacy field for backward compatibility
    class_id: Optional[int] = None

    gender: str
    roll_number: Optional[str] = None


# Batch upload schema
class StudentBatchCreate(BaseModel):
    students: List[StudentCreate]


class BatchUploadResponse(BaseModel):
    success_count: int
    failed_count: int
    errors: List[dict]
    created_students: List[dict]

class StudentGR(BaseModel):
    gr_number: str
    name: str
    father_name: str
    place_of_birth: Optional[str] = None
    date_of_birth: date
    date_of_birth_in_letter: str
    caste: Optional[str] = None
    religion: Optional[str] = None
    previous_school: Optional[str] = None
    class_id: int
    admission_date: date
    previous_gr_number: Optional[str] = None
    school_leaving_date: Optional[date] = None
    school_leaving_class: int
    reason_to_leave_school: Optional[str] = None
    educational_ability: Optional[str] = None
    charecter: Optional[str] = None
    remarks: Optional[str] = None

# Updated StudentOut class to match the model
class StudentOut(BaseModel):
    id: int
    gr_number: str
    admission_date: date
    name: str
    father_name: str
    gender: str
    qom: Optional[str] = None
    caste: Optional[str] = None
    relation_with_guardian: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_occupation: Optional[str] = None
    date_of_birth: date
    date_of_birth_in_letter: Optional[str] = None
    place_of_birth: Optional[str] = None
    current_address: Optional[str] = None
    previous_school: Optional[str] = None
    gr_of_previos_school: Optional[str] = None
    class_id: int
    admission_class_id: int
    current_class_id: Optional[int] = None
    leaving_class_id: Optional[int] = None
    admission_age_years: Optional[int] = None
    roll_number: Optional[str] = None
    status: str = "active"
    leaving_date: Optional[date] = None
    class_on_leaving: Optional[str] = None
    leaving_reason: Optional[str] = None
    educational_ability: Optional[str] = None
    character: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ClassCreate(BaseModel):
    name: str

class ClassOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

# Enhanced School Leaving Certificate schema
class SchoolLeavingCertificateCreate(BaseModel):
    student_id: int
    gr_number: str
    student_name: str
    father_name: str
    qom: Optional[str] = None
    caste: Optional[str] = None
    place_of_birth: Optional[str] = None
    date_of_birth: date
    date_of_birth_in_letter: Optional[str] = None
    admission_date: date
    previous_school: Optional[str] = None
    gr_of_previous_school: Optional[str] = None
    leaving_date: date
    leaving_class_id: Optional[int] = None
    class_on_leaving: Optional[str] = None
    reason_for_leaving: Optional[str] = None
    educational_ability: Optional[str] = None
    character: Optional[str] = None
    remarks: Optional[str] = None

class SchoolLeavingCertificateOut(BaseModel):
    id: int
    student_id: int
    gr_number: str
    student_name: str
    father_name: str
    qom: Optional[str] = None
    caste: Optional[str] = None
    place_of_birth: Optional[str] = None
    date_of_birth: date
    date_of_birth_in_letter: Optional[str] = None
    admission_date: date
    previous_school: Optional[str] = None
    gr_of_previous_school: Optional[str] = None
    leaving_date: date
    leaving_class_id: Optional[int] = None
    class_on_leaving: Optional[str] = None
    reason_for_leaving: Optional[str] = None
    educational_ability: Optional[str] = None
    character: Optional[str] = None
    remarks: Optional[str] = None
    issued_date: date

    class Config:
        from_attributes = True

# Enhanced Marksheet/Grade schema
class GradeCreate(BaseModel):
    student_id: int
    subject_id: int
    exam_session: str
    exam_type: str
    academic_year: str
    marks_obtained: Optional[int] = None
    total_marks: Optional[int] = None
    grade: Optional[str] = None
    percentage: Optional[float] = None
    subject_teacher: Optional[str] = None

class GradeOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    exam_session: str
    exam_type: str
    academic_year: str
    marks_obtained: Optional[int] = None
    total_marks: Optional[int] = None
    grade: Optional[str] = None
    percentage: Optional[float] = None
    subject_teacher: Optional[str] = None
    date_recorded: date

    class Config:
        from_attributes = True

# Subject schema
class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    class_id: Optional[int] = None

class SubjectOut(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    class_id: Optional[int] = None

    class Config:
        from_attributes = True

# Enhanced Marksheet response showing all grades for a student
class StudentMarksheet(BaseModel):
    student_info: StudentOut
    grades: List[GradeOut]

    class Config:
        from_attributes = True


# ============ Authentication & School Management Schemas ============

# User Registration
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# User Response
class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    school_id: Optional[int] = None
    is_active: bool
    is_superuser: bool
    oauth_provider: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# User Profile Update
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

# School Management
class SchoolCreate(BaseModel):
    school_name: str
    semis_code: str
    logo_url: Optional[str] = None
    established_year: Optional[int] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    principal_name: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None

class SchoolUpdate(BaseModel):
    school_name: Optional[str] = None
    semis_code: Optional[str] = None
    logo_url: Optional[str] = None
    established_year: Optional[int] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    principal_name: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None

class SchoolOut(BaseModel):
    id: int
    school_name: str
    semis_code: str
    logo_url: Optional[str] = None
    established_year: Optional[int] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    principal_name: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str

# Google OAuth Schemas
class GoogleLoginRequest(BaseModel):
    token: str  # Google ID token

class GoogleLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Chat schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str

# Result Sheet schemas
class ResultSheetCreate(BaseModel):
    academic_year: str  # e.g., "2025-2026"
    title: Optional[str] = None

class ResultSheetUpdate(BaseModel):
    academic_year: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None

class ResultSheetOut(BaseModel):
    id: int
    school_id: int
    academic_year: str
    title: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Batch Marks Entry schemas
class SubjectMarks(BaseModel):
    subject_id: int
    marks_obtained: Optional[int] = None
    total_marks: int = 100  # Default total marks

class StudentMarksEntry(BaseModel):
    student_id: int
    class_id: int
    exam_session: str
    exam_type: str
    academic_year: str
    subject_teacher: Optional[str] = None
    marks: List[SubjectMarks]
    is_absent: bool = False

class StudentMarksResponse(BaseModel):
    student_id: int
    marks: dict  # subject_id -> marks_obtained
