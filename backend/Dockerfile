FROM python:3.11-slim

WORKDIR /app/backend

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    gcc \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libgobject-2.0-0 \
    libglib2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy diy module and install its dependencies
COPY ../diy /app/diy
RUN pip install --no-cache-dir /app/diy

# Copy application
COPY . .

# Ensure Python can import the backend package
ENV PYTHONPATH=/app

# Create directories
RUN mkdir -p /app/diy/outputs

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

