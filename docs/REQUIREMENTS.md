# Adobe Premiere Pro Asset Collection Extension

## Project Overview
Build an Adobe Premiere Pro extension that consolidates all project assets (footage, audio, graphics, etc.) into a single folder structure, similar to After Effects' "Dependencies > Collect Files" feature. This enables easy project handoff and archival.

## Core Requirements

### Primary Functionality
- **Asset Collection**: Enumerate all media assets referenced in a Premiere Pro project
- **File Copying**: Copy all referenced files to a designated destination folder
- **Folder Structure**: Maintain or create organized folder structure for collected assets
- **Project Relinking**: Update project file references to point to collected asset locations
- **Save Integration**: Trigger collection process during or after project save

### User Interface Requirements
- Panel-based extension integrated into Premiere Pro workspace
- Destination folder selector (browse button)
- Collection options:
  - Include unused clips (assets in project but not in sequences)
  - Maintain original folder structure vs. flatten to single folder
  - Copy or consolidate (reduce duplicates)
- Progress indicator during collection process
- Results summary showing:
  - Number of files collected
  - Total size
  - Any missing or offline files
  - Errors encountered

## Technical Stack

### Framework Decision
**Recommended: UXP (Unified Extensibility Platform)**
- Modern API support
- Better file system access
- Active development by Adobe
- Node.js-like environment

**Alternative: CEP (Common Extensibility Platform)**
- Broader compatibility with older Premiere versions (pre-2022)
- ExtendScript for host communication
- More mature but deprecated

### Technology Components
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Premiere API**: Adobe Premiere Pro UXP/CEP scripting API
- **File Operations**: Node.js fs module (UXP) or CSInterface file APIs (CEP)
- **Build Tools**: npm, webpack (optional)

## Architecture

### Extension Structure (UXP)
```
PremierExtension/
├── manifest.json          # Extension manifest and permissions
├── package.json           # Node.js dependencies
├── index.html             # UI panel layout
├── index.js               # Main extension logic
├── css/
│   └── styles.css        # Panel styling
├── js/
│   ├── assetCollector.js # Asset enumeration logic
│   ├── fileOperations.js # File copying utilities
│   └── projectAPI.js     # Premiere Pro API wrapper
└── icons/
    ├── icon-dark.png     # Panel icon (dark theme)
    └── icon-light.png    # Panel icon (light theme)
```

### Key Components

#### 1. Manifest Configuration
- **Host Application**: Adobe Premiere Pro (version requirements)
- **Permissions**: File system read/write, network (if needed)
- **Entry Points**: Panel definition, menu integration
- **Minimum Version**: Define minimum Premiere Pro version support

#### 2. Asset Enumeration Module (`assetCollector.js`)
- Access `app.project.rootItem` to get project structure
- Recursively traverse project bins/folders
- Extract file paths from:
  - Video clips (`ProjectItem.type === ProjectItemType.CLIP`)
  - Audio files
  - Still images
  - Graphics/titles
  - Sequences (nested assets)
- Filter duplicates
- Track online vs. offline status
- Option to include/exclude unused assets

#### 3. File Operations Module (`fileOperations.js`)
- Copy files from source to destination
- Create folder structure:
  - Option 1: Maintain original hierarchy
  - Option 2: Flatten with naming convention (avoid conflicts)
  - Option 3: Organize by type (Video/, Audio/, Graphics/)
- Handle large files (streaming copy with progress)
- Error handling:
  - Missing source files
  - Insufficient disk space
  - Permission errors
  - File name conflicts

#### 4. Project Relinking Module
- Create new project file or modify existing
- Update file paths for all collected assets
- Preserve sequence structure and edits
- Option to save as new project or overwrite

#### 5. UI Controller (`index.js`)
- Initialize panel
- Handle user interactions
- Show/update progress
- Display results
- Error messaging

## Implementation Tasks

### Phase 1: Setup & Boilerplate
- [ ] Create UXP extension manifest with Premiere Pro host configuration
- [ ] Set up package.json with dependencies
- [ ] Create basic HTML panel structure
- [ ] Implement extension loading and initialization
- [ ] Add debug configuration for local testing

### Phase 2: Premiere Pro API Integration
- [ ] Research and document available Premiere Pro UXP APIs
- [ ] Implement project access (`app.project`)
- [ ] Create function to enumerate all project items
- [ ] Test retrieval of file paths from different asset types
- [ ] Handle edge cases (offline files, generated content, titles)

### Phase 3: Asset Collection Logic
- [ ] Implement recursive project tree traversal
- [ ] Extract and deduplicate file paths
- [ ] Categorize assets by type
- [ ] Identify unused vs. used assets (in sequences)
- [ ] Calculate total size for collection

### Phase 4: File Operations
- [ ] Implement destination folder selection
- [ ] Create folder structure at destination
- [ ] Implement file copying with progress tracking
- [ ] Add error handling and retry logic
- [ ] Handle file name conflicts (rename vs. skip vs. overwrite)

### Phase 5: Project Relinking
- [ ] Research project file format (.prproj)
- [ ] Implement path updating logic
- [ ] Save modified project to destination
- [ ] Test with various project structures

### Phase 6: UI/UX
- [ ] Design panel layout and styling
- [ ] Implement all UI controls
- [ ] Add progress bar and status messages
- [ ] Create results/summary view
- [ ] Polish styling for light/dark themes

### Phase 7: Testing & Refinement
- [ ] Test with small projects
- [ ] Test with large projects (100+ assets)
- [ ] Test error scenarios (missing files, permissions)
- [ ] Test on different Premiere Pro versions
- [ ] Performance optimization

### Phase 8: Documentation & Packaging
- [ ] Write user documentation
- [ ] Create installation instructions
- [ ] Package extension for distribution (.zxp or .ccx)
- [ ] Add licensing information

## Premiere Pro API Requirements

### Critical APIs Needed
- `app.project` - Access to active project
- `app.project.rootItem` - Root of project structure
- `ProjectItem` objects with properties:
  - `name` - Item name
  - `type` - Type identifier (clip, bin, sequence)
  - `treePath` - Path in project panel
  - `getMediaPath()` - File system path
  - `isSequence()` - Check if item is sequence
  - `children` - Access child items
- File system APIs - Read/write/copy operations
- `app.project.save()` or `app.project.saveAs()` - Save project

### API Research Needed
- Confirm exact API method names in UXP for Premiere Pro
- Determine how to detect if asset is used in timeline
- Identify how to access sequence items and their media
- Understand project file format for relinking

## User Workflow

### Typical Usage
1. User opens project in Premiere Pro
2. User opens extension panel (Window > Extensions > Asset Collector)
3. User clicks "Select Destination Folder" button
4. User configures options (include unused, maintain structure, etc.)
5. User clicks "Collect Files" button
6. Extension shows progress bar while copying files
7. Extension displays summary of collected files
8. Extension saves project with updated paths to destination folder
9. User can now zip/transfer the destination folder with all assets

## Edge Cases & Considerations

### File Handling
- **Missing/Offline Files**: Show in results, skip copying, mark as error
- **Duplicate File Names**: Rename with suffix or parent folder name
- **Linked vs. Embedded**: Handle dynamically linked files vs. embedded media
- **Generated Content**: Handle titles, color mattes, bars/tone (no source file)
- **Proxies**: Collect original media, proxies, or both?

### Project Structure
- **Nested Sequences**: Ensure all sequence contents are included
- **Shared Assets**: Handle assets used multiple times (copy once)
- **External Projects**: Handle imported sequences from other projects
- **Motion Graphics Templates**: Handle .mogrt files and their dependencies

### Performance
- **Large Files**: Stream copy to avoid memory issues
- **Many Files**: Batch operations, show meaningful progress
- **Network Drives**: Handle slower I/O, potential timeouts

### Cross-Platform
- **Path Separators**: Handle Windows (`\`) vs. Mac/Linux (`/`)
- **Drive Letters**: Windows-specific path handling
- **Case Sensitivity**: macOS/Linux case-sensitive vs. Windows case-insensitive
- **Special Characters**: Handle spaces, unicode, special chars in file names

## Success Criteria
- Extension loads successfully in Premiere Pro
- Can enumerate and display all project assets
- Successfully copies all online media to destination folder
- Maintains folder organization (if selected)
- Creates working project file with correct paths
- Handles projects with 100+ assets without crashing
- Clear error messages for all failure scenarios
- Professional, intuitive UI matching Premiere Pro design language

## Future Enhancements (Post-MVP)
- Auto-transcode to specific codec during collection
- Create archive package (.zip) automatically
- Email notification when collection completes
- Cloud storage integration (Google Drive, Dropbox, etc.)
- Version comparison (show what changed between collections)
- Undo collection (restore original project state)
- Batch collection for multiple projects
- Integration with project management tools

## Resources & References
- [Adobe UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [Premiere Pro Scripting Guide](https://ppro-scripting.docsforadobe.dev/)
- [CEP Resources](https://github.com/Adobe-CEP/CEP-Resources) (if using CEP)
- Adobe Developer Console for extension distribution

## Notes
- Start with UXP for modern API access
- Focus on MVP: collect files, maintain structure, basic UI
- Can always add advanced features later
- Test extensively with real projects before distribution
- Consider open-sourcing to get community feedback
