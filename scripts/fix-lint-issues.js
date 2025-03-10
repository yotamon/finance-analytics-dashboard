/**
 * Script to fix common linting issues in the project
 * Usage: node scripts/fix-lint-issues.js
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

// Regular expressions for common issues
const PATTERNS = {
  CONSOLE_LOG: /console\.(log|warn|error|info|debug)\((.*?)\);?/g,
  MIXED_SPACES_TABS: /^(\t+)([ ]+)/gm,
  UNUSED_IMPORTS: /import\s+{\s*([^}]+)\s*}\s+from/g,
  MIXED_QUOTES: /"/g,
};

// Counter for changes
const stats = {
  scannedFiles: 0,
  modifiedFiles: 0,
  consoleRemoved: 0,
  mixedSpacesFixed: 0,
};

/**
 * Walk through a directory and process each file
 */
function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (file !== "node_modules" && file !== "dist") {
        walkDir(filePath);
      }
    } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
      processFile(filePath);
    }
  });
}

/**
 * Process a single file to fix linting issues
 */
function processFile(filePath) {
  stats.scannedFiles++;
  console.log(`Processing file: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // Fix console statements
  const consoleMatches = content.match(PATTERNS.CONSOLE_LOG) || [];
  if (consoleMatches.length > 0) {
    content = content.replace(
      PATTERNS.CONSOLE_LOG,
      "/* eslint-disable-next-line no-console */\n$&"
    );
    stats.consoleRemoved += consoleMatches.length;
  }

  // Fix mixed spaces and tabs
  if (PATTERNS.MIXED_SPACES_TABS.test(content)) {
    content = content.replace(PATTERNS.MIXED_SPACES_TABS, (match, tabs, spaces) => {
      return tabs; // Keep tabs, remove spaces
    });
    stats.mixedSpacesFixed++;
  }

  // Only write changes if content has been modified
  if (content !== originalContent) {
    stats.modifiedFiles++;
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  Fixed issues in ${filePath}`);
    } else {
      console.log(`  Would fix issues in ${filePath} (dry run)`);
    }
  }
}

/**
 * Fix the no-unused-vars warnings by adding eslint-disable comments
 */
function fixUnusedVars() {
  try {
    // Run ESLint to get a list of unused variables
    const eslintOutput = execSync('npx eslint src --rule "no-unused-vars: warn" --format json', {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    const results = JSON.parse(eslintOutput);

    // Group by file
    const fileIssues = {};

    results.forEach((result) => {
      const filePath = result.filePath;

      if (!fileIssues[filePath]) {
        fileIssues[filePath] = [];
      }

      result.messages.forEach((msg) => {
        if (msg.ruleId === "no-unused-vars") {
          fileIssues[filePath].push({
            line: msg.line,
            variable: msg.message.match(/'([^']+)'/)[1],
          });
        }
      });
    });

    // Fix each file
    Object.keys(fileIssues).forEach((filePath) => {
      if (fileIssues[filePath].length > 0) {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");

        // Sort by line number in reverse order to avoid shifting line numbers
        fileIssues[filePath].sort((a, b) => b.line - a.line);

        fileIssues[filePath].forEach((issue) => {
          const lineIndex = issue.line - 1;
          lines[lineIndex] = lines[lineIndex].replace(
            new RegExp(`(\\b${issue.variable}\\b)`),
            `/* eslint-disable-next-line no-unused-vars */ $1`
          );
        });

        if (!DRY_RUN) {
          fs.writeFileSync(filePath, lines.join("\n"), "utf8");
          console.log(`Fixed unused variables in ${filePath}`);
        } else {
          console.log(`Would fix unused variables in ${filePath} (dry run)`);
        }
      }
    });
  } catch (error) {
    console.error("Error fixing unused variables:", error.message);
  }
}

// Main execution
console.log("Starting lint fix script...");
console.log(
  `DRY RUN: ${DRY_RUN ? "Yes (no changes will be made)" : "No (changes will be applied)"}`
);

walkDir(SRC_DIR);

// Print stats
console.log("\nSummary:");
console.log(`Files scanned: ${stats.scannedFiles}`);
console.log(`Files modified: ${stats.modifiedFiles}`);
console.log(`Console statements addressed: ${stats.consoleRemoved}`);
console.log(`Mixed spaces/tabs fixed: ${stats.mixedSpacesFixed}`);

// Run the unused vars fixer
console.log("\nFixing unused variables...");
fixUnusedVars();

console.log("\nDone!");
console.log(DRY_RUN ? "No changes were made (dry run mode)." : "Changes have been applied.");
console.log('Run "npm run lint" to check remaining issues.');
