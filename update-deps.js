
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting dependency update process...');

try {
  // Install core dependencies
  console.log('Installing core dependencies...');
  execSync('npm install react react-dom react-router-dom date-fns sonner', { stdio: 'inherit' });
  
  // Install UI libraries
  console.log('Installing UI libraries...');
  execSync('npm install lucide-react @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-slot class-variance-authority', { stdio: 'inherit' });
  
  // Install dev dependencies
  console.log('Installing dev dependencies...');
  execSync('npm install --save-dev @types/react @types/react-dom @types/node vite@latest @vitejs/plugin-react-swc typescript', { stdio: 'inherit' });
  
  console.log('Dependencies updated successfully!');
} catch (error) {
  console.error('Error updating dependencies:', error);
  console.log('Please try installing the packages manually:');
  console.log('npm install react react-dom react-router-dom date-fns sonner lucide-react @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-slot class-variance-authority');
  console.log('npm install --save-dev @types/react @types/react-dom @types/node vite @vitejs/plugin-react-swc typescript');
}
