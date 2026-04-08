"""
Migration script to add cluster management system
- Creates clusters table
- Adds cluster_id to schools
- Adds role and cluster_id to users
"""

from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as connection:
        print("Starting migration for cluster management system...")

        # Create clusters table
        print("Creating clusters table...")
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS clusters (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                code VARCHAR(50) UNIQUE,
                taluka VARCHAR(100),
                district VARCHAR(100),
                head_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """))
        connection.commit()
        print("Clusters table created successfully")

        # Add cluster_id to schools table
        print("Adding cluster_id to schools table...")
        connection.execute(text("""
            ALTER TABLE schools
            ADD COLUMN IF NOT EXISTS cluster_id INTEGER REFERENCES clusters(id) ON DELETE SET NULL;
        """))
        connection.commit()
        print("cluster_id added to schools table")

        # Add role to users table
        print("Adding role to users table...")
        connection.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'SCHOOL_ADMIN';
        """))
        connection.commit()
        print("role added to users table")

        # Add cluster_id to users table
        print("Adding cluster_id to users table...")
        connection.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS cluster_id INTEGER REFERENCES clusters(id) ON DELETE SET NULL;
        """))
        connection.commit()
        print("cluster_id added to users table")

        # Update existing users to have SCHOOL_ADMIN role
        print("Setting existing users as SCHOOL_ADMIN...")
        connection.execute(text("""
            UPDATE users
            SET role = 'SCHOOL_ADMIN'
            WHERE role IS NULL OR role = '';
        """))
        connection.commit()
        print("Existing users updated")

        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
