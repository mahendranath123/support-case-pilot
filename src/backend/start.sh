
#!/bin/bash

echo "Starting Support Tracker Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to the server directory
cd "$(dirname "$0")/server"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install express mysql2 cors
fi

# Start the server
echo "Starting server on port 3001..."
node server.js
