#!/bin/bash
set -e

# Set environment variable to prevent tokenizer deadlock warnings
export TOKENIZERS_PARALLELISM=false

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL is ready!"

# Check if Firebase credentials exist, but don't create them if missing
if [ ! -z "$FIREBASE_CREDENTIALS" ] && [ ! -f "$FIREBASE_CREDENTIALS" ]; then
    echo "Warning: Firebase credentials file not found at $FIREBASE_CREDENTIALS. Continuing without Firebase credentials..."
fi



# Preload embedding models to avoid runtime issues
echo "Preloading embedding models..."
python scripts/preload_models.py
if [ $? -eq 0 ]; then
    echo "Models preloaded successfully!"
else
    echo "Warning: Model preloading failed. Continuing anyway..."
fi

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Use only 2 workers to reduce resource usage and database connection issues
WORKERS=1

# Start the application with Gunicorn
echo "Starting FastAPI application with Gunicorn ($WORKERS workers)..."
gunicorn app.main:app \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --log-level info \
    --access-logfile - \
    --error-logfile - \
    --preload