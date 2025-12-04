# Dockerfile for Google Cloud Run - serves static files using Python's http.server
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Copy project files into the container
COPY . /app

# Port Cloud Run expects the app to listen on (default 8080)
ENV PORT 8080
EXPOSE 8080

# Start a simple static file server that listens on $PORT
CMD ["sh", "-c", "python -m http.server ${PORT}"]
