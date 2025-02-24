"""
ChatterMate - Email Service
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from datetime import datetime
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
        self.is_local = os.getenv('ENVIRONMENT', 'local') == 'local' or os.getenv('ENVIRONMENT', 'local') == 'development'

    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None):
        """Send email using SMTP"""
        try:
            # Create message container
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Add plain text version if provided
            if text_content:
                msg.attach(MIMEText(text_content, 'plain'))

            # Add HTML version
            msg.attach(MIMEText(html_content, 'html'))

            # In local environment, just print the email content
            if self.is_local:
                logger.info("Local environment detected - Not sending actual email")
                logger.info(f"Would send email to: {to_email}")
                logger.info(f"Subject: {subject}")
                logger.info(f"Content: {text_content if text_content else html_content}")
                return True

            # Create SMTP connection with timeout
            try:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
                    logger.info(f"Email sent successfully to {to_email}")
                    return True
            except Exception as e:
                logger.error(f"SMTP Error: {str(e)}")
                raise
            finally:
                try:
                    server.quit()
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            raise

async def send_verification_email(email: str, otp: str):
    """Send verification email with OTP"""
    email_service = EmailService()
    subject = "Verify your email - ChatterMate"
    
    # Plain text version
    text_content = f"""
    Welcome to ChatterMate!
    
    Your verification code is: {otp}
    
    This code will expire in 5 minutes.
    
    If you didn't request this code, please ignore this email.
    
    Best regards,
    The ChatterMate Team
    """
    
    # If in local environment, print the OTP prominently
    if email_service.is_local:
        logger.info("=" * 50)
        logger.info(f"LOCAL ENVIRONMENT - OTP for {email}: {otp}")
        logger.info("=" * 50)
    
    # HTML version with matching website styles
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 
                    'Helvetica Neue', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background-color: #000000;
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }}
            .logo {{
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                background: linear-gradient(to right, #f34611, #62CFE5);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: inline-block;
            }}
            .content {{
                padding: 30px;
                color: #000000;
            }}
            .otp-code {{
                background-color: #f8f8f8;
                border: 2px solid #f34611;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                color: #f34611;
                letter-spacing: 5px;
            }}
            .note {{
                font-size: 14px;
                color: #666666;
                margin-top: 20px;
                text-align: center;
            }}
            .footer {{
                background-color: #f8f8f8;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ChatterMate</div>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Welcome to ChatterMate!</h2>
                <p>Please use the following verification code to complete your registration:</p>
                <div class="otp-code">{otp}</div>
                <p class="note">This code will expire in 5 minutes.<br>
                If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                &copy; 2024 ChatterMate. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    
    await email_service.send_email(
        to_email=email,
        subject=subject,
        html_content=html_content,
        text_content=text_content
    ) 