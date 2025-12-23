# Adobe Premiere Pro Asset Collector Extension

## Overview
This extension consolidates all project assets (footage, audio, graphics, etc.) into a single folder structure, similar to After Effects' "Dependencies > Collect Files" feature.

## Installation

### For Development

1. **Enable Debug Mode in Premiere Pro**
   - Edit Premiere Pro's debug configuration file:
     - macOS: `~/Library/Preferences/com.adobe.PPRO.plist`
     - Windows: Registry key `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`
   
   - Add/set the following:
     ```
     PlayerDebugMode = 1
     ```

2. **Link Extension Folder**
   - Create a symbolic link from the extension folder to Premiere Pro's extensions directory:
   
   **macOS:**
   ```bash
   ln -s "/Users/BlakeNeedleman/Documents/Apps/PremierExtension/src" \
         "$HOME/Library/Application Support/Adobe/CEP/extensions/AssetCollector"
   ```
   
   **Windows:**
   ```cmd
   mklink /D "%APPDATA%\Adobe\CEP\extensions\AssetCollector" ^
          "C:\Path\To\PremierExtension\src"
   ```

3. **Restart Premiere Pro**

4. **Open Extension Panel**
   - In Premiere Pro: Window > Extensions > Asset Collector

## Usage

1. Open a project in Premiere Pro
2. Open the Asset Collector panel (Window > Extensions > Asset Collector)
3. Click "Browse" to select a destination folder
4. Configure collection options:
   - **Include unused clips**: Collect all project assets, even if not used in sequences
   - **Maintain folder structure**: Preserve original folder hierarchy
   - **Consolidate duplicate files**: Skip copying duplicate files
5. Click "Collect Files" to start the collection process
6. View progress and results in the panel

## Development Status

### Phase 1: Setup & Boilerplate ✅
- [x] UXP extension manifest
- [x] Package.json
- [x] HTML panel structure
- [x] Main extension logic (index.js)
- [x] CSS styling
- [x] Module stub files
- [x] Debug configuration

### Phase 2: Premiere Pro API Integration (Next)
- [ ] Research Premiere Pro UXP APIs
- [ ] Implement project access
- [ ] Create asset enumeration function
- [ ] Test file path retrieval
- [ ] Handle edge cases

### Future Phases
See [REQUIREMENTS.md](REQUIREMENTS.md) for the full implementation plan.

## Current Limitations

This is an early version with placeholder functionality. The following features are not yet implemented:
- Actual asset enumeration from Premiere Pro projects
- Real file copying operations
- Project relinking
- Full error handling

These will be implemented in subsequent phases.

## Development

### Project Structure
```
PremierExtension/
├── docs/                  # Documentation
│   ├── REQUIREMENTS.md    # Complete specification
│   ├── README.md          # This file
│   └── PHASE1_NOTES.md    # Development notes
└── src/                   # Source code
    ├── manifest.json      # UXP extension manifest
    ├── package.json       # Node.js package configuration
    ├── .debug             # Debug configuration
    ├── index.html         # Main panel UI
    ├── index.js           # Main extension logic
    ├── css/
    │   └── styles.css    # Panel styling
    ├── js/
    │   ├── assetCollector.js # Asset enumeration (stub)
    │   ├── fileOperations.js # File operations (stub)
    │   └── projectAPI.js     # Premiere Pro API wrapper (stub)
    └── icons/            # Extension icons (to be created)
```

### Testing
To test the extension:
1. Ensure debug mode is enabled
2. Link extension folder to CEP extensions directory
3. Open Premiere Pro with a test project
4. Open the extension panel
5. Check browser console (Help > Debugging > Enable Remote Debugging) for logs

### Next Steps
1. Research available Premiere Pro UXP scripting APIs
2. Test basic project access
3. Implement asset enumeration logic
4. Add file system operations

## License
MIT

## Author
Blake Needleman
