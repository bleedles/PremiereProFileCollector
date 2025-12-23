# Adobe Premiere Pro Asset Collector Extension

A UXP extension for Adobe Premiere Pro that consolidates all project assets into a single folder structure, similar to After Effects' "Dependencies > Collect Files" feature.

## Documentation

- [Full Requirements & Specification](docs/REQUIREMENTS.md)
- [Installation & Usage Guide](docs/README.md)
- [Phase 1 Development Notes](docs/PHASE1_NOTES.md)

## Project Structure

```
PremierExtension/
├── docs/                  # Documentation
│   ├── REQUIREMENTS.md    # Complete specification
│   ├── README.md          # Installation & usage
│   └── PHASE1_NOTES.md    # Phase 1 notes
└── src/                   # Source code
    ├── manifest.json      # UXP extension manifest
    ├── package.json       # Node.js package config
    ├── .debug             # Debug configuration
    ├── index.html         # Main panel UI
    ├── index.js           # Main extension logic
    ├── css/               # Stylesheets
    │   └── styles.css
    ├── js/                # JavaScript modules
    │   ├── assetCollector.js
    │   ├── fileOperations.js
    │   └── projectAPI.js
    └── icons/             # Extension icons
```

## Quick Start

See [docs/README.md](docs/README.md) for complete installation and usage instructions.

### Installation (Development)

1. Enable debug mode in Premiere Pro
2. Create symbolic link to the `src/` directory:
   ```bash
   ln -s "/Users/BlakeNeedleman/Documents/Apps/PremierExtension/src" \
         "$HOME/Library/Application Support/Adobe/CEP/extensions/AssetCollector"
   ```
3. Restart Premiere Pro
4. Open: Window > Extensions > Asset Collector

## Current Status

**Phase 1 Complete**: UI and project structure ready  
**Phase 2 Next**: Premiere Pro API integration for asset enumeration

## License

MIT

## Author

Blake Needleman
