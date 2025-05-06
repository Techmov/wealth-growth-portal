
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting dependency update process...');

// Check if vite is installed globally
console.log('Checking Vite installation...');
try {
  const result = execSync('npm list -g vite', { stdio: 'pipe' }).toString();
  if (result.includes('vite@')) {
    console.log('Vite is installed globally');
  } else {
    console.log('Vite is not installed globally');
  }
} catch (error) {
  console.log('Vite is not installed globally');
}

// Install missing type definitions
const requiredTypes = [
  '@types/react',
  '@types/react-dom',
  '@types/node'
];

console.log('Installing required type definitions...');
try {
  execSync(`npm install --save-dev ${requiredTypes.join(' ')}`, { stdio: 'inherit' });
  console.log('Type definitions installed successfully');
} catch (error) {
  console.error('Error installing type definitions:', error);
}

// Check and update Vite and related packages
console.log('Ensuring Vite and related packages are installed...');
try {
  execSync('npm install --save-dev vite @vitejs/plugin-react-swc', { stdio: 'inherit' });
  console.log('Vite and related packages installed/updated successfully');
} catch (error) {
  console.error('Error installing Vite and related packages:', error);
}

// Check and update React and related packages
console.log('Ensuring React and related packages are up-to-date...');
try {
  execSync('npm install react react-dom react-router-dom date-fns sonner lucide-react', { stdio: 'inherit' });
  console.log('React and related packages updated successfully');
} catch (error) {
  console.error('Error updating React and related packages:', error);
}

// Add npm script to run vite if not already present
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts || !packageJson.scripts.dev) {
      console.log('Adding "dev" script to package.json...');
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      packageJson.scripts.dev = 'vite';
      packageJson.scripts.build = 'vite build';
      packageJson.scripts.preview = 'vite preview';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Added "dev" script to package.json');
    }
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

console.log('Dependency update completed!');
console.log('Please run "npm run dev" to start the development server');
