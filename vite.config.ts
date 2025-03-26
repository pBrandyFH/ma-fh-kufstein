import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // Use '@' as an alias for 'src'
      utils: resolve(__dirname, "src/utils"), // Optional: Alias for utils
      components: resolve(__dirname, "src/components"), // Optional: Alias for components
    },
  },
});
