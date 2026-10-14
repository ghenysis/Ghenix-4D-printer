import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function mockupApiPlugin() {
  return {
    name: 'mockup-api-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/render-3d-mockup', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  jobId,
                  timestamp: new Date().toISOString(),
                  processingTimeMs: 84,
                  config: {
                    garmentType: data.garmentType || 'tshirt-oversize',
                    colorHex: data.colorHex || '#18181B',
                    placement: data.placement || 'chest-center',
                    lighting: data.lighting || 'softbox',
                    imageUrl: data.imageUrl || ''
                  },
                  renders: [
                    { angle: 'front', label: 'Vue de Face (Packshot)', url: data.imageUrl || '' },
                    { angle: 'back', label: 'Vue de Dos', url: data.imageUrl || '' },
                    { angle: 'three-quarter-left', label: 'Perspective 3/4 Gauche', url: data.imageUrl || '' },
                    { angle: 'three-quarter-right', label: 'Perspective 3/4 Droit', url: data.imageUrl || '' },
                    { angle: 'macro-detail', label: 'Gros Plan Macro Texture', url: data.imageUrl || '' }
                  ],
                  interactiveViewer: {
                    url: `/#moteur-3d?job=${jobId}`,
                    embedHtml: `<div id="ghenix-3d-mockup-${jobId}"></div>`,
                    embedIframe: `<iframe src="/embed/3d-viewer?job=${jobId}" width="100%" height="600" style="border:none;border-radius:16px;"></iframe>`
                  },
                  meta: {
                    format: 'image/png',
                    dimensions: '2048x2048',
                    colorSpace: 'sRGB (Display-P3 calibrated)'
                  }
                })
              );
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
          });
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'POST to this endpoint to render 3D mockups' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mockupApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

