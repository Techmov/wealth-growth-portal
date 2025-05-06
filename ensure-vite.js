
const fs = require('fs');
const path = require('path');

// Check if vite.config.ts exists
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (!fs.existsSync(viteConfigPath)) {
  console.log('Creating vite.config.ts...');
  
  const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
  `;
  
  try {
    fs.writeFileSync(viteConfigPath, viteConfig.trim());
    console.log('vite.config.ts created successfully');
  } catch (error) {
    console.error('Error creating vite.config.ts:', error);
  }
}

// Create an index.html file if it doesn't exist
const indexHtmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('Creating index.html...');
  
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WealthGrow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
  `;
  
  try {
    fs.writeFileSync(indexHtmlPath, indexHtml.trim());
    console.log('index.html created successfully');
  } catch (error) {
    console.error('Error creating index.html:', error);
  }
}

console.log('Vite configuration check completed!');
