"""
Database migration script to add union_council column to schools table.

Run this script once to update your existing database:
    python migrate_add_union_council.py
"""

from database import SessionLocal, engine
from sqlalchemy import text

def migrate():
    db = SessionLocal()

    try:
        print("=" * 60)
        print("DATABASE MIGRATION: Adding union_council to schools")
        print("=" * 60)

        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='schools' AND column_name='union_council'
        """))

        if result.fetchone():
            print("\n✅ Column 'union_council' already exists in schools table.")
            print("   No migration needed.")
            return

        print("\n📝 Adding 'union_council' column to schools table...")

        # Add the column
        db.execute(text("""
            ALTER TABLE schools
            ADD COLUMN union_council VARCHAR(100)
        """))

        db.commit()

        print("✅ Column added successfully!")
        print("\n" + "=" * 60)
        print("MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Restart your backend server")
        print("2. Update existing schools with district, taluka, and union_council")
        print("3. Test the new 'Assign Schools' feature")
        print("\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {str(e)}")
        print("\nIf you're using SQLite, the column might already exist.")
        print("If you're using PostgreSQL/MySQL, check the error above.")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
