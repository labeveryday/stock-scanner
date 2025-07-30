const { spawn } = require('child_process');
const { createServer } = require('vite');
const path = require('path');

async function startDev() {
  console.log('Starting development environment...');
  
  // Start Vite dev server
  const vite = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
    root: path.resolve(__dirname, '../src/renderer'),
    server: {
      port: 3000
    }
  });
  
  await vite.listen();
  const info = vite.config.server;
  const port = info.port || 3000;
  
  console.log(`Vite dev server running on http://localhost:${port}`);
  
  // Set environment variable for Electron
  process.env.VITE_DEV_SERVER_URL = `http://localhost:${port}`;
  process.env.NODE_ENV = 'development';
  
  // Build main process
  console.log('Building main process...');
  const tsc = spawn('npx', ['tsc', '-p', 'tsconfig.main.json'], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  tsc.on('close', (code) => {
    if (code === 0) {
      console.log('Starting Electron...');
      // Start Electron
      const electron = spawn('npx', ['electron', 'dist/main/main.js'], {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, VITE_DEV_SERVER_URL: `http://localhost:${port}` }
      });
      
      electron.on('close', () => {
        console.log('Electron closed, shutting down Vite...');
        vite.close();
        process.exit(0);
      });
    } else {
      console.error('TypeScript compilation failed');
      vite.close();
      process.exit(1);
    }
  });
}

startDev().catch(console.error);