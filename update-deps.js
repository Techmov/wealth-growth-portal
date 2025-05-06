
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting dependency update process...');

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

// Check and update Vite
console.log('Ensuring Vite is installed...');
try {
  execSync('npm install --save-dev vite', { stdio: 'inherit' });
  console.log('Vite installed/updated successfully');
} catch (error) {
  console.error('Error installing Vite:', error);
}

console.log('Dependency update completed!');
console.log('Please run "npm run dev" to start the development server');
