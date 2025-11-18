# --- CrewAI Dockerfile ---
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Systemabhängigkeiten für WeasyPrint installieren
RUN apt-get update && apt-get install -y \
    git \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libgobject-2.0-0 \
    libglib2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Pip upgraden
RUN pip install --upgrade pip

# Projekt kopieren
COPY . /app

# requirements.txt installieren
RUN pip install -r requirements.txt

# Pythonpath setzen, damit diy-Package gefunden wird
ENV PYTHONPATH=/app/diy/src

# Outputs-Verzeichnis erstellen
RUN mkdir -p /app/diy/src/diy/outputs

# Default Command
CMD ["python3"]
    