#!/bin/bash
cd "$(dirname "$0")"

echo "XiangYunMaZhao - Starting server..."
echo "Opening http://localhost:8888"
echo "Close this window to stop."

# Try Python
if command -v python3 &> /dev/null; then
    open http://localhost:8888
    python3 -m http.server 8888
elif command -v python &> /dev/null; then
    open http://localhost:8888
    python -m http.server 8888
elif command -v npx &> /dev/null; then
    open http://localhost:8888
    npx serve -p 8888 -s .
else
    echo "No Python/Node found. Opening directly..."
    open index.html
fi
