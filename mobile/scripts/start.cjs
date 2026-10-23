const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const frontendDir = path.resolve(__dirname, '../FE');
const backendDir = path.resolve(__dirname, '../../app/BE');
const children = new Set();
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}

function launch(file, args, cwd, interactive) {
  const child = spawn(process.execPath, [file, ...args], {
    cwd,
    env: process.env,
    stdio: interactive ? 'inherit' : ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
  });
  children.add(child);
  child.on('error', error => {
    console.error(`[mobile] ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!stopping) {
      if (!interactive) console.error(`[mobile] Backend stopped (${signal || code}).`);
      stop(code ?? (signal ? 1 : 0));
    }
  });
  return child;
}

async function healthy(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok && (await response.json()).ok === true;
  } catch {
    return false;
  }
}

async function main() {
  // Parse the BE environment without copying database credentials into Expo's environment.
  const dotenv = require(require.resolve('dotenv', { paths: [backendDir] }));
  const envFile = path.join(backendDir, '.env');
  const backendEnv = fs.existsSync(envFile) ? dotenv.parse(fs.readFileSync(envFile)) : {};
  const port = Number(process.env.PORT || backendEnv.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid backend PORT.');
  const healthUrl = `http://127.0.0.1:${port}/api/health`;
  const expoCli = require.resolve('expo/bin/cli', { paths: [frontendDir] });

  if (await healthy(healthUrl)) {
    console.log(`[mobile] Using the backend already running on port ${port}.`);
  } else {
    console.log(`[mobile] Starting backend on port ${port}...`);
    launch(path.join(backendDir, 'server.js'), [], backendDir, false);
    const deadline = Date.now() + 30000;
    let ready = false;
    while (!stopping && Date.now() < deadline) {
      if (await healthy(healthUrl)) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    if (stopping) return;
    if (!ready) throw new Error('Backend did not become ready within 30 seconds. Check its database connection.');
  }

  if (stopping) return;
  console.log('[mobile] Backend ready. Starting Expo (Ctrl+C stops this session).');
  launch(expoCli, ['start', ...process.argv.slice(2)], frontendDir, true);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

main().catch(error => {
  console.error(`[mobile] ${error.message}`);
  stop(1);
});
