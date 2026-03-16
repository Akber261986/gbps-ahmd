# password_reset.py
import secrets
import os
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from models import User
from auth import get_password_hash

def generate_reset_token() -> str:
    """Generate a secure random token for password reset."""
    return secrets.token_urlsafe(32)

def create_password_reset_token(email: str, db: Session) -> Optional[str]:
    """
    Create a password reset token for a user.
    Returns the token if successful, None if user not found.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    # Don't allow password reset for OAuth users
    if user.oauth_provider:
        return None

    # Generate token and set expiration (1 hour)
    token = generate_reset_token()
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)

    db.commit()
    return token

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

def send_password_reset_email(email: str, token: str):
    """
    Send password reset email to user.
    For now, this just logs the reset link.
    In production, integrate with an email service.
    """
    # Use environment variable for frontend URL, default to localhost:3001
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
    reset_link = f"{frontend_url}/reset-password?token={token}"

    # For development: print to console
    print("=" * 60)
    print("PASSWORD RESET EMAIL")
    print("=" * 60)
    print(f"To: {email}")
    print(f"Reset Link: {reset_link}")
    print("=" * 60)
    print("\nNote: In production, this should send an actual email.")
    print("For now, copy the link above to reset your password.\n")

    # For production: Uncomment the code below and configure SMTP settings
    
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
    message["Subject"] = "Password Reset Request"
    message["From"] = f"School Management System <{from_email}>"
    message["To"] = email

    # Email body (HTML)
    html = f'''
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="{reset_link}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">{reset_link}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
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
        print(f"SUCCESS: Password reset email sent to {email}")
    except Exception as e:
        print(f"ERROR: Failed to send email: {e}")

