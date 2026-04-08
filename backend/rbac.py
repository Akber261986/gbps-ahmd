"""
Role-Based Access Control (RBAC) utilities
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from models import User, School
from auth import get_current_active_user
from database import get_db


class RoleChecker:
    """Dependency class to check user roles"""

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(self.allowed_roles)}"
            )
        return current_user


def require_super_admin(current_user: User = Depends(get_current_active_user)):
    """Require SUPER_ADMIN role"""
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Super admin privileges required."
        )
    return current_user


def require_cluster_head(current_user: User = Depends(get_current_active_user)):
    """Require CLUSTER_HEAD role"""
    if current_user.role != "CLUSTER_HEAD":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cluster head privileges required."
        )
    if not current_user.cluster_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to any cluster"
        )
    return current_user


def require_school_admin(current_user: User = Depends(get_current_active_user)):
    """Require SCHOOL_ADMIN role"""
    if current_user.role != "SCHOOL_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. School admin privileges required."
        )
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to any school"
        )
    return current_user


def can_access_school(
    school_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> bool:
    """Check if user can access a specific school's data"""

    # Super admin can access everything
    if current_user.role == "SUPER_ADMIN":
        return True

    # School admin can only access their own school
    if current_user.role == "SCHOOL_ADMIN":
        if current_user.school_id != school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only access your own school's data."
            )
        return True

    # Cluster head can access schools in their cluster (read-only)
    if current_user.role == "CLUSTER_HEAD":
        if not current_user.cluster_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not assigned to any cluster"
            )

        school = db.query(School).filter(School.id == school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )

        if school.cluster_id != current_user.cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. School is not in your cluster."
            )
        return True

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )


def can_modify_school(
    school_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> bool:
    """Check if user can modify a specific school's data"""

    # Super admin can modify everything
    if current_user.role == "SUPER_ADMIN":
        return True

    # School admin can only modify their own school
    if current_user.role == "SCHOOL_ADMIN":
        if current_user.school_id != school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only modify your own school's data."
            )
        return True

    # Cluster head CANNOT modify schools (read-only access)
    if current_user.role == "CLUSTER_HEAD":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cluster heads have read-only access to school data."
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )


def get_accessible_school_ids(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> List[int]:
    """Get list of school IDs that the user can access"""

    # Super admin can access all schools
    if current_user.role == "SUPER_ADMIN":
        schools = db.query(School.id).all()
        return [s.id for s in schools]

    # School admin can only access their own school
    if current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            return []
        return [current_user.school_id]

    # Cluster head can access all schools in their cluster
    if current_user.role == "CLUSTER_HEAD":
        if not current_user.cluster_id:
            return []
        schools = db.query(School.id).filter(
            School.cluster_id == current_user.cluster_id
        ).all()
        return [s.id for s in schools]

    return []
