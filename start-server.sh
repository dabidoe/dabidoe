#!/bin/bash
# Start a local web server for testing
# Run this from the dabidoe directory, then open http://localhost:8000/test-enhanced-features.html

echo "🚀 Starting local web server..."
echo "📂 Serving files from: $(pwd)"
echo "🌐 Open in browser: http://localhost:8000/test-enhanced-features.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
python3 -m http.server 8000
