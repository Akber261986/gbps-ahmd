import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_image(file_content: bytes, folder: str, public_id: str = None) -> dict:
    """
    Upload an image to Cloudinary

    Args:
        file_content: Image file content as bytes
        folder: Cloudinary folder (e.g., 'school_logos', 'student_photos')
        public_id: Optional custom public ID for the image

    Returns:
        dict with 'url' and 'public_id'
    """
    try:
        upload_params = {
            "folder": folder,
            "resource_type": "image",
            "transformation": [
                {"width": 500, "height": 500, "crop": "limit"},  # Max dimensions
                {"quality": "auto"},  # Auto quality optimization
                {"fetch_format": "auto"}  # Auto format (WebP when supported)
            ]
        }

        if public_id:
            upload_params["public_id"] = public_id
            upload_params["overwrite"] = True

        result = cloudinary.uploader.upload(file_content, **upload_params)

        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        raise Exception(f"Failed to upload image to Cloudinary: {str(e)}")

def delete_image(public_id: str) -> bool:
    """
    Delete an image from Cloudinary

    Args:
        public_id: The public ID of the image to delete

    Returns:
        bool indicating success
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Failed to delete image from Cloudinary: {str(e)}")
        return False
