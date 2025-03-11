/**
 * Update Imports Script
 * Updates import paths in TypeScript components to use the shared types
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DASHBOARD_DIR = path.join(__dirname, "../src/components/dashboard");
const TYPES_FILE = "../types/dashboard";

// Types to migrate to shared imports
const SHARED_TYPES = [
  "ChartSize",
  "ChartHeight",
  "ChartConfig",
  "ChartCustomization",
  "SizeOption",
  "SizeOptionsMap",
  "SavedLayout",
  "ChartContainerProps",
  "DashboardCustomizerProps",
  "DraggableDashboardProps",
  "FilterMenuProps",
  "CheckboxFilterOption",
  "RangeFilterOption",
  "DateRangeFilter",
  "FilterGroup",
  "FilterValues",
  "Project",
  "ProjectTableCardProps",
  "GridStabilityRef",
];

// Process each TypeScript file in the dashboard directory
async function updateImportsInDirectory() {
  try {
    const files = fs.readdirSync(DASHBOARD_DIR);
    const tsxFiles = files.filter((file) => file.endsWith(".tsx"));

    console.log(`Found ${tsxFiles.length} TypeScript files to update`);

    for (const file of tsxFiles) {
      await updateImportsInFile(path.join(DASHBOARD_DIR, file));
    }

    console.log("Import updates complete!");
  } catch (error) {
    console.error("Error updating imports:", error);
  }
}

// Update imports in a single file
async function updateImportsInFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);

  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Check if we already have the import
    const hasSharedImport = content.includes(`import { `);
    const hasTypeImport = content.includes(`from "${TYPES_FILE}"`);

    // Find local interface definitions to remove
    for (const type of SHARED_TYPES) {
      // Look for interface or type definitions
      const interfaceRegex = new RegExp(`(interface|type)\\s+${type}\\s*[{<]`, "g");

      if (interfaceRegex.test(content)) {
        console.log(`  Found local definition for ${type}`);

        // Find the full interface block
        const fullInterfaceRegex = new RegExp(`(interface|type)\\s+${type}[^}]*}`, "s");
        content = content.replace(fullInterfaceRegex, `// Using shared type: ${type}`);
        modified = true;
      }
    }

    // Check if we need to add the import
    if (modified && !hasTypeImport) {
      // Build import statement
      const importTypes = SHARED_TYPES.filter((type) => {
        // Check if the type is used in the file but not defined locally
        return (
          content.includes(type) &&
          !content.includes(`interface ${type}`) &&
          !content.includes(`type ${type}`)
        );
      });

      if (importTypes.length > 0) {
        const importStatement = `import { ${importTypes.join(", ")} } from "${TYPES_FILE}";\n`;

        // Find a good place to add the import
        // After the last import statement is usually a good spot
        const lastImportIndex = content.lastIndexOf("import ");
        const lastImportEndIndex = content.indexOf(";", lastImportIndex) + 1;

        if (lastImportIndex !== -1) {
          content =
            content.substring(0, lastImportEndIndex) +
            "\n" +
            importStatement +
            content.substring(lastImportEndIndex);
        } else {
          // No imports, add at the top
          content = importStatement + content;
        }

        console.log(`  Added import for: ${importTypes.join(", ")}`);
      }
    }

    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  Updated ${path.basename(filePath)}`);
    } else {
      console.log(`  No changes needed for ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`  Error processing ${path.basename(filePath)}:`, error);
  }
}

// Run the script
updateImportsInDirectory();
