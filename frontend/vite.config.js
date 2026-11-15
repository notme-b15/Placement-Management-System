import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Enable the React JSX transform and Fast Refresh during development.
export default defineConfig({
  plugins: [react()]
});
