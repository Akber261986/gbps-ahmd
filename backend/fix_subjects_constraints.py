"""
Fix subjects table constraints in the database
"""
import sys
import io

# Fix Windows console encoding issue
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from sqlalchemy import text
from database import engine

def fix_constraints():
    """Fix the subjects table constraints"""

    sql_commands = [
        "ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_name_key;",
        "ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_code_key;",
        "ALTER TABLE subjects DROP CONSTRAINT IF EXISTS uq_school_subject_name;",
        "ALTER TABLE subjects ADD CONSTRAINT uq_school_subject_name UNIQUE (school_id, name);",
        "ALTER TABLE subjects DROP CONSTRAINT IF EXISTS uq_school_subject_code;",
        "ALTER TABLE subjects ADD CONSTRAINT uq_school_subject_code UNIQUE (school_id, code);",
    ]

    try:
        with engine.connect() as conn:
            print("Fixing subjects table constraints...")
            print("="*50)

            for sql in sql_commands:
                print(f"Executing: {sql}")
                conn.execute(text(sql))
                conn.commit()
                print("✓ Success")

            print("\n" + "="*50)
            print("Constraints fixed successfully!")
            print("="*50)

            # Verify constraints
            print("\nVerifying constraints...")
            result = conn.execute(text("""
                SELECT conname, pg_get_constraintdef(oid) as definition
                FROM pg_constraint
                WHERE conrelid = 'subjects'::regclass
                AND contype = 'u'
                ORDER BY conname;
            """))

            print("\nCurrent unique constraints on subjects table:")
            for row in result:
                print(f"  - {row[0]}: {row[1]}")

    except Exception as e:
        print(f"Error: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    success = fix_constraints()
    if success:
        print("\n✓ Database constraints fixed successfully!")
        print("You can now run migrate_add_subjects.py to add subjects to all schools.")
    else:
        print("\n✗ Failed to fix constraints")
