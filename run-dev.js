const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '   Starting Kalptaj Clone Full-Stack App...      ');
console.log('\x1b[36m%s\x1b[0m', '==================================================');

// Start backend on port 5000
console.log('\x1b[33m%s\x1b[0m', '🚀 Launching Backend API (port 5000)...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// Start frontend on port 5173
console.log('\x1b[32m%s\x1b[0m', '💻 Launching React Frontend (port 5173)...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

// Process Management
backend.on('close', (code) => {
  console.log(`Backend server stopped (exit code: ${code})`);
  frontend.kill();
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`Frontend dev server stopped (exit code: ${code})`);
  backend.kill();
  process.exit(code);
});

// Capture Ctrl+C cleanly
process.on('SIGINT', () => {
  console.log('\nStopping servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});
