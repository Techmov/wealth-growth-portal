
const { execSync } = require('child_process');

console.log('Starting dependency installation process...');

// Install necessary packages
try {
  console.log('Installing React dependencies...');
  execSync('npm install react react-dom react-router-dom', { stdio: 'inherit' });
  
  console.log('Installing utility libraries...');
  execSync('npm install date-fns sonner lucide-react', { stdio: 'inherit' });
  
  console.log('Installing dev dependencies...');
  execSync('npm install --save-dev @types/react @types/react-dom @types/node vite', { stdio: 'inherit' });
  
  console.log('Installation complete! Running npm run dev...');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during installation:', error);
  
  console.log('\n\nTrying to fix Vite specifically...');
  try {
    execSync('npm install --save-dev vite@latest @vitejs/plugin-react-swc', { stdio: 'inherit' });
    console.log('Vite installed successfully. Please run "npm run dev" to start the development server');
  } catch (viteError) {
    console.error('Error installing Vite:', viteError);
  }
}
