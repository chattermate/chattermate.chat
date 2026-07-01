"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import firebase_admin
from firebase_admin import credentials, messaging, initialize_app, get_app
from app.core.config import settings
import json
from app.repositories.user import UserRepository
from app.core.logger import get_logger
import os
from firebase_admin.exceptions import FirebaseError

logger = get_logger(__name__)


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        try:
            get_app()
            logger.info("Firebase already initialized")
            return
        except ValueError:
            logger.info("Initializing Firebase...")

        # Get credentials file path
        cred_path = settings.FIREBASE_CREDENTIALS

        if not cred_path or not os.path.isfile(cred_path):
            logger.warning(f"Firebase credentials not found at {cred_path}. Running in development mode.")
            # Use a default configuration for development
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": "demo-project",
                "private_key_id": "demo123456789",
                "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDK/eDH0MDgBNHs\nYuXwHMnMYGz+86YJjYoXVbKdUGHQZXYVEVlc8rYA+VXbU1AqhD+c7yT9V9EaEjPO\nXGVWS6dWQh4Kh5g7y1O5SHIwQhDHK+AAqMgBfZhzEHJBtO8CXG8TDyxhfHXxjWpD\nGPz/RJ7GhW9cHYQOvP4yZAp3ZNGYQJwUlhNLGr80XEhGVlkZ5WPL0YFzwOxvqGQs\nQVVxGGj5h7YHJt1YmZwF6cBGGX8AUetJkMTgQEJSNsaK4Pl+MZUGQOhQEynK3qO2\nWf+7XZl4XPx9Qw+WPYEoHHlGgGQR4YUpL+qzVxYwNAXhVxd9k+YPp5JZHtGQAXeO\nZhxDo1QLAgMBAAECggEABBj/H/JGXuVGoCjR6J0XF+kQTOuTgZBvgapkpPTYwfXQ\nPRKzGWEpGUPVnVb3gMDqbqQe7EVJZ8Nj/zHmXf9c4qKxpXwNl7kYmPpuQOHmA8Nq\nXPE3QZH3YSRz1YXF/pA9RQqG5F4JBJjz5LcUR+ax9aSxPu26xwDHOpR4EIR9Aovx\nJfcg7MTAY4YuGBe0oLQbEWoUQqXgUIVEzWcqiDGXF0uuMZzpW6YVk5ZvWHXz7SVK\nE7e1XQN6sMTYqrmnFGkBhuvXiBkPZHsOEHBVxXVqytE8FJAqXwPwFqxWj4RhNS/w\nkMUv5ZyH6UOFuBXtSe1XGGEqktNVGPBhAkEo4BbhAQKBgQD1+fdC9zzDwA4KoNnk\nVxQbCpC7Zr5F8Mycer0SV/3Gg6okzo9vXl+vqVHXqYNGnAEFkLLhEzwpZB0cnqWk\nQswrGvZ5FvUSKd7rMfI0Uh5FxhYCuUwwZW6gVKEZDCXF6N7KBbMPaYVZuGwD7oQk\nUQKBgQDTKj+RKqFrwhZM4cVJVgqHgQmMvHXC7Hy3Sj8Yl9ZHxgsnrkoNXXXRDNwp\nEWVoTy4Xr1BXuBxFEgEBpuPGBlHVXLZRzaP1pCZVqftxiHDqGlAh4y3yZtKHSTGj\n1B6OZlYXxvD+9K5Ki1ZwM3JxpY4YE5zASL7cUrV+gUUE2VoengKBgQDxIrXXFR8l\nAgMBAAECggEABBj/H/JGXuVGoCjR6J0XF+kQTOuTgZBvgapkpPTYwfXQ\n-----END PRIVATE KEY-----\n",
                "client_email": "firebase-adminsdk-demo@demo-project.iam.gserviceaccount.com",
                "client_id": "123456789",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-demo%40demo-project.iam.gserviceaccount.com",
                "universe_domain": "googleapis.com"
            })
        else:
            logger.info("Loading Firebase credentials from file " + cred_path)
            cred = credentials.Certificate(cred_path)
        
        initialize_app(cred)
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing Firebase: {str(e)}")
        logger.warning("Continuing without Firebase initialization")
        


async def send_firebase_notification(notification, db):
    """Send notification through Firebase Cloud Messaging"""
    try:
        # Get user's FCM token from database
        user_repo = UserRepository(db)
        user_token = user_repo.get_user_fcm_token(notification.user_id)
        
        if not user_token:
            logger.warning(f"No FCM token found for user {notification.user_id}")
            return

        # Create the message payload
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=notification.title,
                    body=notification.message,
                ),
                data={
                    "type": notification.type,
                    "id": str(notification.id),
                    "metadata": json.dumps(notification.metadata)
                },
                token=user_token,
            )
        except Exception as e:
            logger.error(f"Error creating Firebase message payload: {str(e)}")
            return

        try:
            response = messaging.send(message)
            logger.info(f"Successfully sent notification {notification.id} to user {notification.user_id}: {response}")
        except FirebaseError as e:
            error_msg = str(e.cause) if e.cause else str(e)
            logger.error(f"Firebase API error while sending notification {notification.id}: {error_msg}")
        except Exception as e:
            logger.error(f"Unexpected error sending notification {notification.id}: {str(e)}")

    except Exception as e:
        logger.error(f"Error in send_firebase_notification: {str(e)}")
