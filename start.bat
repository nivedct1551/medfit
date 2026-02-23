@echo off
echo Starting CircleCare Hackathon MVP...

echo Installing backend dependencies (just in case)...
cd backend
call npm install
echo Starting backend...
start "CircleCare Backend" cmd /c "npx nodemon src/server.js"

echo Installing frontend dependencies...
cd ../frontend
call npm install
echo Starting frontend...
start "CircleCare Frontend" cmd /c "npm run dev -- --open"

echo Both services are starting!
pause
