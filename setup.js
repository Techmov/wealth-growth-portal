
const { execSync } = require('child_process');

console.log('Starting complete setup process...');

try {
  console.log('\nStep 1: Running update-deps.js...');
  execSync('node update-deps.js', { stdio: 'inherit' });

  console.log('\nStep 2: Running fix-tsconfig.js...');
  execSync('node fix-tsconfig.js', { stdio: 'inherit' });

  console.log('\nStep 3: Running ensure-vite.js...');
  execSync('node ensure-vite.js', { stdio: 'inherit' });

  console.log('\nSetup completed successfully!');
  console.log('You can now run "npm run dev" to start the development server.');
} catch (error) {
  console.error('Error during setup:', error);
  console.log('\nPlease try running each script separately:');
  console.log('1. node update-deps.js');
  console.log('2. node fix-tsconfig.js');
  console.log('3. node ensure-vite.js');
}
