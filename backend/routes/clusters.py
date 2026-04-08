from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models import Cluster, School, Student, User
from schema.schemas import ClusterCreate, ClusterUpdate, ClusterOut, ClusterStats, SchoolOut
from auth import get_current_active_user

router = APIRouter()


def require_role(allowed_roles: List[str]):
    """Dependency to check if user has required role"""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


@router.post("/", response_model=ClusterOut, status_code=status.HTTP_201_CREATED)
def create_cluster(
    cluster: ClusterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN"]))
):
    """Create a new cluster (SUPER_ADMIN only)"""
    # Check if code already exists
    if cluster.code:
        existing = db.query(Cluster).filter(Cluster.code == cluster.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cluster code already exists"
            )

    # Validate head_id if provided
    cluster_head = None
    if cluster.head_id:
        cluster_head = db.query(User).filter(User.id == cluster.head_id).first()
        if not cluster_head:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {cluster.head_id} not found"
            )

    # Create cluster
    db_cluster = Cluster(**cluster.dict())
    db.add(db_cluster)
    db.flush()  # Flush to get cluster ID without committing

    # If head_id provided, update user's role and cluster assignment
    if cluster_head:
        cluster_head.role = "CLUSTER_HEAD"
        cluster_head.cluster_id = db_cluster.id

    db.commit()
    db.refresh(db_cluster)

    return db_cluster


@router.get("/", response_model=List[ClusterOut])
def get_all_clusters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all clusters (accessible by all authenticated users)"""
    if current_user.role == "SUPER_ADMIN":
        # Super admin sees all clusters
        clusters = db.query(Cluster).all()
    elif current_user.role == "CLUSTER_HEAD":
        # Cluster head sees only their cluster
        if not current_user.cluster_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not assigned to any cluster"
            )
        clusters = db.query(Cluster).filter(Cluster.id == current_user.cluster_id).all()
    else:
        # School admin sees their school's cluster
        if not current_user.school_id:
            return []
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or not school.cluster_id:
            return []
        clusters = db.query(Cluster).filter(Cluster.id == school.cluster_id).all()

    return clusters


@router.get("/{cluster_id}", response_model=ClusterOut)
def get_cluster(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get cluster by ID"""
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check access permissions
    if current_user.role == "CLUSTER_HEAD" and current_user.cluster_id != cluster_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this cluster"
        )
    elif current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or school.cluster_id != cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this cluster"
            )

    return cluster


@router.get("/{cluster_id}/details")
def get_cluster_details(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get complete cluster details including head info, schools, and statistics"""
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check access permissions
    if current_user.role == "CLUSTER_HEAD" and current_user.cluster_id != cluster_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this cluster"
        )
    elif current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or school.cluster_id != cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this cluster"
            )

    # Get cluster head info
    head_info = None
    if cluster.head_id:
        head = db.query(User).filter(User.id == cluster.head_id).first()
        if head:
            head_info = {
                "id": head.id,
                "email": head.email,
                "full_name": head.full_name,
                "role": head.role
            }

    # Get schools in cluster
    schools = db.query(School).filter(School.cluster_id == cluster_id).all()
    school_list = []
    total_students = 0
    total_boys = 0
    total_girls = 0

    for school in schools:
        students_count = db.query(Student).filter(
            Student.school_id == school.id,
            Student.status == "active"
        ).count()

        boys_count = db.query(Student).filter(
            Student.school_id == school.id,
            Student.status == "active",
            Student.gender.in_(["ڇوڪرو", "Boy", "Male"])
        ).count()

        girls_count = db.query(Student).filter(
            Student.school_id == school.id,
            Student.status == "active",
            Student.gender.in_(["ڇوڪري", "Girl", "Female"])
        ).count()

        total_students += students_count
        total_boys += boys_count
        total_girls += girls_count

        school_list.append({
            "id": school.id,
            "school_name": school.school_name,
            "semis_code": school.semis_code,
            "taluka": school.taluka,
            "district": school.district,
            "total_students": students_count,
            "boys": boys_count,
            "girls": girls_count
        })

    return {
        "cluster": {
            "id": cluster.id,
            "name": cluster.name,
            "code": cluster.code,
            "taluka": cluster.taluka,
            "district": cluster.district,
            "created_at": cluster.created_at
        },
        "head": head_info,
        "statistics": {
            "total_schools": len(schools),
            "total_students": total_students,
            "total_boys": total_boys,
            "total_girls": total_girls
        },
        "schools": school_list,
        "status": {
            "has_head": head_info is not None,
            "has_schools": len(schools) > 0,
            "is_operational": head_info is not None and len(schools) > 0
        }
    }


@router.put("/{cluster_id}", response_model=ClusterOut)
def update_cluster(
    cluster_id: int,
    cluster_update: ClusterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN"]))
):
    """Update cluster (SUPER_ADMIN only)"""
    db_cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not db_cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check if new code conflicts
    if cluster_update.code and cluster_update.code != db_cluster.code:
        existing = db.query(Cluster).filter(Cluster.code == cluster_update.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cluster code already exists"
            )

    for key, value in cluster_update.dict(exclude_unset=True).items():
        setattr(db_cluster, key, value)

    db.commit()
    db.refresh(db_cluster)
    return db_cluster


@router.delete("/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cluster(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN"]))
):
    """Delete cluster (SUPER_ADMIN only)"""
    db_cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not db_cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check if cluster has schools
    schools_count = db.query(School).filter(School.cluster_id == cluster_id).count()
    if schools_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete cluster with {schools_count} schools. Remove schools first."
        )

    db.delete(db_cluster)
    db.commit()
    return None


@router.get("/{cluster_id}/stats", response_model=ClusterStats)
def get_cluster_stats(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get cluster statistics"""
    # Verify cluster exists and user has access
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check access permissions
    if current_user.role == "CLUSTER_HEAD" and current_user.cluster_id != cluster_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this cluster"
        )
    elif current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or school.cluster_id != cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this cluster"
            )

    # Get all schools in cluster
    schools = db.query(School).filter(School.cluster_id == cluster_id).all()
    school_ids = [s.id for s in schools]

    # Total schools
    total_schools = len(schools)

    # Total students
    total_students = db.query(Student).filter(
        Student.school_id.in_(school_ids),
        Student.status == "active"
    ).count()

    # Boys and girls count
    total_boys = db.query(Student).filter(
        Student.school_id.in_(school_ids),
        Student.status == "active",
        Student.gender.in_(["ڇوڪرو", "Boy", "Male"])
    ).count()

    total_girls = db.query(Student).filter(
        Student.school_id.in_(school_ids),
        Student.status == "active",
        Student.gender.in_(["ڇوڪري", "Girl", "Female"])
    ).count()

    # Schools by taluka
    schools_by_taluka = {}
    for school in schools:
        taluka = school.taluka or "Unknown"
        if taluka not in schools_by_taluka:
            schools_by_taluka[taluka] = 0
        schools_by_taluka[taluka] += 1

    return ClusterStats(
        total_schools=total_schools,
        total_students=total_students,
        total_boys=total_boys,
        total_girls=total_girls,
        schools_by_taluka=schools_by_taluka
    )


@router.get("/{cluster_id}/schools", response_model=List[SchoolOut])
def get_cluster_schools(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all schools in a cluster"""
    # Verify cluster exists and user has access
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check access permissions
    if current_user.role == "CLUSTER_HEAD" and current_user.cluster_id != cluster_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this cluster"
        )
    elif current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or school.cluster_id != cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this cluster"
            )

    schools = db.query(School).filter(School.cluster_id == cluster_id).all()
    return schools


@router.get("/{cluster_id}/students")
def get_cluster_students(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get aggregated student data for cluster"""
    # Verify cluster exists and user has access
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check access permissions
    if current_user.role == "CLUSTER_HEAD" and current_user.cluster_id != cluster_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this cluster"
        )
    elif current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or school.cluster_id != cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this cluster"
            )

    # Get all schools in cluster
    schools = db.query(School).filter(School.cluster_id == cluster_id).all()

    # Aggregate student data by school
    school_data = []
    for school in schools:
        total_students = db.query(Student).filter(
            Student.school_id == school.id,
            Student.status == "active"
        ).count()

        boys = db.query(Student).filter(
            Student.school_id == school.id,
            Student.status == "active",
            Student.gender.in_(["ڇوڪرو", "Boy", "Male"])
        ).count()

        girls = db.query(Student).filter(
            Student.school_id == school.id,
            Student.status == "active",
            Student.gender.in_(["ڇوڪري", "Girl", "Female"])
        ).count()

        school_data.append({
            "school_id": school.id,
            "school_name": school.school_name,
            "semis_code": school.semis_code,
            "taluka": school.taluka,
            "total_students": total_students,
            "boys": boys,
            "girls": girls
        })

    return {
        "cluster_id": cluster_id,
        "cluster_name": cluster.name,
        "schools": school_data
    }


@router.post("/{cluster_id}/assign-school/{school_id}")
def assign_school_to_cluster(
    cluster_id: int,
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN"]))
):
    """Assign a school to a cluster (SUPER_ADMIN only)"""
    # Verify cluster exists
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Verify school exists
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    # Assign school to cluster
    school.cluster_id = cluster_id
    db.commit()
    db.refresh(school)

    return {
        "message": f"School '{school.school_name}' assigned to cluster '{cluster.name}'",
        "school_id": school_id,
        "cluster_id": cluster_id
    }


@router.delete("/{cluster_id}/remove-school/{school_id}")
def remove_school_from_cluster(
    cluster_id: int,
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN"]))
):
    """Remove a school from a cluster (SUPER_ADMIN only)"""
    # Verify school exists and belongs to this cluster
    school = db.query(School).filter(
        School.id == school_id,
        School.cluster_id == cluster_id
    ).first()

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found in this cluster"
        )

    # Remove cluster assignment
    school.cluster_id = None
    db.commit()

    return {
        "message": f"School '{school.school_name}' removed from cluster",
        "school_id": school_id
    }


@router.post("/{cluster_id}/assign-head/{user_id}")
def assign_cluster_head(
    cluster_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN"]))
):
    """Assign a user as cluster head (SUPER_ADMIN only)"""
    # Verify cluster exists
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update user role and cluster assignment
    user.role = "CLUSTER_HEAD"
    user.cluster_id = cluster_id
    cluster.head_id = user_id

    db.commit()
    db.refresh(user)
    db.refresh(cluster)

    return {
        "message": f"User '{user.full_name or user.email}' assigned as head of cluster '{cluster.name}'",
        "user_id": user_id,
        "cluster_id": cluster_id
    }


@router.get("/{cluster_id}/schools/{school_id}/classes")
def get_school_class_data(
    cluster_id: int,
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get class-wise student data for a specific school in the cluster"""
    # Verify cluster exists and user has access
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )

    # Check access permissions
    if current_user.role == "CLUSTER_HEAD" and current_user.cluster_id != cluster_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this cluster"
        )
    elif current_user.role == "SCHOOL_ADMIN":
        if not current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        school = db.query(School).filter(School.id == current_user.school_id).first()
        if not school or school.cluster_id != cluster_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this cluster"
            )

    # Verify school exists and belongs to this cluster
    from models import Class
    school = db.query(School).filter(
        School.id == school_id,
        School.cluster_id == cluster_id
    ).first()

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found in this cluster"
        )

    # Get all classes for this school
    classes = db.query(Class).filter(Class.school_id == school_id).order_by(Class.id).all()

    # Get class-wise student data
    class_data = []
    total_boys = 0
    total_girls = 0
    total_students = 0

    for cls in classes:
        boys = db.query(Student).filter(
            Student.school_id == school_id,
            Student.class_id == cls.id,
            Student.status == "active",
            Student.gender.in_(["ڇوڪرو", "Boy", "Male"])
        ).count()

        girls = db.query(Student).filter(
            Student.school_id == school_id,
            Student.class_id == cls.id,
            Student.status == "active",
            Student.gender.in_(["ڇوڪري", "Girl", "Female"])
        ).count()

        class_total = boys + girls
        total_boys += boys
        total_girls += girls
        total_students += class_total

        class_data.append({
            "class_id": cls.id,
            "class_name": cls.name,
            "boys": boys,
            "girls": girls,
            "total": class_total
        })

    return {
        "school_id": school_id,
        "school_name": school.school_name,
        "classes": class_data,
        "totals": {
            "boys": total_boys,
            "girls": total_girls,
            "total": total_students
        }
    }
