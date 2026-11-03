const { spawn } = require('child_process');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('[System] Menjalankan Backend & Frontend bersamaan...');

const backend = spawn(npmCmd, ['run', 'dev', '--prefix', 'backend'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev', '--prefix', 'frontend'], {
  stdio: 'inherit',
  shell: true,
});

const shutdown = () => {
  try {
    backend.kill();
    frontend.kill();
  } catch {}
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
