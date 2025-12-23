# Testing Guide - Asset Collector Extension

Complete instructions for testing the Asset Collector extension after each development phase.

## Prerequisites

Before running any tests, ensure you have:
- Adobe Premiere Pro 2024 or later installed
- macOS 11+ or Windows 10+
- Git configured (optional but recommended)
- Administrator/sudo access for creating symbolic links

## General Setup

### 1. Enable Debug Mode

**macOS:**
```bash
# Enable debug mode for Premiere Pro
defaults write com.adobe.PPRO.14 PlayerDebugMode 1

# Verify it was set
defaults read com.adobe.PPRO.14 PlayerDebugMode
# Should output: 1
```

**Windows:**
```cmd
# Add to registry: HKEY_CURRENT_USER\Software\Adobe\CSXS.11
# Add DWORD: PlayerDebugMode = 1
```

### 2. Create Symbolic Link

Create a link from the `src/` directory to Premiere Pro's extensions folder:

**macOS:**
```bash
mkdir -p "$HOME/Library/Application Support/Adobe/CEP/extensions"
ln -s "/Users/BlakeNeedleman/Documents/Apps/PremierExtension/src" \
      "$HOME/Library/Application Support/Adobe/CEP/extensions/AssetCollector"
```

**Windows:**
```cmd
mkdir %APPDATA%\Adobe\CEP\extensions
mklink /D "%APPDATA%\Adobe\CEP\extensions\AssetCollector" ^
        "C:\Path\To\PremierExtension\src"
```

### 3. Enable Remote Debugging (Optional but Recommended)

For debugging JavaScript in the extension panel:

1. In Premiere Pro: **Help > Debugging > Enable Remote Debugging**
2. Open browser console at `http://localhost:8090` (requires debugger enabled)

## Phase 1: Setup & Boilerplate Testing

**Status:** ✅ Complete

### What to Test

1. **Extension Loads**
   - Extension appears in Window menu
   - Panel opens without errors
   - No console errors on startup

2. **UI Elements Display**
   - All UI controls are visible and styled correctly
   - Dark theme matches Premiere Pro
   - Panel resizes properly

3. **Folder Browser**
   - "Browse" button is clickable
   - File browser dialog opens
   - Selected folder path displays in input field
   - "Collect Files" button becomes enabled after selection

4. **Options Checkboxes**
   - All three option checkboxes are clickable
   - States persist during session
   - Default values are: all checked

5. **UI Feedback**
   - Status messages appear/disappear
   - Progress section hidden initially
   - Results section hidden initially

### Testing Steps

1. **Open Premiere Pro**
   ```bash
   # Close Premiere Pro completely first
   killall "Adobe Premiere Pro"
   
   # Reopen Premiere Pro (manually or via terminal if you have a shortcut)
   open -a "Adobe Premiere Pro"
   ```

2. **Open Asset Collector Panel**
   - Menu: **Window > Extensions > Asset Collector**
   - Panel should appear on right side of screen
   - Check console for any errors: **Help > Debugging > Enable Remote Debugging**

3. **Test Folder Selection**
   - Click "Browse" button
   - Select any folder on your computer
   - Confirm path appears in the text field
   - Confirm "Collect Files" button becomes enabled

4. **Test Options**
   - Click each checkbox to toggle state
   - Observe checkmarks appear/disappear
   - No errors should occur

5. **Test Progress Simulation**
   - Click "Collect Files" button
   - Progress bar should animate from 0 to 100%
   - Status text should update ("Analyzing project...", etc.)
   - Progress section should be visible
   - After 5 seconds, results should display

6. **Test Status Messages**
   - Messages should appear in blue/green/yellow/red boxes at bottom
   - Messages should auto-disappear after 5 seconds (except errors)
   - No status message on initial load

### Expected Results

✅ **Pass Criteria:**
- Extension loads in Premiere Pro
- Panel displays with correct styling
- All buttons and controls are functional
- Progress simulation completes without errors
- Results display correctly
- Console shows no JavaScript errors

❌ **Fail Criteria:**
- Extension doesn't appear in menu
- UI elements are misaligned or unstyled
- Buttons don't respond to clicks
- JavaScript errors appear in console
- Progress simulation crashes

### Troubleshooting Phase 1

| Issue | Solution |
|-------|----------|
| Extension doesn't appear in Window menu | Restart Premiere Pro. Check debug mode is enabled. Check symlink is correct. |
| Panel is blank or has layout issues | Clear browser cache: Delete `~/.cache/Adobe/` (macOS) or `%LocalAppData%\Adobe\` (Windows) |
| Buttons don't respond | Check JavaScript for syntax errors in browser console |
| Progress doesn't animate | Browser console may show animation errors. Check CSS transitions. |
| Extension crashes on load | Check manifest.json for syntax errors. Verify all required files exist. |

---

## Phase 2: Premiere Pro API Integration Testing

**Status:** ⏳ Not Started

### What to Test

1. **Project Access**
   - Can read active project name
   - Can access project root items
   - Handles case when no project is open

2. **Asset Enumeration**
   - Lists all clips in project
   - Lists all sequences
   - Lists all bins/folders
   - Shows file paths for each asset

3. **File Path Extraction**
   - Correctly extracts paths from video clips
   - Correctly extracts paths from audio files
   - Correctly extracts paths from still images
   - Handles missing/offline files gracefully

4. **Edge Cases**
   - Handles generated content (titles, color mattes, bars/tone)
   - Handles nested sequences
   - Handles clips with multiple video layers
   - Handles offline files without crashing

### Testing Steps (Will be updated in Phase 2)

```
[To be completed in Phase 2]
```

### Expected Results

✅ **Pass Criteria:**
- Extension can read project structure
- All assets are enumerated
- File paths are extracted correctly
- No crashes with edge cases
- Asset count matches Premiere Pro's project panel

---

## Phase 3: Asset Collection Logic Testing

**Status:** ⏳ Not Started

### What to Test

1. **Asset Collection**
   - Duplicates are identified and removed
   - Assets are correctly categorized by type
   - Unused assets are properly identified
   - Total file size is calculated correctly

2. **Asset Filtering**
   - "Include unused clips" option works
   - Size estimates are accurate

### Testing Steps (Will be updated in Phase 3)

```
[To be completed in Phase 3]
```

---

## Phase 4: File Operations Testing

**Status:** ⏳ Not Started

### What to Test

1. **File Copying**
   - Files are copied to destination folder
   - Large files are handled without freezing UI
   - Progress updates are accurate
   - File integrity is preserved (checksums match)

2. **Folder Structure**
   - "Maintain structure" option creates proper hierarchy
   - Naming conflicts are resolved
   - Folder permissions are correct

3. **Error Handling**
   - Missing source files are reported
   - Insufficient disk space is detected
   - Permission errors are displayed

### Testing Steps (Will be updated in Phase 4)

```
[To be completed in Phase 4]
```

---

## Phase 5: Project Relinking Testing

**Status:** ⏳ Not Started

### What to Test

1. **Path Updating**
   - Project file is correctly modified
   - All file paths point to new locations
   - Sequences still reference correct clips
   - Effects and transitions are preserved

2. **Project Saving**
   - Project saves to destination folder
   - Original project remains unchanged
   - New project is functional in Premiere Pro

### Testing Steps (Will be updated in Phase 5)

```
[To be completed in Phase 5]
```

---

## Phase 6: UI/UX Testing

**Status:** ⏳ Not Started

### What to Test

1. **Visual Polish**
   - Light/dark theme switching works
   - All text is readable
   - Icons are properly displayed
   - Spacing and alignment are correct

2. **Usability**
   - Controls are in logical order
   - Help text is clear
   - Error messages are helpful

### Testing Steps (Will be updated in Phase 6)

```
[To be completed in Phase 6]
```

---

## Phase 7: Integration Testing

**Status:** ⏳ Not Started

### What to Test

1. **End-to-End Workflow**
   - Complete collection process works
   - New project is created with all assets
   - Collected project is functional

2. **Performance**
   - Works with large projects (100+ assets)
   - Works with large files (50+ GB)
   - No UI freezing during operations

### Testing Steps (Will be updated in Phase 7)

```
[To be completed in Phase 7]
```

---

## Automated Testing

### Browser Console Testing

You can test basic functionality from the browser console:

```javascript
// Test 1: Check if extension loads
console.log('Extension loaded:', typeof window !== 'undefined');

// Test 2: Get state
console.log('Current state:', state);

// Test 3: Trigger progress update
updateProgress(50, 'Test progress');

// Test 4: Show status
showStatus('Testing status message', 'success');

// Test 5: Format bytes
console.log('10000 bytes =', formatBytes(10000));
```

Access console via: **Help > Debugging > Enable Remote Debugging** → Open `http://localhost:8090`

## Continuous Testing Checklist

Before each commit:

- [ ] No JavaScript errors in console
- [ ] All UI elements display correctly
- [ ] No deprecation warnings
- [ ] Extension loads in < 2 seconds
- [ ] No memory leaks (check DevTools)

Before each release:

- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Tested with Premiere Pro 2024 LTS
- [ ] All edge cases handled
- [ ] Documentation is current

## Reporting Issues

When testing, if you find issues:

1. **Note the exact steps to reproduce**
2. **Check the browser console for errors** (Help > Debugging)
3. **Test on a fresh Premiere Pro instance**
4. **Create an issue with:**
   - Phase being tested
   - Steps to reproduce
   - Expected vs. actual behavior
   - Console error messages
   - System information (OS, Premiere version)

## Testing with Different Project Types

### Test Project 1: Simple Project
- 2-3 video clips
- 1-2 audio tracks
- 1-2 images
- Expected: All files collected successfully

### Test Project 2: Complex Project
- 20+ clips in multiple bins
- Nested sequences
- Graphics and titles
- Audio effects
- Expected: All assets enumerated, duplicates removed

### Test Project 3: Large Project
- 100+ assets
- Mix of online and offline files
- High resolution media (4K+)
- Expected: Extension handles gracefully, progress updates work

## Documentation for Testing

This guide will be updated after each phase with specific testing steps and expected results.

See [README.md](README.md) for general setup instructions and [REQUIREMENTS.md](REQUIREMENTS.md) for technical specifications.
