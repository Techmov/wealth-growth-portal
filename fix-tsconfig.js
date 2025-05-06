
const fs = require('fs');
const path = require('path');

console.log('Checking tsconfig files...');

const tsConfigPath = path.join(__dirname, 'tsconfig.json');
const tsConfigNodePath = path.join(__dirname, 'tsconfig.node.json');
const tempTsConfigPath = path.join(__dirname, 'tsconfig.temp.json');
const tempTsConfigNodePath = path.join(__dirname, 'tsconfig.node.temp.json');

// Function to check if we can modify a file
const canModifyFile = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
};

// Try to update tsconfig.json if it's not a read-only file
if (canModifyFile(tsConfigPath) && fs.existsSync(tempTsConfigPath)) {
  try {
    console.log('Updating tsconfig.json...');
    fs.copyFileSync(tempTsConfigPath, tsConfigPath);
    console.log('tsconfig.json updated successfully');
  } catch (error) {
    console.error('Error updating tsconfig.json:', error);
  }
}

// Try to update tsconfig.node.json if it's not a read-only file
if (canModifyFile(tsConfigNodePath) && fs.existsSync(tempTsConfigNodePath)) {
  try {
    console.log('Updating tsconfig.node.json...');
    fs.copyFileSync(tempTsConfigNodePath, tsConfigNodePath);
    console.log('tsconfig.node.json updated successfully');
  } catch (error) {
    console.error('Error updating tsconfig.node.json:', error);
  }
}

// Clean up temp files
try {
  if (fs.existsSync(tempTsConfigPath)) {
    fs.unlinkSync(tempTsConfigPath);
  }
  if (fs.existsSync(tempTsConfigNodePath)) {
    fs.unlinkSync(tempTsConfigNodePath);
  }
} catch (error) {
  console.error('Error cleaning up temporary files:', error);
}

console.log('Configuration check completed!');
