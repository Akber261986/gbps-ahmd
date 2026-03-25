"""
Database Migration: Populate leaving_class_id from class_on_leaving

This script migrates existing data to use the foreign key relationship
instead of storing class names as strings.
"""
from sqlalchemy import text
from database import engine
import sys

def run_migration():
    print("Starting migration: Populate leaving_class_id fields...")

    try:
        with engine.connect() as connection:
            with connection.begin():
                # Step 1: Add leaving_class_id to school_leaving_certificates if not exists
                print("Ensuring leaving_class_id column exists in school_leaving_certificates...")
                connection.execute(text("""
                    ALTER TABLE school_leaving_certificates
                    ADD COLUMN IF NOT EXISTS leaving_class_id INTEGER
                    REFERENCES classes(id);
                """))

                # Step 2: Migrate school_leaving_certificates data
                print("Migrating school_leaving_certificates data...")
                result = connection.execute(text("""
                    UPDATE school_leaving_certificates
                    SET leaving_class_id = c.id
                    FROM classes c, students s
                    WHERE school_leaving_certificates.student_id = s.id
                    AND c.name = school_leaving_certificates.class_on_leaving
                    AND c.school_id = s.school_id
                    AND school_leaving_certificates.leaving_class_id IS NULL;
                """))
                print(f"  Updated {result.rowcount} certificate records")

                # Step 3: Migrate students table data
                print("Migrating students table data...")
                result = connection.execute(text("""
                    UPDATE students s
                    SET leaving_class_id = c.id
                    FROM classes c
                    WHERE c.name = s.class_on_leaving
                    AND c.school_id = s.school_id
                    AND s.leaving_class_id IS NULL
                    AND s.class_on_leaving IS NOT NULL;
                """))
                print(f"  Updated {result.rowcount} student records")

                # Step 4: Report unmapped records
                print("\nChecking for unmapped records...")

                # Check students
                result = connection.execute(text("""
                    SELECT COUNT(*) FROM students
                    WHERE class_on_leaving IS NOT NULL
                    AND leaving_class_id IS NULL;
                """))
                unmapped_students = result.scalar()
                if unmapped_students > 0:
                    print(f"  WARNING: {unmapped_students} students have class_on_leaving but no matching class_id")
                    # Show details
                    result = connection.execute(text("""
                        SELECT gr_number, name, class_on_leaving
                        FROM students
                        WHERE class_on_leaving IS NOT NULL
                        AND leaving_class_id IS NULL
                        LIMIT 10;
                    """))
                    print("  Sample unmapped students:")
                    for row in result:
                        print(f"    GR: {row[0]}, Name: {row[1]}, Class: {row[2]}")

                # Check certificates
                result = connection.execute(text("""
                    SELECT COUNT(*) FROM school_leaving_certificates
                    WHERE class_on_leaving IS NOT NULL
                    AND leaving_class_id IS NULL;
                """))
                unmapped_certs = result.scalar()
                if unmapped_certs > 0:
                    print(f"  WARNING: {unmapped_certs} certificates have class_on_leaving but no matching class_id")

                if unmapped_students == 0 and unmapped_certs == 0:
                    print("  All records successfully mapped!")

                print("\nSUCCESS: Migration completed!")
        return True

    except Exception as e:
        print(f"ERROR: Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
