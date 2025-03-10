#!/usr/bin/env python3

import json
import os
import re
import sys
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENGLISH_TRANSLATION_FILE = PROJECT_ROOT / "src" / "locales" / "en.json"
SOURCE_DIRS = [PROJECT_ROOT / "src"]
FILE_PATTERNS = ["*.js", "*.jsx", "*.ts", "*.tsx"]
EXCLUDED_DIRS = ["node_modules", "dist", "build", ".git"]
VERBOSE = False  # Set to False for less output

# Regular expressions for proper translation keys
# Matches t("namespace.key") or t('namespace.key') - requires dot notation pattern
TRANSLATION_KEY_PATTERN = re.compile(r't\(\s*["\']([a-zA-Z]+\.[a-zA-Z0-9_.]+)["\']')

# Matches t(`namespace.${var}.key`) - for template keys with dot notation
TEMPLATE_KEY_PATTERN = re.compile(r't\(\s*`([a-zA-Z]+\.[^`]*\${[^}]+}[^`]*)[^`]*`')

def log(message, always=False):
    """Print a log message if verbose is enabled or always is True."""
    if VERBOSE or always:
        print(message)

def load_english_translations():
    """Load the English translations from en.json."""
    try:
        with open(ENGLISH_TRANSLATION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            translations = data.get('translations', {})
            log(f"Loaded {len(translations)} translations")
            return translations
    except Exception as e:
        log(f"Error loading English translations: {e}", always=True)
        return {}

def save_english_translations(translations):
    """Save the updated English translations to en.json."""
    try:
        with open(ENGLISH_TRANSLATION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)

        data['translations'] = translations

        with open(ENGLISH_TRANSLATION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        log(f"✅ Updated {ENGLISH_TRANSLATION_FILE} with {len(translations)} translations", always=True)
    except Exception as e:
        log(f"Error saving English translations: {e}", always=True)

def find_js_files():
    """Find all JavaScript/TypeScript files in the project."""
    js_files = []

    for source_dir in SOURCE_DIRS:
        if not source_dir.exists():
            log(f"Warning: Source directory {source_dir} does not exist", always=True)
            continue

        for root, dirs, files in os.walk(source_dir):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

            for pattern in FILE_PATTERNS:
                path_obj = Path(root)
                matches = list(path_obj.glob(pattern))
                js_files.extend(matches)

    log(f"Found {len(js_files)} JavaScript/TypeScript files to scan", always=True)
    return js_files

def is_valid_translation_key(key):
    """Check if a string follows the translation key pattern (e.g., 'namespace.key')."""
    # A valid translation key has at least one dot and contains only letters, numbers, dots, and underscores
    # It must start with a letter and contain at least one letter after the dot
    pattern = re.compile(r'^[a-zA-Z]+\.[a-zA-Z0-9_.]+$')
    return bool(pattern.match(key))

def extract_translation_keys_from_file(file_path):
    """Extract translation keys from a single file."""
    keys = set()

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

            # Find standard translation keys with dot notation (e.g., "dashboard.refresh")
            for match in TRANSLATION_KEY_PATTERN.finditer(content):
                key = match.group(1)
                # Verify it's a valid translation key
                if is_valid_translation_key(key):
                    keys.add(key)

            # Handle template literal keys with dot notation
            for match in TEMPLATE_KEY_PATTERN.finditer(content):
                template = match.group(1)

                # Handle cases like charts.${chartId}.title
                if "${" in template and "}" in template:
                    # Extract the static parts before and after the variable
                    before_var = template.split("${")[0]
                    after_var = template.split("}")[1] if "}" in template else ""

                    # Only include if it follows the pattern namespace.*.key
                    if before_var and "." in before_var and after_var and "." in after_var:
                        # We create a placeholder key that represents the template
                        ns = before_var.split(".")[0]
                        rest = after_var.lstrip(".")
                        if rest:
                            template_key = f"{ns}.*{rest}"
                            keys.add(template_key)

    except Exception as e:
        log(f"Error processing file {file_path}: {e}", always=True)

    return keys

def find_all_translation_keys():
    """Find all translation keys used in the project."""
    all_keys = set()
    files = find_js_files()

    # Print progress every 10%
    total_files = len(files)
    progress_step = max(1, total_files // 10)

    log(f"Scanning {total_files} files for translation keys...", always=True)

    for i, file in enumerate(files, 1):
        # Show progress every 10%
        if i % progress_step == 0 or i == total_files:
            percent = (i / total_files) * 100
            log(f"Progress: {i}/{total_files} files ({percent:.0f}%)", always=True)

        keys = extract_translation_keys_from_file(file)
        all_keys.update(keys)

    return all_keys

def find_missing_translations():
    """Find translation keys that are used but not defined in en.json."""
    english_translations = load_english_translations()
    all_keys = find_all_translation_keys()

    missing_keys = {key for key in all_keys if key not in english_translations}

    return missing_keys

def add_missing_translations():
    """Add missing translation keys to en.json."""
    english_translations = load_english_translations()
    missing_keys = find_missing_translations()

    if not missing_keys:
        log("✅ No missing translations found! All translation keys are defined in en.json.", always=True)
        return

    log(f"Found {len(missing_keys)} missing translations:", always=True)

    for key in sorted(missing_keys):
        log(f"  - {key}", always=True)
        if "*" in key:
            # For template keys, add a note
            english_translations[key] = f"#Untranslated Template: {key}"
        else:
            english_translations[key] = "#Untranslated String"

    save_english_translations(english_translations)
    log("You should now review the newly added translations and provide proper values.", always=True)

if __name__ == "__main__":
    log(f"🔍 Starting translation scan for {ENGLISH_TRANSLATION_FILE}", always=True)

    if not os.path.exists(ENGLISH_TRANSLATION_FILE):
        log(f"❌ Error: English translation file not found at {ENGLISH_TRANSLATION_FILE}", always=True)
        sys.exit(1)

    add_missing_translations()