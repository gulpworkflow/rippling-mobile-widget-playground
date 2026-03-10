import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OVERRIDE_DIR = path.resolve(__dirname, 'src/overrides');

export default defineConfig({
  plugins: [
    {
      name: 'force-full-reload',
      enforce: 'post',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
          console.log(`  🔄 Full reload: ${path.basename(file)}`);
          server.ws.send({ type: 'full-reload', path: '*' });
          return [];
        }
      },
    },
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  server: {
    port: 4201,
    headers: {
      'Cache-Control': 'no-store',
    },
    watch: {
      usePolling: true,
      interval: 500,
    },
  },
  resolve: {
    alias: [
      // Local workspace alias
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
      
      // Smart override system: Only intercepts when override exists in src/overrides
      // Otherwise falls back to node_modules (no monorepo required)
      {
        find: /^@rippling\/pebble\/(.+)$/,
        customResolver(source, importer, options) {
          // Only handle imports that match our pattern
          const match = source.match(/^@rippling\/pebble\/(.+)$/);
          if (!match) return null;
          
          const componentPath = match[1];
          const overrideBase = path.resolve(OVERRIDE_DIR, componentPath);
          const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
          
          // Check if override exists as a file
          for (const ext of extensions) {
            const overridePath = overrideBase + ext;
            if (fs.existsSync(overridePath) && fs.statSync(overridePath).isFile()) {
              console.log(`  🎨 Using override: ${componentPath}${ext}`);
              return overridePath;
            }
          }
          
          // Check if override exists as a directory with index file
          if (fs.existsSync(overrideBase) && fs.statSync(overrideBase).isDirectory()) {
            for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
              const indexPath = path.resolve(overrideBase, `index${ext}`);
              if (fs.existsSync(indexPath)) {
                console.log(`  🎨 Using override: ${componentPath}/index${ext}`);
                return overrideBase;
              }
            }
          }
          
          // No override found - let Vite use normal resolution (node_modules)
          return null;
        },
      },
    ],
  },
  define: {
    'process.env': {},
    'process.platform': JSON.stringify(''),
    'process.version': JSON.stringify(''),
  },
});


