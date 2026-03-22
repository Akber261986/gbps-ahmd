"""
Database Migration Script: Add snapshot columns to result_sheets table
"""

from sqlalchemy import text
from database import engine
import sys

def run_migration():
    print("Starting migration: Add snapshot columns to result_sheets...")

    try:
        with engine.connect() as connection:
            with connection.begin():
                # Add student_snapshot column
                print("Adding student_snapshot column...")
                connection.execute(text("""
                    ALTER TABLE result_sheets
                    ADD COLUMN IF NOT EXISTS student_snapshot TEXT;
                """))

                # Add class_snapshot column
                print("Adding class_snapshot column...")
                connection.execute(text("""
                    ALTER TABLE result_sheets
                    ADD COLUMN IF NOT EXISTS class_snapshot TEXT;
                """))

                print("SUCCESS: Migration completed!")

                # Verify columns were added
                print("\nVerifying columns...")
                result = connection.execute(text("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'result_sheets'
                    AND column_name IN ('student_snapshot', 'class_snapshot')
                    ORDER BY column_name;
                """))

                columns = result.fetchall()
                if len(columns) == 2:
                    print("SUCCESS: Verification passed! Columns added:")
                    for col in columns:
                        print(f"   - {col[0]} ({col[1]}, nullable: {col[2]})")
                else:
                    print(f"WARNING: Expected 2 columns but found {len(columns)}")

        return True

    except Exception as e:
        print(f"ERROR: Migration failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration: Add Result Sheet Snapshot Columns")
    print("=" * 60)
    print()

    success = run_migration()

    print()
    if success:
        print("SUCCESS: Migration completed!")
        print("You can now restart your backend server.")
        sys.exit(0)
    else:
        print("ERROR: Migration failed.")
        sys.exit(1)
