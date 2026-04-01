"""
Migration script to add standard subjects for all schools
Run this script to populate the subjects table with standard primary school subjects
"""
import sys
import io

# Fix Windows console encoding issue
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Subject, School, Class
from sqlalchemy.exc import IntegrityError

def add_subjects_to_schools():
    """Add standard subjects to all schools in the database"""
    db = SessionLocal()

    try:
        # Standard subjects for primary schools (in Sindhi)
        standard_subjects = [
            {"name": "سنڌي", "code": "SND"},
            {"name": "اردو", "code": "URD"},
            {"name": "انگريزي", "code": "ENG"},
            {"name": "رياضي", "code": "MATH"},
            {"name": "عام ڄاڻ", "code": "GK"},
            {"name": "اسلاميات", "code": "ISL"},
            {"name": "ڊرائنگ", "code": "DRW"},
        ]

        # Get all schools
        schools = db.query(School).all()

        if not schools:
            print("No schools found in database. Please onboard a school first.")
            return

        total_added = 0

        for school in schools:
            print(f"\nAdding subjects for school: {school.school_name} (ID: {school.id})")

            for subject_data in standard_subjects:
                try:
                    # Check if subject already exists for this school
                    existing = db.query(Subject).filter(
                        Subject.school_id == school.id,
                        Subject.name == subject_data["name"]
                    ).first()

                    if existing:
                        print(f"  ✓ Subject '{subject_data['name']}' already exists")
                        continue

                    # Create new subject
                    new_subject = Subject(
                        name=subject_data["name"],
                        code=subject_data["code"],
                        school_id=school.id,
                        class_id=None  # Not tied to specific class
                    )
                    db.add(new_subject)
                    db.commit()
                    total_added += 1
                    print(f"  ✓ Added subject: {subject_data['name']} ({subject_data['code']})")

                except IntegrityError as e:
                    db.rollback()
                    print(f"  ✗ Error adding subject '{subject_data['name']}': {str(e)}")
                    continue

        print(f"\n{'='*50}")
        print(f"Migration completed!")
        print(f"Total subjects added: {total_added}")
        print(f"{'='*50}")

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting subjects migration...")
    print("="*50)
    add_subjects_to_schools()
