# Testing Guide - Asset Collector Extension

Complete instructions for testing the Asset Collector extension after each development phase.

## Prerequisites

Before running any tests, ensure you have:
- Adobe Premiere Pro 2024 or later installed
- macOS 11+ or Windows 10+
- Git configured (optional but recommended)
- Administrator/sudo access for creating symbolic links

## How a non-developer friend can help test Phase 5 (relinking)

This is written for someone who just edits video and is not a developer.

### What they will do (high level)
1) Install the panel (development mode) so it shows up in Premiere.
2) Open their own project and run the collector into a test folder.
3) Send back the collected folder plus the rewritten project (once relinking is built) and a short report.

### One-time setup
**macOS:**
1. Turn on debug mode for Premiere Pro:
   - Open Terminal and run:
     ```bash
     defaults write com.adobe.PPRO.14 PlayerDebugMode 1
     ```
   - Restart Premiere Pro after this.
2. Create the extensions folder if it does not exist:
   ```bash
   mkdir -p "$HOME/Library/Application Support/Adobe/CEP/extensions"
   ```
3. Copy the provided `src` folder (you can zip and send it to your friend) into a location they can keep, e.g. `~/PremiereTools/AssetCollector/src`.
4. Create a shortcut so Premiere can see it:
   ```bash
   ln -s "~/PremiereTools/AssetCollector/src" \
         "$HOME/Library/Application Support/Adobe/CEP/extensions/AssetCollector"
   ```

**Windows:**
1. Turn on debug mode for Premiere Pro:
   - Open `regedit`
   - Go to `HKEY_CURRENT_USER/Software/Adobe/CSXS.11`
   - Add DWORD `PlayerDebugMode` with value `1`
   - Restart Premiere Pro after this.
2. Create the extensions folder if it does not exist:
   ```cmd
   mkdir %APPDATA%\Adobe\CEP\extensions
   ```
3. Copy the provided `src` folder (zip it and send to your friend) somewhere like `C:\PremiereTools\AssetCollector\src`.
4. Create a shortcut so Premiere can see it:
   ```cmd
   mklink /D "%APPDATA%\Adobe\CEP\extensions\AssetCollector" "C:\PremiereTools\AssetCollector\src"
   ```

### How to run the test
1. Open Premiere Pro.
2. Open their own project that has real media (video, audio, graphics).
3. Open the panel: **Window > Extensions > Asset Collector**.
4. Pick a destination folder (make a new empty folder on a fast drive).
5. Choose options (leave defaults on if unsure).
6. Click **Collect Files**.
7. Wait for the progress bar to reach 100%.
8. When done, note what the Results say (files collected, missing files, errors).

### What to send back
- The entire collected folder (zipped) that contains the copied media.
- The project file after relinking (once relinking is implemented) or the original project file if relinking is not yet available.
- A short note:
  - Premiere version (e.g., 24.5)
  - OS (macOS or Windows)
  - Approx how many clips and total size
  - Whether any files were reported missing or errors occurred

### Tips for non-developers
- If the panel does not show up, restart Premiere after creating the symlink/shortcut.
- Keep the destination folder on a local drive (avoid slow network drives).
- Do not close Premiere while collection is running.
- If you see errors, take a screenshot of the panel and the Premiere console (Help > Debugging > Enable Remote Debugging, then open http://localhost:8090).

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

**Status:** ✅ Complete

### What to Test

1. **File Copying**
   - Files are copied to destination folder
   - Large files are handled without freezing UI
   - Progress updates are accurate
   - File integrity is preserved

2. **Folder Structure**
   - "Maintain structure" option creates proper hierarchy
   - Naming conflicts are resolved
   - Folder permissions are correct

3. **Error Handling**
   - Missing source files are reported
   - Permission errors are displayed
   - Operation continues despite individual failures

### Testing Steps

#### Test 4.1: Basic File Collection

**Preparation:**
1. Create a test project in Premiere Pro with:
   - 3 video clips in one bin
   - 2 audio files in another bin
   - 1 still image
   - All files in accessible locations (not network drives)
🔜 Planned (required for editor handoff)

This phase will add automatic relinking of project file paths to the collected asset locations so the receiving editor opens the project with zero manual relinking.

Results display shows:
  - Files Collected: 6
  - Total Size: [correct size]
  - Missing Files: 0
  - Errors: 0
✓ Status message: "Asset collection completed successfully!"
```

**Verify Files:**
```bash
# On macOS, verify files in destination
ls -la "/path/to/destination/Bin1"
ls -la "/path/to/destination/Bin2"

# Check file sizes match originals
ls -lh "/original/path/video.mov"
ls -lh "/destination/Bin1/video.mov"
```

#### Test 4.2: Organize by Type

**Preparation:**
Use same test project as 4.1

**Steps:**
1. Open Asset Collector panel
2. Select destination folder
3. Modify options:
   - ✓ Include unused clips
   - ☐ Maintain folder structure (UNCHECK)
   - ✓ Consolidate duplicate files
4. Click "Collect Files"

**Expected Results:**
```
✓ Destination folder contains:
  - Video/ folder with video files
  - Audio/ folder with audio files
  - Images/ folder with image files
✓ All files present, organized by type
✓ Results show correct counts and size
```

#### Test 4.3: Flat Structure

**Preparation:**
Use same test project as 4.1

**Steps:**
1. Open Asset Collector panel
2. Select destination folder
3. Modify options:
   - ✓ Include unused clips
   - ☐ Maintain folder structure (UNCHECK)
   - ✓ Consolidate duplicate files
4. Click "Collect Files"

**Expected Results:**
```
✓ Destination folder contains all files in root
✓ No subfolders created
✓ All 6 files present
✓ Results accurate
```

#### Test 4.4: File Name Conflicts

**Preparation:**
1. Create test destination folder
2. Manually add a file named `Footage.mov` to destination
3. Create project with clip also named `Footage.mov`

**Steps:**
1. Open Asset Collector panel
2. Select same destination folder
3. Click "Collect Files"

**Expected Results:**
```
✓ Extension detects conflict
✓ Creates new file: `Footage_1.mov`
✓ Original `Footage.mov` untouched
✓ Results show:
  - Files Collected: 1
  - New file in destination
✓ No errors or warnings (expected behavior)
```

#### Test 4.5: Offline Files

**Preparation:**
1. Create test project with:
   - 3 online clips
   - 1 offline clip (unlink or move original)
2. Project should show offline indicator

**Steps:**
1. Open Asset Collector panel
2. Select destination folder
3. Click "Collect Files"

**Expected Results:**
```
✓ Progress completes
✓ Results show:
  - Files Collected: 3 (only online files)
  - Missing Files: 1
  - Errors: 0
✓ Status message indicates completion with offline files noted
✓ Only 3 files in destination (offline file skipped)
```

#### Test 4.6: Progress Bar Accuracy

**Preparation:**
Use test project from 4.1 with several files

**Steps:**
1. Open Asset Collector panel
2. Select destination folder
3. Click "Collect Files"
4. Watch progress bar during copy

**Expected Results:**
```
✓ Progress bar moves smoothly (not jumpy)
✓ Status text updates regularly
✓ File counter increases (1/6, 2/6, etc.)
✓ Final progress: 100%
✓ Timing reasonable (adjust expectations for file size):
  - 10 files @ 100MB each: ~30-60 seconds
  - 100 files @ 10MB each: ~60-120 seconds
```

#### Test 4.7: Large Files

**Preparation:**
Create project with one large file (>1GB)

**Steps:**
1. Open Asset Collector panel
2. Select destination folder with plenty of free space
3. Click "Collect Files"

**Expected Results:**
```
✓ UI doesn't freeze during copy
✓ Progress bar continues updating
✓ File completes successfully
✓ Total size in results is accurate
✓ No errors or timeouts
```

#### Test 4.8: Permission Errors

**Preparation:**
1. Create destination folder
2. Change permissions to read-only:
   ```bash
   chmod 444 /path/to/destination  # macOS/Linux
   ```

**Steps:**
1. Open Asset Collector panel
2. Select read-only destination folder
3. Click "Collect Files"

**Expected Results:**
```
✓ Operation fails gracefully
✓ Results show:
  - Files Collected: 0
  - Errors: [number]
  - Error list shows permission issue
✓ Clear error message displayed
✓ No partial files left in destination
```

**Cleanup:**
```bash
chmod 755 /path/to/destination  # Restore permissions
```

### Console Testing - Phase 4

```javascript
// Test 1: Get assets and calculate size
const { getProjectAssets } = require('./js/assetCollector.js');
const { calculateTotalSize } = require('./js/fileOperations.js');

const assets = await getProjectAssets({});
const totalSize = await calculateTotalSize(assets);

console.log('Assets:', assets.length);
console.log('Online:', assets.filter(a => !a.isOffline).length);
console.log('Offline:', assets.filter(a => a.isOffline).length);
console.log('Total Size:', totalSize, 'bytes');
console.log('Size MB:', (totalSize / 1024 / 1024).toFixed(2));

// Test 2: Check file sizes individually
for (const asset of assets.slice(0, 3)) {
    const fs = require('uxp').storage.localFileSystem;
    try {
        const file = await fs.getEntryWithUrl(`file://${asset.path}`);
        console.log(`${asset.name}: ${file.size} bytes`);
    } catch (e) {
        console.log(`${asset.name}: ERROR - ${e.message}`);
    }
}
```

### Checklist - Phase 4 Testing

- [ ] Test 4.1: Basic collection with structure maintained
- [ ] Test 4.2: Organization by type works
- [ ] Test 4.3: Flat structure works
- [ ] Test 4.4: Naming conflicts handled correctly
- [ ] Test 4.5: Offline files detected and skipped
- [ ] Test 4.6: Progress bar accurate and responsive
- [ ] Test 4.7: Large files copied successfully
- [ ] Test 4.8: Permission errors handled gracefully
- [ ] Console tests show correct asset counts and sizes
- [ ] No files corrupted during copy (spot check file integrity)
- [ ] Results display accurate information
- [ ] Error messages are helpful and specific

---

## Phase 5: Project Relinking Testing

**Status**: Implemented ✅

Phase 5 implements automatic project relinking to update the collected project file with new asset paths. The relinked project should open without "Link Media" prompts.

### Test Scenario 5.1: Basic Project Relinking

**Objective**: Verify project file is copied and relinked successfully

**Preparation**:
1. Create a small Premiere Pro project with 3-5 video clips
2. Save the project
3. Note the original file paths of the clips

**Steps**:
1. Open the project in Premiere Pro
2. Open Asset Collector extension
3. Select a destination folder
4. Enable "Maintain Structure" option
5. Click "Collect Assets"
6. Wait for completion

**Expected Results**:
- ✅ Original .prproj file is copied to destination folder
- ✅ Progress message shows "Updating project file..."
- ✅ Status message shows "Project file updated with X new paths"
- ✅ Results display shows "Project Relinked: Yes"
- ✅ No errors in console related to relinking

**Verification**:
- Close current project
- Open the copied .prproj from destination folder
- All clips should be online (green in Project panel)
- Playback should work without "Link Media" dialog

---

### Test Scenario 5.2: Flat Folder Mode Relinking

**Objective**: Verify relinking works when all files are in a single folder

**Preparation**:
1. Create project with clips from multiple original folders
2. Save the project

**Steps**:
1. Open Asset Collector
2. Select destination
3. Disable "Maintain Structure" (flat mode)
4. Collect assets

**Expected Results**:
- ✅ All media files copied to single destination folder
- ✅ Project file updated with flat paths
- ✅ No path references to original folder structure

**Verification**:
- Open copied project
- Check all clips reference files in destination root
- No "Link Media" dialog appears

---

### Test Scenario 5.3: Large Project Relinking

**Objective**: Test relinking with many assets (50+ clips)

**Preparation**:
1. Create or use existing large project (50+ clips)
2. Mix of video, audio, images
3. Save project

**Steps**:
1. Open Asset Collector
2. Select destination
3. Choose any folder mode
4. Collect assets

**Expected Results**:
- ✅ All paths updated in project file
- ✅ Progress indicator shows relinking progress
- ✅ Completion time reasonable (< 30 seconds for 100 clips)
- ✅ No memory errors or crashes

**Verification**:
- Open copied project
- Spot-check several clips (beginning, middle, end)
- All should be online

---

### Test Scenario 5.4: Special Characters in Paths

**Objective**: Verify URL encoding/decoding handles special characters

**Preparation**:
1. Create folder with spaces: "My Project Files"
2. Create folder with special chars: "Client#1 (2024)"
3. Place clips in these folders
4. Create and save project

**Steps**:
1. Collect assets with Asset Collector

**Expected Results**:
- ✅ Paths with spaces correctly encoded/decoded
- ✅ Special characters (#, (), etc.) handled
- ✅ No XML parsing errors
- ✅ Project opens with all files online

---

### Test Scenario 5.5: Mixed Path Types

**Objective**: Test projects with absolute and relative paths

**Preparation**:
1. Create project with mix of:
   - Absolute paths (/Users/name/...)
   - Relative paths (./footage/...)
   - Network paths (if applicable)
2. Save project

**Steps**:
1. Collect assets

**Expected Results**:
- ✅ All path types detected and updated
- ✅ New paths are correctly formatted
- ✅ Prefer relative paths in output when possible

---

### Test Scenario 5.6: Offline Files Handling

**Objective**: Verify relinking handles projects with offline media

**Preparation**:
1. Create project with some clips
2. Delete or move 2-3 source files (make them offline)
3. Save project

**Steps**:
1. Collect assets
2. Check results

**Expected Results**:
- ✅ Online files copied and relinked
- ✅ Offline files reported in results
- ✅ Project file still updated for available files
- ✅ Offline clips remain offline in copied project

---

### Test Scenario 5.7: Unsaved Project

**Objective**: Verify graceful handling when project not saved

**Preparation**:
1. Create new project
2. Import clips
3. Do NOT save project

**Steps**:
1. Attempt to collect assets

**Expected Results**:
- ✅ Files copied successfully
- ✅ Message: "Project not saved - cannot update project file"
- ✅ No .prproj file in destination
- ✅ No errors, just info message

---

### Test Scenario 5.8: GZip Compression/Decompression

**Objective**: Verify proper handling of .prproj compression

**Preparation**:
1. Create and save project (Premiere saves as GZip)

**Steps**:
1. Collect assets
2. Check console logs for compression messages

**Expected Results**:
- ✅ Log shows: "Project file parsed successfully"
- ✅ Log shows: "Project file saved successfully"
- ✅ No GZip errors
- ✅ Output file size reasonable (compressed)

**Verification**:
```bash
# Check if file is GZip compressed
file destination/project.prproj
# Should show: "gzip compressed data"
```

---

### Test Scenario 5.9: XML Validation

**Objective**: Verify XML structure remains valid after rewriting

**Preparation**:
1. Create project with nested sequences
2. Save project

**Steps**:
1. Collect assets
2. Check console for validation messages

**Expected Results**:
- ✅ Log shows: "Project XML validation passed"
- ✅ No XML parsing errors
- ✅ Project structure intact

**Manual Verification**:
```bash
# Decompress and check XML
gunzip -c destination/project.prproj | head -50
# Should show valid XML structure
```

---

### Test Scenario 5.10: Path Normalization

**Objective**: Test cross-platform path handling

**Preparation**:
1. Create project with various path formats

**Steps**:
1. Collect assets on macOS
2. Note path separators in output

**Expected Results**:
- ✅ Windows paths (\) converted to forward slash (/)
- ✅ Mixed separators normalized
- ✅ URL encoding consistent

---

### Test Scenario 5.11: Duplicate Filename Handling

**Objective**: Verify relinking works with auto-renamed files

**Preparation**:
1. Create project with clips from different folders
2. Ensure some clips have same filename (different folders)
3. Save project

**Steps**:
1. Use flat folder mode to trigger rename conflicts
2. Collect assets

**Expected Results**:
- ✅ Files renamed with suffixes (file_1.mp4, file_2.mp4)
- ✅ Project paths updated to match renamed files
- ✅ All clips online after opening copied project

---

### Test Scenario 5.12: Nested Sequences

**Objective**: Verify sequences nested in other sequences work

**Preparation**:
1. Create main sequence with clips
2. Create sub-sequence
3. Nest sub-sequence in main sequence
4. Save project

**Steps**:
1. Collect assets

**Expected Results**:
- ✅ All sequence media paths updated
- ✅ Nested structure preserved
- ✅ Sequences play correctly in copied project

---

### Test Scenario 5.13: Error Recovery

**Objective**: Test relinking failure doesn't break file collection

**Preparation**:
1. Create project and save
2. Manually corrupt project file (optional stress test)

**Steps**:
1. Collect assets

**Expected Results**:
- ✅ Files copy successfully even if relinking fails
- ✅ Error message: "Files copied successfully, but project relinking failed"
- ✅ Original project never modified
- ✅ Extension remains stable

---

### Test Scenario 5.14: Performance Timing

**Objective**: Measure relinking performance

**Test Matrix**:

| Project Size | Files | Expected Time | Actual Time |
|--------------|-------|---------------|-------------|
| Small        | 5     | < 1s          | _____       |
| Medium       | 25    | < 5s          | _____       |
| Large        | 100   | < 20s         | _____       |
| Extra Large  | 500   | < 60s         | _____       |

**Steps**:
1. For each project size, collect assets
2. Note time from "Updating project file..." to completion
3. Record in table above

**Expected Results**:
- ✅ Times within expected ranges
- ✅ No performance degradation
- ✅ Progress updates smooth

---

### Testing Checklist - Phase 5

Copy this to manually verify:

```
□ Basic relinking works (5.1)
□ Flat folder mode relinking (5.2)
□ Large project relinking (5.3)
□ Special characters in paths (5.4)
□ Mixed path types (5.5)
□ Offline files handled (5.6)
□ Unsaved project handled (5.7)
□ GZip compression works (5.8)
□ XML validation passes (5.9)
□ Path normalization works (5.10)
□ Duplicate filenames handled (5.11)
□ Nested sequences work (5.12)
□ Error recovery graceful (5.13)
□ Performance acceptable (5.14)
```

---

### Console Testing Examples

Test path extraction:
```javascript
const { decompressProject, extractPaths } = require('./js/projectRelinking.js');

// Test on a sample project
const projectPath = '/path/to/project.prproj';
const { xmlDoc } = await decompressProject(projectPath);
const paths = extractPaths(xmlDoc);
console.log('Found paths:', paths.length);
paths.forEach(p => console.log(p.path));
```

Test path mapping:
```javascript
const { createPathMapping } = require('./js/projectRelinking.js');

const pathRefs = [
  { path: '/Users/me/original/video.mp4' },
  { path: '/Users/me/original/audio.wav' }
];

const collectionResult = {
  copiedFiles: [
    { original: '/Users/me/original/video.mp4', destination: '/dest/video.mp4' },
    { original: '/Users/me/original/audio.wav', destination: '/dest/audio.wav' }
  ]
};

const mapping = createPathMapping(pathRefs, collectionResult);
console.log('Mapping:', mapping);
```

Test URL encoding:
```javascript
const path = '/Users/me/My Project/video file.mp4';
const encoded = encodePathUrl(path);
console.log('Encoded:', encoded);
// Should be: file://localhost/Users/me/My%20Project/video%20file.mp4
```

---

### Known Limitations

1. **Premiere Pro Version Compatibility**: Tested primarily with recent versions. Older versions may have different XML schemas.

2. **MOGRT Templates**: Motion Graphics Templates with embedded paths may not fully relink if paths are deeply nested in template structure.

3. **Plugin References**: Third-party plugins with file references may not be detected.

4. **Dynamic Link**: After Effects compositions via Dynamic Link won't be relinked (separate .aep files).

5. **Network Paths**: UNC paths (\\server\share) may have limited support depending on platform.

---

**Phase 5 Testing Status**: Ready for testing ✅
**Estimated Testing Time**: 2-3 hours for complete test suite

---

## Phase 6: UI/UX Polish Testing

**Status:** ✅ Complete

### What to Test

1. **Panel Layout & Organization**
   - All controls visible and properly spaced
   - Sections clearly labeled (Step 1, Step 2, etc.)
   - Controls organized in logical workflow order
   - Responsive to different panel sizes

2. **Visual States & Feedback**
   - Buttons disabled until destination selected
   - Disabled button has obvious visual state
   - "Collect Files" button hint changes based on state
   - Progress bar shows active animation during collection
   - Results section displays with proper styling

3. **Color & Typography**
   - Dark theme matches Premiere Pro design
   - All text readable (sufficient contrast)
   - Section titles uppercase with letter spacing
   - Descriptions use secondary text color
   - Error messages use red accent color
   - Success results use green accent color

4. **Component Polish**
   - Input fields have proper focus states
   - Checkboxes are properly styled and clickable
   - Progress bar has smooth animation and glow effect
   - Status messages appear/disappear smoothly
   - Results grid responsive on narrow panels

### Testing Steps

#### Test 6.1: Panel Load and Layout

**Preparation:**
1. Open Premiere Pro
2. Open Asset Collector panel
3. Maximize and minimize panel to test responsiveness

**Steps:**
1. Observe initial panel state:
   - Header visible with title "Asset Collector"
   - Subtitle: "Consolidate project assets into one folder"
   - Section 1: Destination folder selector
   - Section 2: Options categories
   - Collect button present

2. Observe panel styling:
   - Dark background (#2b2b2b matches Premiere Pro)
   - All text is readable
   - Proper spacing between sections
   - No visual clipping or overflow

3. Resize panel:
   - Drag panel edge to shrink width
   - Confirm controls stack properly
   - Confirm text wraps appropriately
   - Confirm buttons remain clickable

**Expected Results:**
```
✓ All elements visible on initial load
✓ Typography matches Premiere Pro (Adobe Clean font)
✓ Dark theme is consistent throughout
✓ No visual clipping on resize
✓ All text readable with proper contrast
✓ Spacing maintains visual hierarchy
```

#### Test 6.2: Button States and Interactions

**Preparation:**
1. Open Asset Collector panel
2. Don't select a destination folder yet

**Steps:**
1. Observe "Collect Files" button:
   - Should be disabled (grayed out)
   - Should show hint: "Select destination folder first"
   - Should not be clickable

2. Click "Browse" button:
   - Should be enabled (blue)
   - Should have hover effect (slightly darker blue)
   - Dialog should open

3. Select a destination folder:
   - Collect button should become enabled
   - Button should turn blue
   - Hint should change to "Ready to collect"

4. Observe hover states:
   - Browse button has darker background on hover
   - Collect button has darker blue on hover

**Expected Results:**
```
✓ Collect button disabled initially
✓ Disabled button is clearly visually different
✓ Browse button is always enabled
✓ Buttons have hover effects
✓ Button text is clear and readable
✓ Hint text updates appropriately
```

#### Test 6.3: Checkbox Styling and States

**Preparation:**
Use test project from Phase 4

**Steps:**
1. Observe checkbox styling:
   - Checkboxes are 16px square
   - Boxes have proper styling (not default browser style)
   - Checkmarks visible when checked

2. Click each checkbox:
   - "Include unused clips"
   - "Maintain folder structure"
   - "Consolidate duplicate files"

3. Verify visual feedback:
   - Checkmark appears/disappears
   - Label text changes color on hover
   - Cursor changes to pointer over label

4. Observe option groups:
   - "What to Collect" section
   - "Folder Organization" section
   - Each has background container
   - Clear category title above each

**Expected Results:**
```
✓ Checkboxes styled consistently
✓ All checkmarks visible when checked
✓ Labels are clickable
✓ Options grouped in categories with backgrounds
✓ Category titles are uppercase and small
✓ No browser default styling visible
```

#### Test 6.4: Progress Bar Animation

**Preparation:**
Create test project with 5-10 small files

**Steps:**
1. Click "Collect Files" button
2. Observe progress bar:
   - Starts at 0%
   - Animates smoothly to 100%
   - Has blue gradient fill
   - Has glow effect around bar
   - No jerky or jumpy movements

3. Observe progress text:
   - Updates as operation progresses
   - Shows current status message
   - Shows file count (e.g., "5/10 files")

4. Observe subtext:
   - Shows secondary information
   - Updates with operation stage
   - Clear and helpful

**Expected Results:**
```
✓ Progress bar animation is smooth
✓ Gradient fill visible on bar
✓ Glow effect present around progress fill
✓ Status text updates regularly
✓ Progress percentage increases smoothly
✓ No visual stuttering during animation
```

#### Test 6.5: Results Display Styling

**Preparation:**
Complete a file collection operation

**Steps:**
1. Observe results section appearance:
   - Background color matches secondary (#323232)
   - Green left border (3px) indicates success
   - Grid layout displays 4 items: Files, Size, Missing, Errors

2. Verify grid layout:
   - 2 columns on normal panel width
   - Stacks to 1 column on narrow panel
   - Proper spacing between items

3. Observe result values:
   - Large green text for numbers
   - Uppercase gray labels below
   - Easy to scan and read

**Expected Results:**
```
✓ Results displayed with success styling
✓ Green accent color used for positive results
✓ Grid layout responsive
✓ Values clearly visible in large text
✓ Labels descriptive and uppercase
✓ Overall design cohesive with rest of panel
```

#### Test 6.6: Error Display Styling

**Preparation:**
Create scenario with permission errors (see Test 4.8)

**Steps:**
1. Attempt collection with read-only destination
2. Observe error section:
   - Background with red/pink tint
   - Red left border (3px)
   - "Errors" heading in red
   - Error list below heading

3. Verify error messages:
   - Text is readable (white on dark background)
   - Messages are specific and helpful
   - No file paths truncated
   - Line breaks handled properly

4. Clear the error:
   - Select different destination
   - Run operation again
   - Errors should clear or update

**Expected Results:**
```
✓ Error section has distinct red styling
✓ Error heading clearly visible
✓ Error messages are readable
✓ Error details are specific
✓ Error section appears/disappears as needed
✓ No text overflow or clipping
```

#### Test 6.7: Status Message Display

**Preparation:**
Perform various operations to trigger status messages

**Steps:**
1. Trigger different status types:
   - Info message: "Extension loaded" on startup
   - Success message: After file collection
   - Warning message: For offline files
   - Error message: For permission errors

2. Observe each message:
   - Appears near bottom of panel
   - Color matches message type
   - Clear text is readable
   - Auto-dismisses after 5 seconds (except errors)

3. Verify status styling:
   - Info: Blue left border
   - Success: Green left border
   - Warning: Orange left border
   - Error: Red left border
   - All have semi-transparent backgrounds

**Expected Results:**
```
✓ All status message types display correctly
✓ Colors match message type
✓ Messages auto-dismiss appropriately
✓ Error messages persist until user action
✓ Animation smooth on appearance
✓ Text is always readable
```

#### Test 6.8: Panel Responsiveness

**Preparation:**
Open Asset Collector panel

**Steps:**
1. Resize panel to different widths:
   - Full width (normal)
   - Narrow width (200px)
   - Very narrow (150px)

2. At each width, verify:
   - All controls still visible
   - Text doesn't overflow
   - Buttons remain clickable
   - Layout adjusts properly

3. Check specific elements:
   - Input field with button pair
   - Checkbox options with labels
   - Results grid (2 cols → 1 col)
   - Progress bar
   - Buttons

**Expected Results:**
```
✓ Panel usable at minimum width
✓ No horizontal scroll needed
✓ Text wraps appropriately
✓ Layout remains organized
✓ All buttons/inputs clickable
✓ Responsive breakpoints work correctly
```

### Console Testing - Phase 6

Test UI functions directly from console:

```javascript
// Test 1: Update progress
updateProgress(25, 'Testing progress bar...', '5/20 files');
updateProgress(50, 'Halfway there...', '10/20 files');
updateProgress(100, 'Complete!', 'All files copied');

// Test 2: Show status messages of different types
showStatus('This is an info message', 'info');
showStatus('Success! Files collected.', 'success');
showStatus('Warning: Some files offline', 'warning');
showStatus('Error: Permission denied', 'error');

// Test 3: Format file sizes
console.log('1048576 bytes =', formatBytes(1048576));  // 1 MB
console.log('1099511627776 bytes =', formatBytes(1099511627776));  // 1 TB
```

Access console via: **Help > Debugging > Enable Remote Debugging** → Open `http://localhost:8090`

### Phase 6 Checklist

- [ ] Panel layout displays correctly on first load
- [ ] All sections and labels are visible
- [ ] Button states (enabled/disabled) work correctly
- [ ] Hover states visible on all buttons
- [ ] Checkboxes styled consistently
- [ ] Option grouping and categories clear
- [ ] Progress bar animates smoothly
- [ ] Progress text updates during operation
- [ ] Results display with proper styling
- [ ] Error messages display with red styling
- [ ] Status messages appear/disappear correctly
- [ ] Panel responsive at different widths
- [ ] No text overflow or clipping
- [ ] All colors match design specification
- [ ] Typography consistent throughout
- [ ] Transitions and animations smooth

---

## Phase 7: Testing & Refinement

**Status:** 🔜 In Progress

### What to Test

1. **End-to-End Workflow**
   - Complete collection process works
   - Collected assets are in correct locations
   - Results accurately reflect what was copied

2. **Performance**
   - Works with large projects (100+ assets)
   - Works with large files (50+ GB total)
   - No UI freezing during operations
   - Reasonable time estimates

3. **Reliability**
   - Repeated collections produce consistent results
   - Works across multiple test projects
   - Handles various file types and encodings

### Testing Steps (To be completed in Phase 7)

```
[To be implemented in Phase 7]
```

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
