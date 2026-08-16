from agents import function_tool

from database import SessionLocal
from models import Student

@function_tool
async def get_student_by_gr(gr_number:int):
    """Function tool to get student data GR Number"""
    db = SessionLocal()

    try:
        student = db.query(Student).filter(
            Student.gr_number == gr_number
        ).first()

        if not student:
            return {
                "found": False,
                "message": "Student not found"
            }

        return {
            "found": True,
            "student_id": student.id,
            "gr_number": student.gr_number,
            "name": student.name,
            "father_name": student.father_name,
            "class_id": student.current_class_id
        }

    finally:
        db.close()