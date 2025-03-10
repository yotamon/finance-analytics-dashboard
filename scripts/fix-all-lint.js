/**
 * Script to run all linting fix scripts in sequence
 * Usage: node scripts/fix-all-lint.js
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = false; // Set to true to preview changes without making them

// Make sure all scripts are set to the same dry run mode
function updateDryRunMode(scriptPath, dryRunMode) {
  const content = fs.readFileSync(scriptPath, "utf8");
  const updatedContent = content.replace(
    /const DRY_RUN = (true|false)/,
    `const DRY_RUN = ${dryRunMode}`
  );
  fs.writeFileSync(scriptPath, updatedContent, "utf8");
}

// Scripts to run in order
const scripts = [
  {
    name: "Fix Console Statements & Mixed Spaces/Tabs",
    path: path.join(__dirname, "fix-lint-issues.js"),
  },
  {
    name: "Fix PropTypes",
    path: path.join(__dirname, "fix-proptypes.js"),
  },
  {
    name: "Fix useEffect Dependencies",
    path: path.join(__dirname, "fix-effect-deps.js"),
  },
];

// Main execution
console.log("========================================");
console.log("Starting comprehensive lint fixing...");
console.log("========================================");
console.log(
  `DRY RUN: ${DRY_RUN ? "Yes (no changes will be made)" : "No (changes will be applied)"}`
);
console.log("----------------------------------------");

// Update dry run mode in all scripts
scripts.forEach((script) => {
  console.log(`Setting ${script.name} to ${DRY_RUN ? "dry run" : "apply changes"} mode...`);
  updateDryRunMode(script.path, DRY_RUN);
});

// Run each script in sequence
scripts.forEach((script, index) => {
  try {
    console.log(`\n[${index + 1}/${scripts.length}] Running: ${script.name}...`);
    console.log("----------------------------------------");

    execSync(`node ${script.path}`, {
      stdio: "inherit",
      encoding: "utf8",
    });

    console.log("----------------------------------------");
    console.log(`Completed: ${script.name}`);
  } catch (error) {
    console.error(`Error running ${script.name}:`, error.message);
  }
});

// Run ESLint to check remaining issues
console.log("\n========================================");
console.log("Checking remaining lint issues...");
console.log("========================================");

try {
  const lintOutput = execSync("npm run lint", {
    stdio: "pipe",
    encoding: "utf8",
  });

  console.log(lintOutput);

  // Count remaining issues
  const errorMatch = lintOutput.match(/(\d+) errors?/);
  const warningMatch = lintOutput.match(/(\d+) warnings?/);

  const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
  const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;

  console.log("\n========================================");
  console.log("Summary of remaining issues:");
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);
  console.log("========================================");

  if (errors === 0 && warnings === 0) {
    console.log("🎉 All lint issues fixed!");
  } else {
    console.log("Some lint issues remain. See the detailed output above.");
  }
} catch (error) {
  console.error("Error running lint check:", error.message);
}

console.log("\nDone!");
console.log(DRY_RUN ? "No changes were made (dry run mode)." : "Changes have been applied.");
