"""
Migration: Add taluka and district columns to schools table
"""
from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as connection:
        # Add taluka column
        connection.execute(text("""
            ALTER TABLE schools
            ADD COLUMN IF NOT EXISTS taluka VARCHAR(100);
        """))

        # Add district column
        connection.execute(text("""
            ALTER TABLE schools
            ADD COLUMN IF NOT EXISTS district VARCHAR(100);
        """))

        connection.commit()
        print("Migration completed: Added taluka and district columns to schools table")

if __name__ == "__main__":
    migrate()
