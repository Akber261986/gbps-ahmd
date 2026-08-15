from types import SimpleNamespace

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Class, Student
from services.excel.student_export import generate_students_excel


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


@router.get("/export")
def export_active_students(
    session: Session = Depends(get_db)
):

    rows = (
        session.query(Student, Class.name.label("class_name"))
        .outerjoin(Class, Student.current_class_id == Class.id)
        .filter(Student.status == "active")
        .order_by(Student.current_class_id, Student.name)
        .all()
    )

    students = [
        SimpleNamespace(
            gr_no=student.gr_number,
            name=student.name,
            father_name=student.father_name,
            class_name=class_name or "",
            medium="",
            religion=student.qom or "",
        )
        for student, class_name in rows
    ]

    # Generate Excel
    excel_file = generate_students_excel(
        students=students,
        school_name="GBPS Arbab Haji Muhammad Dal",
        semis_code="YOUR-SEMIS-CODE",
    )

    # Return Excel file
    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument"
            ".spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                'attachment; filename="active_students.xlsx"'
            )
        },
    )