import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsonfigpathes from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true, // Enable WebSockets
                changeOrigin: true,
            },
        },
    },
    plugins: [react(), tsonfigpathes()],
    css: {},
});
