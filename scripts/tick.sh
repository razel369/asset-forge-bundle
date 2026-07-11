# Persistent loop harness. Spawns scripts/loop.js in a child process repeatedly,
# sleeping between iterations. Self-restarts if it crashes.

@echo off
:loop
  echo [%date% %time%] loop tick
  node scripts/loop.js
  echo [%date% %time%] sleeping 300s
  timeout /t 300 /nobreak >nul
  goto loop
