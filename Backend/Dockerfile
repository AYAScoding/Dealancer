FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY core/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

WORKDIR /app/core

# Render uses the PORT environment variable. We default to 8000.
ENV PORT=8000
EXPOSE $PORT

# Start the server using the PORT variable. Runs migrations automatically first.
CMD sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT"
