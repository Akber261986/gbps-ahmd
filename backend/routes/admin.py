from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, School, Cluster
from schema.schemas import UserOut, SchoolOut
from auth import get_current_active_user

router = APIRouter()


def require_super_admin(current_user: User = Depends(get_current_active_user)):
    """Dependency to check if user is SUPER_ADMIN"""
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. SUPER_ADMIN role required."
        )
    return current_user


@router.get("/schools", response_model=List[SchoolOut])
def get_all_schools(
    district: str = None,
    taluka: str = None,
    union_council: str = None,
    unassigned_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get all schools in the system with optional filters (SUPER_ADMIN only)"""
    query = db.query(School)

    # Apply filters
    if district:
        query = query.filter(School.district == district)
    if taluka:
        query = query.filter(School.taluka == taluka)
    if union_council:
        query = query.filter(School.union_council == union_council)
    if unassigned_only:
        query = query.filter(School.cluster_id == None)

    schools = query.order_by(School.school_name).all()
    return schools


@router.get("/schools/unassigned", response_model=List[SchoolOut])
def get_unassigned_schools(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get all schools not assigned to any cluster (SUPER_ADMIN only)"""
    schools = db.query(School).filter(School.cluster_id == None).order_by(School.school_name).all()
    return schools


@router.get("/schools/filters")
def get_school_filters(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get unique values for school filters (SUPER_ADMIN only)"""
    from sqlalchemy import distinct

    districts = db.query(distinct(School.district)).filter(School.district != None).all()
    talukas = db.query(distinct(School.taluka)).filter(School.taluka != None).all()
    union_councils = db.query(distinct(School.union_council)).filter(School.union_council != None).all()

    return {
        "districts": sorted([d[0] for d in districts if d[0]]),
        "talukas": sorted([t[0] for t in talukas if t[0]]),
        "union_councils": sorted([uc[0] for uc in union_councils if uc[0]])
    }


@router.get("/users", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get all users in the system (SUPER_ADMIN only)"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Update user role (SUPER_ADMIN only)"""
    # Validate role
    valid_roles = ["SUPER_ADMIN", "CLUSTER_HEAD", "SCHOOL_ADMIN"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent changing own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )

    # Update role
    old_role = user.role
    user.role = role

    # If changing from CLUSTER_HEAD to something else, remove cluster assignment
    if old_role == "CLUSTER_HEAD" and role != "CLUSTER_HEAD":
        # Remove as head from cluster
        if user.cluster_id:
            cluster = db.query(Cluster).filter(Cluster.head_id == user_id).first()
            if cluster:
                cluster.head_id = None
        user.cluster_id = None

    db.commit()
    db.refresh(user)

    return {
        "message": f"User role updated from {old_role} to {role}",
        "user_id": user_id,
        "old_role": old_role,
        "new_role": role
    }


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get system-wide statistics (SUPER_ADMIN only)"""
    total_clusters = db.query(Cluster).count()
    total_schools = db.query(School).count()
    schools_with_cluster = db.query(School).filter(School.cluster_id != None).count()
    schools_without_cluster = total_schools - schools_with_cluster

    total_users = db.query(User).count()
    super_admins = db.query(User).filter(User.role == "SUPER_ADMIN").count()
    cluster_heads = db.query(User).filter(User.role == "CLUSTER_HEAD").count()
    school_admins = db.query(User).filter(User.role == "SCHOOL_ADMIN").count()

    return {
        "clusters": {
            "total": total_clusters
        },
        "schools": {
            "total": total_schools,
            "assigned_to_cluster": schools_with_cluster,
            "unassigned": schools_without_cluster
        },
        "users": {
            "total": total_users,
            "super_admins": super_admins,
            "cluster_heads": cluster_heads,
            "school_admins": school_admins
        }
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Delete a user (SUPER_ADMIN only)"""
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    # If user is a cluster head, remove them from cluster
    if user.role == "CLUSTER_HEAD" and user.cluster_id:
        cluster = db.query(Cluster).filter(Cluster.head_id == user_id).first()
        if cluster:
            cluster.head_id = None

    # Delete user
    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id,
        "email": user.email
    }


@router.delete("/schools/{school_id}")
def delete_school(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Delete a school (SUPER_ADMIN only)"""
    # Get school
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    # Check if school has users assigned
    users_count = db.query(User).filter(User.school_id == school_id).count()
    if users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete school. {users_count} user(s) are assigned to this school. Please reassign or delete them first."
        )

    # Delete school
    school_name = school.school_name
    db.delete(school)
    db.commit()

    return {
        "message": "School deleted successfully",
        "school_id": school_id,
        "school_name": school_name
    }
