# models.py
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, func, Float, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import date, datetime


class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(200), nullable=False)
    semis_code = Column(String(50), unique=True, nullable=False, index=True)  # SEMIS code
    logo_url = Column(String(500), nullable=True)  # Path to school logo
    established_year = Column(Integer, nullable=True)
    address = Column(Text, nullable=True)
    contact_number = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    principal_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="school")
    classes = relationship("Class", back_populates="school")
    students = relationship("Student", back_populates="school")
    subjects = relationship("Subject", back_populates="school")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    full_name = Column(String(100), nullable=True)
    profile_image_url = Column(String(500), nullable=True)  # Profile picture URL
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)  # Nullable for superusers
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)  # Platform admin

    # OAuth fields
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'facebook', etc.
    oauth_provider_id = Column(String(255), nullable=True)  # ID from OAuth provider

    # Password reset fields
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    school = relationship("School", back_populates="users")


class Class(Base):
    __tablename__ = "classes"
    __table_args__ = (
        UniqueConstraint('school_id', 'name', name='uq_school_class_name'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # e.g. "کلاس اول", "Class 1"
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)

    students = relationship("Student", foreign_keys="[Student.class_id]", back_populates="class_")
    subjects = relationship("Subject", back_populates="class_")
    school = relationship("School", back_populates="classes")


class Student(Base):
    __tablename__ = "students"
    __table_args__ = (
        UniqueConstraint('school_id', 'gr_number', name='uq_school_gr_number'),
    )

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)

    gr_number = Column(String(50), nullable=False, index=True)  # Manual entry, unique per school
    name = Column(String(100), nullable=False)                    # شاگIRD جو نالو
    father_name = Column(String(100), nullable=False)             # والد جو نالو
    place_of_birth = Column(String(150), nullable=True)           # جائے پیدائش
    date_of_birth = Column(Date, nullable=False)
    date_of_birth_in_letter = Column(String(100), nullable=True)  # تحرير ۾ ڄمڻ جي تاريخ
    qom = Column(String(50), nullable=True)                       # قوم = مسلمان، هندو، عيسائي وغيره
    caste = Column(String(100), nullable=True)                    # قوم / ذات
    previous_school = Column(String(150), nullable=True)          # پہلے سکول جو نالو
    gr_of_previos_school = Column(String(50), nullable=True)  # پچھلے سکول کا GR نمبر
    gender = Column(String(20), nullable=False)                   # ڇوڪرو / ڇوڪري

    # Three separate class fields for different purposes
    admission_class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)  # Class at admission (for GR, admission forms)
    current_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)     # Current class (for result sheets, grades)
    leaving_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)     # Class when leaving (for leaving certificates)

    # Legacy field for backward compatibility - will be deprecated
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)

    admission_date = Column(Date, nullable=False, default=date.today)

    # Leaving information
    leaving_date = Column(Date, nullable=True)
    class_on_leaving = Column(String(50), nullable=True)  # Legacy string field
    leaving_reason = Column(Text, nullable=True)
    educational_ability = Column(String(100), nullable=True)  # Excellent/Good/Average
    character = Column(String(100), nullable=True)  # Satisfactory/Good/Excellent
    remarks = Column(Text, nullable=True)

    # Guardian information
    relation_with_guardian = Column(String(50), nullable=True)     # سان تعلق
    guardian_name = Column(String(100), nullable=True)             # نگهداشت ڪندڙ جو نالو
    guardian_occupation = Column(String(100), nullable=True)       # نگهداشت ڪندڙ جو ڏينهن
    current_address = Column(Text, nullable=True)                 # موجودہ پتہ

    admission_age_years = Column(Integer, nullable=True)          # Calculated or manual
    roll_number = Column(String(20), nullable=True)               # کلاس اندر رول نمبر
    status = Column(String(20), default="active")                 # active / left / transferred

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    class_ = relationship("Class", foreign_keys=[class_id], back_populates="students")
    admission_class = relationship("Class", foreign_keys=[admission_class_id])
    current_class = relationship("Class", foreign_keys=[current_class_id])
    leaving_class = relationship("Class", foreign_keys=[leaving_class_id])
    school = relationship("School", back_populates="students")
    grades = relationship("Grade", back_populates="student")
    leaving_certificate = relationship("SchoolLeavingCertificate", back_populates="student", uselist=False)

    # You can add a method to calculate age if needed
    @property
    def calculated_age_at_admission(self):
        if self.date_of_birth and self.admission_date:
            delta = self.admission_date - self.date_of_birth
            return delta.days // 365
        return None


class Subject(Base):
    __tablename__ = "subjects"
    __table_args__ = (
        UniqueConstraint('school_id', 'name', name='uq_school_subject_name'),
        UniqueConstraint('school_id', 'code', name='uq_school_subject_code'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "Mathematics", "English"
    code = Column(String(20), nullable=True)  # e.g., "MATH101", "ENG101"
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)  # Optional: subject for specific class
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)

    # Relationships
    grades = relationship("Grade", back_populates="subject")
    class_ = relationship("Class", back_populates="subjects")
    school = relationship("School", back_populates="subjects")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    # Exam/session information
    exam_session = Column(String(50), nullable=False)  # e.g., "Annual 2023", "Mid-term 2024"
    exam_type = Column(String(50), nullable=False)  # e.g., "Final", "Mid-term", "Quiz"
    academic_year = Column(String(20), nullable=False)  # e.g., "2023-24"

    # Grade/marks information
    marks_obtained = Column(Integer, nullable=True)
    total_marks = Column(Integer, nullable=True)
    grade = Column(String(10), nullable=True)  # A+, A, B, C, etc.
    percentage = Column(Float, nullable=True)

    # Additional information
    subject_teacher = Column(String(100), nullable=True)
    date_recorded = Column(Date, nullable=False, default=date.today)

    # Relationships
    student = relationship("Student", back_populates="grades")
    subject = relationship("Subject", back_populates="grades")


class SchoolLeavingCertificate(Base):
    __tablename__ = "school_leaving_certificates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    # Student details at the time of leaving
    gr_number = Column(String(50), nullable=False)  # Copy from student record
    student_name = Column(String(100), nullable=False)  # Copy from student record
    father_name = Column(String(100), nullable=False)  # Copy from student record
    qom = Column(String(50), nullable=True)  # Copy from student record
    caste = Column(String(100), nullable=True)  # Copy from student record
    place_of_birth = Column(String(150), nullable=True)  # Copy from student record
    date_of_birth = Column(Date, nullable=False)  # Copy from student record
    date_of_birth_in_letter = Column(String(100), nullable=True)  # تحرير ۾ ڄمڻ جي تاريخ
    # Admission and class information
    admission_date = Column(Date, nullable=False)
    previous_school = Column(String(150), nullable=True)  # Copy from student record
    gr_of_previous_school = Column(String(50), nullable=True)  # GR number from previous school
    educational_ability = Column(String(100), nullable=True)  # Excellent/Good/Average
    character = Column(String(100), nullable=True)  # Satisfactory/Good/Excellent
    # Leaving information
    leaving_date = Column(Date, nullable=False)
    leaving_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)  # Foreign key to classes
    class_on_leaving = Column(String(50), nullable=True)  # DEPRECATED: Use leaving_class_id instead
    reason_for_leaving = Column(Text, nullable=True)

    # Academic performance
    remarks = Column(Text, nullable=True)

    # Verification
    issued_date = Column(Date, nullable=False, default=date.today)

    # Relationships
    student = relationship("Student", back_populates="leaving_certificate")
    leaving_class = relationship("Class", foreign_keys=[leaving_class_id])


class ResultSheet(Base):
    __tablename__ = "result_sheets"
    __table_args__ = (
        UniqueConstraint('school_id', 'academic_year', name='uq_school_academic_year'),
    )

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)
    academic_year = Column(String(20), nullable=False, index=True)  # e.g., "2025-2026"
    title = Column(String(200), nullable=True)  # Optional custom title
    status = Column(String(20), default="active")  # active/archived

    # Snapshot fields to preserve historical data
    student_snapshot = Column(Text, nullable=True)  # JSON array of students at time of creation
    class_snapshot = Column(Text, nullable=True)    # JSON array of classes at time of creation

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    school = relationship("School")


class AddmissionForm(Base):
    __tablename__ = "admission_forms"

    id = Column(Integer, primary_key=True, index=True)

    gr_number = Column(String(50), unique=True, nullable=False, index=True)  # Manual entry, unique
    admission_date = Column(Date, nullable=False, default=date.today)
    name = Column(String(100), nullable=False)                    # شاگIRD جو نالو
    father_name = Column(String(100), nullable=False)             # والد جو نالو
    qom = Column(String(50), nullable=True)                       # قوم = مسلمان، هندو، عيسائي وغيره
    caste = Column(String(100), nullable=True)                    # قوم / ذات
    relation_with_guardian = Column(String(50), nullable=True)     # سان تعلق
    guardian_name = Column(String(100), nullable=True)             # نگهداشت ڪندڙ جو نالو
    guardian_occupation = Column(String(100), nullable=True)       # نگهداشت ڪندڙ جو ڏينهن
    place_of_birth = Column(String(150), nullable=True)           # جائے پیدائش
    current_address = Column(Text, nullable=True)                 # موجودہ پتہ
    date_of_birth = Column(Date, nullable=False)
    date_of_birth_in_letter = Column(String(100), nullable=True)  # تحرير ۾ ڄمڻ جي تاريخ
    previous_school = Column(String(150), nullable=True)          # پہلے سکول جو نالو
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    admission_age_years = Column(Integer, nullable=True)          # Calculated or manual


    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    class_ = relationship("Class")

class MarkSheet(Base):
    __tablename__ = "mark_sheets"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    gr_number = Column(String(50), nullable=False)  # Copy from student record
    student_name = Column(String(100), nullable=False)  # Copy from student record
    father_name = Column(String(100), nullable=False)  # Copy from student record
    date_of_birth = Column(Date, nullable=False)  # Copy from student record
    admission_date = Column(Date, nullable=False)  # Copy from student record
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    class_ = relationship("Class")

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    student = relationship("Student")