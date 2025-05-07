
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting process to fix dependencies...');

try {
  // Install core dependencies
  console.log('Installing core dependencies...');
  execSync('npm install react@18.3.1 react-dom@18.3.1 react-router-dom@6.26.2 date-fns@3.6.0 sonner@1.5.0 lucide-react@0.462.0 @radix-ui/react-accordion@1.2.0 @radix-ui/react-alert-dialog@1.1.1 @radix-ui/react-aspect-ratio@1.1.0 @radix-ui/react-avatar@1.1.0 @radix-ui/react-slot@1.1.0 class-variance-authority@0.7.1 --force', { stdio: 'inherit' });
  
  // Install dev dependencies
  console.log('Installing dev dependencies...');
  execSync('npm install --save-dev @types/react@18.3.1 @types/react-dom@18.3.1 @types/node vite@latest @vitejs/plugin-react-swc typescript --force', { stdio: 'inherit' });
  
  console.log('Adding types declaration for modules...');
  if (!fs.existsSync('./src/types')) {
    fs.mkdirSync('./src/types', { recursive: true });
  }
  
  console.log('Dependencies updated successfully!');
  console.log('Now run: npm run dev');
} catch (error) {
  console.error('Error updating dependencies:', error);
  console.log('Please try installing the packages manually');
}
