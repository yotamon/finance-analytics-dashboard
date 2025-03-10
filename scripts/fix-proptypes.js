/**
 * Script to find and add PropTypes to React components
 * Usage: node scripts/fix-proptypes.js
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
const EXTENSIONS = [".jsx"];
const DRY_RUN = false; // Set to true to preview changes without making them

// Counter for changes
const stats = {
  scannedFiles: 0,
  componentsFound: 0,
  componentsFixed: 0,
};

// Find all component files
function findComponentFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach((item) => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Skip node_modules, dist, and other non-component directories
        if (item !== "node_modules" && item !== "dist" && item !== "utils" && item !== "hooks") {
          walk(itemPath);
        }
      } else if (stat.isFile() && EXTENSIONS.includes(path.extname(item))) {
        files.push(itemPath);
      }
    });
  }

  walk(dir);
  return files;
}

// Extract component props from ESLint errors
function extractPropsFromLint() {
  try {
    // Run ESLint to get prop-types errors
    const eslintOutput = execSync('npx eslint src --rule "react/prop-types: error" --format json', {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    const results = JSON.parse(eslintOutput);

    // Group by file
    const componentProps = {};

    results.forEach((result) => {
      const filePath = result.filePath;

      if (!componentProps[filePath]) {
        componentProps[filePath] = new Set();
      }

      result.messages.forEach((msg) => {
        if (msg.ruleId === "react/prop-types") {
          // Extract prop name from error message
          const propMatch = msg.message.match(/'([^']+)'/);
          if (propMatch && propMatch[1]) {
            componentProps[filePath].add(propMatch[1]);
          }
        }
      });
    });

    // Convert Sets to Arrays
    Object.keys(componentProps).forEach((filePath) => {
      componentProps[filePath] = Array.from(componentProps[filePath]);
    });

    return componentProps;
  } catch (error) {
    console.error("Error extracting props:", error.message);
    return {};
  }
}

// Add PropTypes to a component file
function addPropTypes(filePath, props) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Check if the file already imports PropTypes
    const hasPropTypes = content.includes("import PropTypes from");

    // Add PropTypes import if needed
    if (!hasPropTypes) {
      content = content.replace(/import React.*?;/, "$&\nimport PropTypes from 'prop-types';");
    }

    // Find component name
    const componentNameMatch = content.match(/(?:function|const|class)\s+([A-Z][A-Za-z0-9_]+)/);
    if (!componentNameMatch) {
      console.log(`  Could not find component name in ${filePath}`);
      return false;
    }

    const componentName = componentNameMatch[1];

    // Check if PropTypes are already defined
    if (content.includes(`${componentName}.propTypes`)) {
      console.log(`  PropTypes already defined for ${componentName}`);
      return false;
    }

    // Generate PropTypes definition
    const propTypesDefinition = `
${componentName}.propTypes = {
${props.map((prop) => `  ${prop}: PropTypes.any`).join(",\n")}
};
`;

    // Add PropTypes at the end of the file
    const newContent = content.replace(
      /(export default .+?;|export {\s*.+?\s*};)/,
      `${propTypesDefinition}\n$1`
    );

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`  Added PropTypes to ${componentName} in ${filePath}`);
    } else {
      console.log(`  Would add PropTypes to ${componentName} in ${filePath} (dry run)`);
    }

    return true;
  } catch (error) {
    console.error(`Error adding PropTypes to ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log("Starting PropTypes fix script...");
console.log(
  `DRY RUN: ${DRY_RUN ? "Yes (no changes will be made)" : "No (changes will be applied)"}`
);

// Find component files
const componentFiles = findComponentFiles(SRC_DIR);
stats.scannedFiles = componentFiles.length;
console.log(`Found ${componentFiles.length} component files`);

// Extract props from ESLint errors
const componentProps = extractPropsFromLint();
stats.componentsFound = Object.keys(componentProps).length;
console.log(`Found ${stats.componentsFound} components with missing PropTypes`);

// Add PropTypes to components
Object.keys(componentProps).forEach((filePath) => {
  const props = componentProps[filePath];
  if (props.length > 0) {
    const success = addPropTypes(filePath, props);
    if (success) {
      stats.componentsFixed++;
    }
  }
});

// Print stats
console.log("\nSummary:");
console.log(`Files scanned: ${stats.scannedFiles}`);
console.log(`Components with missing PropTypes: ${stats.componentsFound}`);
console.log(`Components fixed: ${stats.componentsFixed}`);

console.log("\nDone!");
console.log(DRY_RUN ? "No changes were made (dry run mode)." : "Changes have been applied.");
console.log('Run "npm run lint" to check remaining issues.');
