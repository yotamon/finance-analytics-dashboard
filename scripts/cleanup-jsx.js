/**
 * Script to remove original JSX files after successful TSX conversion
 * Only run this after confirming all TypeScript components work correctly!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENTS_DIR = path.join(__dirname, '../src/components/dashboard');
const BACKUP_DIR = path.join(__dirname, '../src/components/dashboard/jsx-backup');

// Get all JSX files in the dashboard directory
const jsxFiles = fs.readdirSync(COMPONENTS_DIR)
  .filter(file => file.endsWith('.jsx'));

console.log(`Found ${jsxFiles.length} JSX files to remove`);

// Process each file
jsxFiles.forEach(file => {
  const jsxPath = path.join(COMPONENTS_DIR, file);
  const tsxPath = path.join(COMPONENTS_DIR, file.replace('.jsx', '.tsx'));

  // Only remove if the TSX file exists
  if (fs.existsSync(tsxPath)) {
    try {
      fs.unlinkSync(jsxPath);
      console.log(`Removed: ${jsxPath}`);
    } catch (error) {
      console.error(`Error removing ${file}:`, error.message);
    }
  } else {
    console.log(`TSX version doesn't exist for ${file}, not removing`);
  }
});

console.log('\nCleanup complete!');
console.log('The original JSX files are still available in the backup directory:');
console.log(BACKUP_DIR);
