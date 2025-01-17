import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsonfigpathes from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsonfigpathes()],
});
