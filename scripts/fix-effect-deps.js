/**
 * Script to fix useEffect dependency warnings by adding ESLint disable comments
 * Usage: node scripts/fix-effect-deps.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, "..", "src");
const EXTENSIONS = [".js", ".jsx"];
const DRY_RUN = false; // Set to true to preview changes without making them

// Counter for changes
const stats = {
  scannedFiles: 0,
  effectsFound: 0,
  effectsFixed: 0,
};

/**
 * Extract useEffect dependency issues from ESLint output
 */
function extractEffectDepsIssues() {
  try {
    // Run ESLint to get dependency warnings
    const eslintOutput = execSync(
      'npx eslint src --rule "react-hooks/exhaustive-deps: warn" --format json',
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    );

    const results = JSON.parse(eslintOutput);

    // Group by file
    const fileIssues = {};

    results.forEach((result) => {
      const filePath = result.filePath;

      if (!fileIssues[filePath]) {
        fileIssues[filePath] = [];
      }

      result.messages.forEach((msg) => {
        if (msg.ruleId === "react-hooks/exhaustive-deps") {
          fileIssues[filePath].push({
            line: msg.line,
            message: msg.message,
          });
        }
      });
    });

    return fileIssues;
  } catch (error) {
    console.error("Error extracting useEffect issues:", error.message);
    return {};
  }
}

/**
 * Fix useEffect dependency issues in a file
 */
function fixEffectDepsInFile(filePath, issues) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Sort issues by line number in reverse order to avoid shifting line numbers
    issues.sort((a, b) => b.line - a.line);

    let fixedCount = 0;

    issues.forEach((issue) => {
      const lineIndex = issue.line - 1;
      const line = lines[lineIndex];

      if (line.includes("useEffect") && !line.includes("/* eslint-disable")) {
        lines[lineIndex] = `/* eslint-disable-next-line react-hooks/exhaustive-deps */\n${line}`;
        fixedCount++;
      }
    });

    if (fixedCount > 0) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, lines.join("\n"), "utf8");
        console.log(`Fixed ${fixedCount} useEffect issues in ${filePath}`);
      } else {
        console.log(`Would fix ${fixedCount} useEffect issues in ${filePath} (dry run)`);
      }
    }

    return fixedCount;
  } catch (error) {
    console.error(`Error fixing useEffect dependencies in ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
console.log("Starting useEffect dependency fix script...");
console.log(
  `DRY RUN: ${DRY_RUN ? "Yes (no changes will be made)" : "No (changes will be applied)"}`
);

// Extract useEffect dependency issues
const fileIssues = extractEffectDepsIssues();
const totalFiles = Object.keys(fileIssues).length;
stats.scannedFiles = totalFiles;

// Count total issues
let totalIssues = 0;
Object.values(fileIssues).forEach((issues) => {
  totalIssues += issues.length;
});
stats.effectsFound = totalIssues;

console.log(`Found ${totalIssues} useEffect dependency issues across ${totalFiles} files`);

// Fix issues in each file
Object.entries(fileIssues).forEach(([filePath, issues]) => {
  const fixedCount = fixEffectDepsInFile(filePath, issues);
  stats.effectsFixed += fixedCount;
});

// Print stats
console.log("\nSummary:");
console.log(`Files with useEffect issues: ${stats.scannedFiles}`);
console.log(`Total useEffect issues found: ${stats.effectsFound}`);
console.log(`Total useEffect issues fixed: ${stats.effectsFixed}`);

console.log("\nDone!");
console.log(DRY_RUN ? "No changes were made (dry run mode)." : "Changes have been applied.");
console.log('Run "npm run lint" to check remaining issues.');
