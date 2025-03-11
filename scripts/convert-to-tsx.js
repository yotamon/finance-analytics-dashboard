/**
 * Script to convert JSX files to TSX
 * This script copies JSX files to TSX with the same filename
 * It does not modify the content - that needs to be done manually
 * The purpose is just to create the initial TypeScript files
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENTS_DIR = path.join(__dirname, "../src/components/dashboard");
const BACKUP_DIR = path.join(__dirname, "../src/components/dashboard/jsx-backup");

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Get all JSX files in the dashboard directory
const jsxFiles = fs.readdirSync(COMPONENTS_DIR).filter((file) => file.endsWith(".jsx"));

console.log(`Found ${jsxFiles.length} JSX files to convert`);

// Process each file
jsxFiles.forEach((file) => {
  const jsxPath = path.join(COMPONENTS_DIR, file);
  const tsxPath = path.join(COMPONENTS_DIR, file.replace(".jsx", ".tsx"));
  const backupPath = path.join(BACKUP_DIR, file);

  console.log(`Converting: ${file}`);

  // Only proceed if the TSX file doesn't already exist
  if (fs.existsSync(tsxPath)) {
    console.log(`  TSX file already exists, skipping: ${tsxPath}`);
    return;
  }

  try {
    // Copy original to backup directory
    fs.copyFileSync(jsxPath, backupPath);
    console.log(`  Backed up original to: ${backupPath}`);

    // Create a new TSX file with the same content
    fs.copyFileSync(jsxPath, tsxPath);
    console.log(`  Created TypeScript file: ${tsxPath}`);

    // Add to Git (if Git is being used)
    try {
      execSync(`git add "${tsxPath}"`, { stdio: "ignore" });
    } catch (e) {
      // Silently ignore git errors - might not be a git repo
    }
  } catch (error) {
    console.error(`  Error processing ${file}:`, error.message);
  }
});

console.log("\nConversion complete!");
console.log("Next steps:");
console.log("1. Manually update each TSX file to add type definitions");
console.log("2. Test each component to ensure it works correctly");
console.log("3. Once confirmed working, you can delete the JSX files");
console.log("4. Run: node scripts/cleanup-jsx.js to remove original JSX files when ready");

// Also create a cleanup script to remove the JSX files after conversion is complete
const cleanupScriptPath = path.join(__dirname, "cleanup-jsx.js");
const cleanupScript = `/**
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

console.log(\`Found \${jsxFiles.length} JSX files to remove\`);

// Process each file
jsxFiles.forEach(file => {
  const jsxPath = path.join(COMPONENTS_DIR, file);
  const tsxPath = path.join(COMPONENTS_DIR, file.replace('.jsx', '.tsx'));

  // Only remove if the TSX file exists
  if (fs.existsSync(tsxPath)) {
    try {
      fs.unlinkSync(jsxPath);
      console.log(\`Removed: \${jsxPath}\`);
    } catch (error) {
      console.error(\`Error removing \${file}:\`, error.message);
    }
  } else {
    console.log(\`TSX version doesn't exist for \${file}, not removing\`);
  }
});

console.log('\\nCleanup complete!');
console.log('The original JSX files are still available in the backup directory:');
console.log(BACKUP_DIR);
`;

fs.writeFileSync(cleanupScriptPath, cleanupScript);
console.log(`\nCreated cleanup script: ${cleanupScriptPath}`);
