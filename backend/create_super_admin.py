"""
Script to create a SUPER_ADMIN user for the cluster management system.
Run this script once to create your first super admin.

Usage:
    python create_super_admin.py
"""

from database import SessionLocal
from models import User
from auth import get_password_hash
import sys

def create_super_admin():
    db = SessionLocal()

    try:
        print("=" * 60)
        print("SUPER ADMIN USER CREATION")
        print("=" * 60)

        # Get user input
        email = input("\nEnter email for super admin: ").strip()
        if not email:
            print("❌ Email cannot be empty!")
            return

        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"\n⚠️  User with email '{email}' already exists!")
            update = input("Do you want to update this user to SUPER_ADMIN? (yes/no): ").strip().lower()

            if update == 'yes':
                existing.role = "SUPER_ADMIN"
                existing.is_superuser = True
                existing.is_active = True
                db.commit()
                print(f"\n✅ User '{email}' updated to SUPER_ADMIN role!")
                print(f"   User ID: {existing.id}")
                print(f"   Full Name: {existing.full_name or 'Not set'}")
                print(f"   Role: {existing.role}")
            else:
                print("\n❌ Operation cancelled.")
            return

        # Get full name
        full_name = input("Enter full name (optional): ").strip()
        if not full_name:
            full_name = "Super Admin"

        # Get password
        password = input("Enter password (min 6 characters): ").strip()
        if len(password) < 6:
            print("❌ Password must be at least 6 characters!")
            return

        # Confirm password
        password_confirm = input("Confirm password: ").strip()
        if password != password_confirm:
            print("❌ Passwords do not match!")
            return

        # Create super admin
        super_admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role="SUPER_ADMIN",
            is_active=True,
            is_superuser=True,
            school_id=None,  # Super admin doesn't belong to a school
            cluster_id=None  # Super admin doesn't belong to a cluster
        )

        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)

        print("\n" + "=" * 60)
        print("✅ SUPER ADMIN CREATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"   User ID: {super_admin.id}")
        print(f"   Email: {super_admin.email}")
        print(f"   Full Name: {super_admin.full_name}")
        print(f"   Role: {super_admin.role}")
        print(f"   Is Superuser: {super_admin.is_superuser}")
        print("=" * 60)
        print("\nYou can now login with these credentials and:")
        print("  • Create clusters")
        print("  • Assign schools to clusters")
        print("  • Assign cluster heads")
        print("  • Manage all users and schools")
        print("\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating super admin: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def list_super_admins():
    """List all existing super admins"""
    db = SessionLocal()
    try:
        super_admins = db.query(User).filter(User.role == "SUPER_ADMIN").all()

        if not super_admins:
            print("\n⚠️  No SUPER_ADMIN users found in the system.")
            return

        print("\n" + "=" * 60)
        print("EXISTING SUPER ADMIN USERS")
        print("=" * 60)
        for admin in super_admins:
            print(f"\n  ID: {admin.id}")
            print(f"  Email: {admin.email}")
            print(f"  Full Name: {admin.full_name or 'Not set'}")
            print(f"  Active: {admin.is_active}")
            print(f"  Created: {admin.created_at}")
            print("-" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║         CLUSTER MANAGEMENT SYSTEM - ADMIN SETUP            ║")
    print("╚════════════════════════════════════════════════════════════╝")

    print("\nWhat would you like to do?")
    print("  1. Create new SUPER_ADMIN user")
    print("  2. List existing SUPER_ADMIN users")
    print("  3. Exit")

    choice = input("\nEnter your choice (1-3): ").strip()

    if choice == "1":
        create_super_admin()
    elif choice == "2":
        list_super_admins()
    elif choice == "3":
        print("\n👋 Goodbye!")
    else:
        print("\n❌ Invalid choice!")
