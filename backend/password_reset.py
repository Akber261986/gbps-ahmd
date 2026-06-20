# password_reset.py
import secrets
import os
import random
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from models import User
from auth import get_password_hash

def generate_reset_token() -> str:
    """Generate a secure random token for password reset."""
    return secrets.token_urlsafe(32)

def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))

def create_password_reset_otp(email: str, db: Session) -> Optional[str]:
    """
    Create a password reset OTP for a user.
    Returns the OTP if successful, None if user not found.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    # Don't allow password reset for OAuth users
    if user.oauth_provider:
        return None

    # Generate OTP and set expiration (10 minutes)
    otp = generate_otp()
    user.reset_token = otp  # Store OTP in reset_token field
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=10)

    db.commit()
    return otp

def verify_otp(email: str, otp: str, db: Session) -> Optional[str]:
    """
    Verify an OTP for password reset.
    Returns a temporary token if OTP is valid, None otherwise.
    """
    user = db.query(User).filter(User.email == email).first()

    if not user or user.reset_token != otp:
        return None

    # Check if OTP has expired
    if user.reset_token_expires < datetime.utcnow():
        return None

    # Generate a temporary token for password reset (valid for 15 minutes)
    temp_token = generate_reset_token()
    user.reset_token = temp_token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=15)

    db.commit()
    return temp_token

def verify_reset_token(token: str, db: Session) -> Optional[User]:
    """
    Verify a password reset token.
    Returns the user if token is valid, None otherwise.
    """
    user = db.query(User).filter(User.reset_token == token).first()

    if not user:
        return None

    # Check if token has expired
    if user.reset_token_expires < datetime.utcnow():
        return None

    return user

def reset_password_with_token(token: str, new_password: str, db: Session) -> bool:
    """
    Reset a user's password using a valid token.
    Returns True if successful, False otherwise.
    """
    user = verify_reset_token(token, db)

    if not user:
        return False

    # Update password and clear reset token
    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()
    return True

def send_password_reset_email(email: str, otp: str):
    """
    Send password reset OTP to user via email.
    For now, this just logs the OTP.
    In production, integrate with an email service.
    """
    # For development: print to console
    print("=" * 60)
    print("PASSWORD RESET OTP")
    print("=" * 60)
    print(f"To: {email}")
    print(f"OTP: {otp}")
    print("=" * 60)
    print("\nNote: In production, this should send an actual email.")
    print("For now, use the OTP above to reset your password.\n")

    # For production: Send actual email

    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    # Email configuration from environment variables
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")  # Your email
    smtp_password = os.getenv("SMTP_PASSWORD")  # Your app password
    from_email = os.getenv("FROM_EMAIL", smtp_username)

    # Create email message
    message = MIMEMultipart("alternative")
    message["Subject"] = "Password Reset OTP"
    message["From"] = f"School Management System <{from_email}>"
    message["To"] = email

    # Email body (HTML)
    html = f'''
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #16a34a; font-size: 36px; letter-spacing: 8px; margin: 0;">{otp}</h1>
        </div>
        <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this, please ignore this email.
        </p>
      </body>
    </html>
    '''

    # Attach HTML content
    part = MIMEText(html, "html")
    message.attach(part)

    # Send email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(from_email, email, message.as_string())
        print(f"SUCCESS: Password reset OTP sent to {email}")
    except Exception as e:
        print(f"ERROR: Failed to send email: {e}")

