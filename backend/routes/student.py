from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import select
from sqlalchemy.orm import Session
from schema.schemas import StudentOut
from database import get_db
from services.excel.student_export import generate_students_excel


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


@router.get("/export")
def export_active_students(
    session: Session = Depends(get_db)
):

    # Get active students
    statement = (
        select(StudentOut)
        .where(StudentOut.status == "active")
        .order_by(StudentOut.current_class_id, StudentOut.name)
    )

    students = session.exec(statement).all()

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