#!/usr/bin/env python3
"""
Extract and validate JavaScript from HTML
"""
import re

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find script section
script_start = content.find('<script>')
script_end = content.find('</script>', script_start)

if script_start == -1:
    print("No <script> tag found")
    exit(1)

js_code = content[script_start+8:script_end]

# Check for common syntax errors
errors = []

# Check for template literals with unescaped backticks
backtick_count = js_code.count('`')
if backtick_count % 2 != 0:
    errors.append(f"Unbalanced backticks: found {backtick_count}")

# Check for unbalanced braces in key sections
sections_to_check = [
    ('populateCharacterMenu', 'function populateCharacterMenu', 'function toggleMenu'),
    ('selectCharacterFromMenu', 'function selectCharacterFromMenu', 'function updateCharacterDisplay'),
    ('updateSpellsTab', 'function updateSpellsTab', 'function updateSpellSlotsDisplay'),
]

for name, start_marker, end_marker in sections_to_check:
    start = js_code.find(start_marker)
    end = js_code.find(end_marker, start)
    if start > 0 and end > start:
        section = js_code[start:end]
        open_b = section.count('{')
        close_b = section.count('}')
        if open_b != close_b:
            errors.append(f"{name}: {open_b} open braces, {close_b} close braces")

if errors:
    print("ERRORS FOUND:")
    for error in errors:
        print(f"  - {error}")
else:
    print("No obvious syntax errors found")
    print("\nChecking for specific patterns...")

    # Look for console.log statements that might have issues
    console_logs = re.findall(r"console\.log\([^)]+\)", js_code)
    print(f"Found {len(console_logs)} console.log statements")

    # Check if initialization code exists
    if '=== INITIALIZING PAGE ===' in js_code:
        print("✓ Initialization debug code found")
    else:
        print("✗ Initialization debug code NOT found")
