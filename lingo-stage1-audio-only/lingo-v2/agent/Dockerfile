# Use a version of Python that supports your libraries
FROM python:3.11-slim

# Install system tools needed for audio and building packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the requirements first (helps with faster builds)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the agent code
COPY . .

# Start the agent using the 'start' command for production
CMD ["python", "agent.py", "start"]
