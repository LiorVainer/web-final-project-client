import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsonfigpathes from 'vite-tsconfig-paths';
import { AntdResolve, createStyleImportPlugin } from 'vite-plugin-style-import';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createStyleImportPlugin({
    libs: [
      {
        libraryName: 'antd',
        esModule: true,
        resolveStyle: (name) => `antd/es/${name}/style/index`,
      },
    ],
    resolves: [AntdResolve()]
  }), tsonfigpathes()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "/src/theme/_theme.scss";`,
      },
    },
  },
});
