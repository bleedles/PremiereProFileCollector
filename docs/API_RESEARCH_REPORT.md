# Adobe Premiere Pro UXP API Research Report
## Project Asset Enumeration & Access

**Generated:** December 24, 2025  
**Purpose:** Research documentation for implementing asset collection functionality

---

## Executive Summary

This report documents the Adobe Premiere Pro UXP (Unified Extensibility Platform) API, focusing on accessing project data and enumerating assets. UXP is the modern replacement for CEP (Common Extensibility Platform) and ExtendScript, available in Premiere Pro v25.6+.

### Key Findings

✅ **Comprehensive API Available** - Full access to project structure, items, sequences, and file paths  
✅ **Modern JavaScript/Async** - All methods use modern async/await patterns  
✅ **Rich Type System** - TypeScript definitions available  
✅ **Well-Documented** - Official documentation with code samples  

---

## 1. Accessing the Current Project

### Basic Project Access

```javascript
const ppro = require('premierepro');

// Get the currently active project
const project = await ppro.Project.getActiveProject();
```

### Key Project Methods

| Method | Returns | Description | Min Version |
|--------|---------|-------------|-------------|
| `Project.getActiveProject()` | `Promise<Project>` | Get currently active project | 25.0 |
| `Project.open(path, options?)` | `Promise<Project>` | Open a project file | 25.0 |
| `Project.createProject(path)` | `Promise<Project>` | Create new project | 25.0 |
| `Project.getProject(guid)` | `Project` | Get project by GUID | 25.0 |

### Important Notes

- **All properties are synchronous** - Unlike methods, property getters don't need `await`
- **Methods are async** - All method calls should be awaited
- **Transition from ExtendScript** - UXP methods are non-blocking (async) unlike ExtendScript which was synchronous

---

## 2. Traversing Project Structure

### Getting the Root Item

```javascript
const project = await ppro.Project.getActiveProject();
const rootItem = await project.getRootItem();  // Returns FolderItem
```

### Enumerating Project Items

```javascript
// Get all items in root
const projectItems = await rootItem.getItems();  // Returns ProjectItem[]

// Iterate through items
for (const item of projectItems) {
    console.log(`Name: ${item.name}`);
    console.log(`Type: ${item.type}`);
    
    // Check if it's a folder
    const folderItem = ppro.FolderItem.cast(item);
    if (folderItem) {
        // Recursively get children
        const childItems = await folderItem.getItems();
        // Process children...
    }
    
    // Check if it's a clip
    const clipItem = ppro.ClipProjectItem.cast(item);
    if (clipItem) {
        // Access clip-specific properties
        const mediaPath = await clipItem.getMediaFilePath();
        const isOffline = await clipItem.isOffline();
    }
}
```

### Recursive Traversal Pattern

```javascript
async function traverseProjectItems(folderItem, depth = 0) {
    const items = await folderItem.getItems();
    
    for (const item of items) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}${item.name} (${item.type})`);
        
        // Check if folder and recurse
        const folder = ppro.FolderItem.cast(item);
        if (folder) {
            await traverseProjectItems(folder, depth + 1);
        }
    }
}

// Usage
const project = await ppro.Project.getActiveProject();
const rootItem = await project.getRootItem();
await traverseProjectItems(rootItem);
```

---

## 3. ProjectItem Object Hierarchy

### Type Hierarchy

```
ProjectItem (base class)
  ├── FolderItem (bins/folders)
  └── ClipProjectItem (media clips & sequences)
```

### ProjectItem Properties (Base)

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Name of the project item |
| `type` | `number` | Type constant (see below) |

### ProjectItem Methods (Base)

| Method | Returns | Description |
|--------|---------|-------------|
| `getId()` | `string` | Unique identifier |
| `getParentBin()` | `FolderItem` | Parent folder |
| `getProject()` | `Promise<Project>` | Parent project |
| `getColorLabelIndex()` | `Promise<number>` | Color label index |
| `createSetNameAction(name)` | `Action` | Create rename action |
| `createSetColorLabelAction(index)` | `Action` | Create color label action |

### Type Constants

```javascript
ppro.ProjectItem.TYPE_CLIP      // 1 - Media clips
ppro.ProjectItem.TYPE_BIN       // 2 - Folders/bins
ppro.ProjectItem.TYPE_ROOT      // 3 - Root container
ppro.ProjectItem.TYPE_FILE      // 4 - Generic files
ppro.ProjectItem.TYPE_STYLE     // 5 - Styles
ppro.ProjectItem.TYPE_COMPOUND  // 6 - Compound clips
```

---

## 4. FolderItem (Bins/Folders)

### Key Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getItems()` | `Promise<ProjectItem[]>` | Get all child items |
| `createBinAction(name, makeUnique)` | `Action` | Create new bin |
| `createSmartBinAction(name, query)` | `Action` | Create smart bin |
| `createRemoveItemAction(item)` | `Action` | Remove item from folder |
| `createMoveItemAction(item, newParent)` | `Action` | Move item to another folder |

### Casting Pattern

```javascript
const folderItem = ppro.FolderItem.cast(projectItem);
if (folderItem) {
    // It's a folder, access folder-specific methods
    const children = await folderItem.getItems();
}
```

---

## 5. ClipProjectItem (Media Clips)

### Essential Properties & Methods

| Method | Returns | Description | Min Version |
|--------|---------|-------------|-------------|
| `getMediaFilePath()` | `Promise<string>` | Get file path of media | 25.0 |
| `isOffline()` | `Promise<boolean>` | Check if media is offline | 25.0 |
| `isSequence()` | `Promise<boolean>` | Check if item is a sequence | 25.0 |
| `getContentType()` | `Promise<Constants.ContentType>` | Get content type (MEDIA/SEQUENCE) | 25.0 |
| `getSequence()` | `Promise<Sequence>` | Get sequence if item is sequence | 25.0 |
| `getMedia()` | `Promise<Media>` | Get media object | 25.0 |
| `canProxy()` | `Promise<boolean>` | Check if can attach proxy | 25.0 |
| `hasProxy()` | `Promise<boolean>` | Check if has proxy attached | 25.0 |
| `getProxyPath()` | `Promise<string>` | Get proxy file path | 25.0 |
| `isMergedClip()` | `Promise<boolean>` | Check if merged clip | 25.0 |
| `isMulticamClip()` | `Promise<boolean>` | Check if multicam clip | 25.0 |

### Additional Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getInPoint(mediaType)` | `Promise<TickTime>` | Get in point |
| `getOutPoint(mediaType)` | `Promise<TickTime>` | Get out point |
| `getColorLabelIndex()` | `Promise<number>` | Get color label |
| `canChangeMediaPath()` | `Promise<boolean>` | Check if can relink |
| `changeMediaFilePath(path, override?)` | `Promise<boolean>` | Relink media file |
| `attachProxy(path, isHiRes, ...)` | `Promise<boolean>` | Attach proxy/hi-res |
| `refreshMedia()` | `Promise<boolean>` | Refresh media representation |

### Casting Pattern

```javascript
const clipItem = ppro.ClipProjectItem.cast(projectItem);
if (clipItem) {
    const mediaPath = await clipItem.getMediaFilePath();
    const offline = await clipItem.isOffline();
    const isSeq = await clipItem.isSequence();
}
```

---

## 6. Detecting Asset Types

### Content Type Constants

```javascript
ppro.Constants.ContentType.ANY       // Any content type
ppro.Constants.ContentType.SEQUENCE  // Sequence
ppro.Constants.ContentType.MEDIA     // Media clip
```

### Media Type Constants

```javascript
ppro.Constants.MediaType.ANY    // Any media type
ppro.Constants.MediaType.VIDEO  // Video
ppro.Constants.MediaType.AUDIO  // Audio
ppro.Constants.MediaType.DATA   // Data
```

### Type Detection Pattern

```javascript
const clipItem = ppro.ClipProjectItem.cast(projectItem);
if (clipItem) {
    // Check content type
    const contentType = await clipItem.getContentType();
    
    if (contentType === ppro.Constants.ContentType.SEQUENCE) {
        console.log('This is a sequence');
        const sequence = await clipItem.getSequence();
        // Process sequence...
    } else if (contentType === ppro.Constants.ContentType.MEDIA) {
        console.log('This is a media clip');
        const mediaPath = await clipItem.getMediaFilePath();
        const offline = await clipItem.isOffline();
        
        // Get media object for more details
        const media = await clipItem.getMedia();
        const duration = media.duration;  // TickTime object
        const start = media.start;
    }
}
```

---

## 7. Getting File Paths from Clips

### Primary Method

```javascript
const clipItem = ppro.ClipProjectItem.cast(projectItem);
if (clipItem) {
    const filePath = await clipItem.getMediaFilePath();
    console.log(`Media file: ${filePath}`);
}
```

### Checking for Proxies

```javascript
if (await clipItem.hasProxy()) {
    const proxyPath = await clipItem.getProxyPath();
    console.log(`Proxy file: ${proxyPath}`);
}
```

### Media Object Access

```javascript
const media = await clipItem.getMedia();
// Media properties (synchronous):
const duration = media.duration;  // TickTime
const start = media.start;        // TickTime

// Convert TickTime to seconds
const durationSeconds = duration.seconds;
```

---

## 8. Checking Online/Offline Status

```javascript
const clipItem = ppro.ClipProjectItem.cast(projectItem);
if (clipItem) {
    const isOffline = await clipItem.isOffline();
    
    if (isOffline) {
        console.log(`${clipItem.name} is OFFLINE`);
    } else {
        console.log(`${clipItem.name} is online`);
        const path = await clipItem.getMediaFilePath();
        console.log(`Path: ${path}`);
    }
}
```

---

## 9. Accessing Sequences and Their Contents

### Getting All Sequences

```javascript
const project = await ppro.Project.getActiveProject();

// Get all sequences in project
const sequences = await project.getSequences();  // Returns Sequence[]

// Get active sequence
const activeSequence = await project.getActiveSequence();
```

### Sequence Properties & Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getVideoTrackCount()` | `number` | Number of video tracks |
| `getAudioTrackCount()` | `number` | Number of audio tracks |
| `getVideoTrack(index)` | `VideoTrack` | Get video track by index |
| `getAudioTrack(index)` | `AudioTrack` | Get audio track by index |
| `getProjectItem()` | `Promise<ProjectItem>` | Get associated project item |
| `getSettings()` | `Promise<SequenceSettings>` | Get sequence settings |
| `getInPoint()` | `TickTime` | Get in point |
| `getOutPoint()` | `TickTime` | Get out point |
| `getEndTime()` | `TickTime` | Get end time |
| `getPlayerPosition()` | `TickTime` | Get playhead position |

### Accessing Sequence Clips

```javascript
const sequence = await project.getActiveSequence();

// Get video tracks
const videoTrackCount = sequence.getVideoTrackCount();
for (let i = 0; i < videoTrackCount; i++) {
    const videoTrack = sequence.getVideoTrack(i);
    
    // Get all clip items on this track
    const trackItems = await videoTrack.getTrackItems(
        ppro.Constants.TrackItemType.CLIP
    );
    
    for (const trackItem of trackItems) {
        // Get the project item for this track item
        const projectItem = await trackItem.getProjectItem();
        const name = trackItem.name;
        console.log(`Clip on V${i + 1}: ${name}`);
    }
}

// Get audio tracks
const audioTrackCount = sequence.getAudioTrackCount();
for (let i = 0; i < audioTrackCount; i++) {
    const audioTrack = sequence.getAudioTrack(i);
    const trackItems = await audioTrack.getTrackItems(
        ppro.Constants.TrackItemType.CLIP
    );
    
    for (const trackItem of trackItems) {
        const projectItem = await trackItem.getProjectItem();
        console.log(`Clip on A${i + 1}: ${projectItem.name}`);
    }
}
```

### TrackItemType Constants

```javascript
ppro.Constants.TrackItemType.EMPTY      // Empty track space
ppro.Constants.TrackItemType.CLIP       // Clip
ppro.Constants.TrackItemType.TRANSITION // Transition
ppro.Constants.TrackItemType.PREVIEW    // Preview
ppro.Constants.TrackItemType.FEEDBACK   // Feedback
```

---

## 10. Complete Asset Collection Example

### Full Implementation

```javascript
const ppro = require('premierepro');

async function collectAllAssets() {
    const assets = [];
    
    // Get active project
    const project = await ppro.Project.getActiveProject();
    if (!project) {
        console.error('No active project');
        return assets;
    }
    
    // Get root item and traverse
    const rootItem = await project.getRootItem();
    await traverseFolder(rootItem, assets, '');
    
    return assets;
}

async function traverseFolder(folderItem, assets, path) {
    const items = await folderItem.getItems();
    
    for (const item of items) {
        const itemPath = path ? `${path}/${item.name}` : item.name;
        
        // Check if it's a folder - recurse
        const folder = ppro.FolderItem.cast(item);
        if (folder) {
            await traverseFolder(folder, assets, itemPath);
            continue;
        }
        
        // Check if it's a clip
        const clip = ppro.ClipProjectItem.cast(item);
        if (clip) {
            // Determine content type
            const contentType = await clip.getContentType();
            
            if (contentType === ppro.Constants.ContentType.MEDIA) {
                // Regular media clip
                const mediaPath = await clip.getMediaFilePath();
                const isOffline = await clip.isOffline();
                
                // Get media details
                const media = await clip.getMedia();
                const duration = media.duration.seconds;
                
                // Check for proxy
                const hasProxy = await clip.hasProxy();
                const proxyPath = hasProxy ? await clip.getProxyPath() : null;
                
                assets.push({
                    name: item.name,
                    treePath: itemPath,
                    type: 'media',
                    filePath: mediaPath,
                    offline: isOffline,
                    duration: duration,
                    hasProxy: hasProxy,
                    proxyPath: proxyPath,
                    id: item.getId()
                });
                
            } else if (contentType === ppro.Constants.ContentType.SEQUENCE) {
                // Sequence
                const sequence = await clip.getSequence();
                
                assets.push({
                    name: item.name,
                    treePath: itemPath,
                    type: 'sequence',
                    filePath: null,
                    offline: false,
                    videoTracks: sequence.getVideoTrackCount(),
                    audioTracks: sequence.getAudioTrackCount(),
                    id: item.getId()
                });
            }
        }
    }
}

// Usage
const assets = await collectAllAssets();
console.log(`Found ${assets.length} assets`);
assets.forEach(asset => {
    console.log(`${asset.treePath} - ${asset.type} - ${asset.filePath || 'N/A'}`);
});
```

---

## 11. Alternative Approaches & Utilities

### Using ProjectUtils for Selection

```javascript
// Get selected items in project panel
const selection = await ppro.ProjectUtils.getSelection(project);
const selectedItems = await selection.getItems();

// Get project view IDs
const viewIds = await ppro.ProjectUtils.getProjectViewIds();

// Get selection from specific view
const viewSelection = await ppro.ProjectUtils.getSelectionFromViewId(viewIds[0]);
const items = await viewSelection.getItems();
```

### Finding Items by Media Path

```javascript
const clipItem = ppro.ClipProjectItem.cast(projectItem);
if (clipItem) {
    // Find all items with similar media path
    const matchingItems = await clipItem.findItemsMatchingMediaPath('video', false);
    console.log(`Found ${matchingItems.length} matching items`);
}
```

### Metadata Access

```javascript
// Get project metadata
const metadata = await ppro.Metadata.getProjectMetadata(projectItem);

// Get XMP metadata
const xmpMetadata = await ppro.Metadata.getXMPMetadata(projectItem);

// Get project columns metadata (table format)
const columnsMetadata = await ppro.Metadata.getProjectColumnsMetadata(projectItem);
const metadataJson = JSON.parse(columnsMetadata);
```

---

## 12. Important Limitations & Gotchas

### 1. **No Direct `treePath` Property**
- There is NO built-in `treePath` or `getTreePath()` method
- You must build the path manually during traversal
- Store parent relationships if you need bidirectional navigation

### 2. **No Single `children` Property**
- FolderItem has `getItems()` method (async)
- You must call this method to get children
- Not available on ClipProjectItem

### 3. **Type Checking Pattern**
```javascript
// CORRECT way to check types
const folder = ppro.FolderItem.cast(item);
if (folder) {
    // It's a folder
}

const clip = ppro.ClipProjectItem.cast(item);
if (clip) {
    // It's a clip
}

// Also valid: check item.type property
if (item.type === ppro.ProjectItem.TYPE_BIN) {
    // It's a bin/folder
}
```

### 4. **Async/Await Required**
- ALL methods return Promises and must be awaited
- Properties are synchronous but methods are not
- Don't forget `await` or you'll get Promise objects

### 5. **No `getMediaPath()` Method**
- The correct method is `getMediaFilePath()` (not `getMediaPath`)
- Returns a Promise<string>

### 6. **Sequences are ClipProjectItems**
- Sequences are a special type of ClipProjectItem
- Use `getContentType()` or `isSequence()` to distinguish
- They don't have media file paths

### 7. **Action-Based Modifications**
- Most modifications require creating Action objects
- Must be executed within a transaction
- Use `project.executeTransaction()` with `CompoundAction`

```javascript
project.lockedAccess(() => {
    project.executeTransaction((compoundAction) => {
        const action = rootItem.createBinAction("New Bin", true);
        compoundAction.addAction(action);
    });
});
```

---

## 13. ExtendScript vs UXP Differences

### ExtendScript (Old CEP/JSX)
- `app.project` - Direct access to project
- `app.project.rootItem.children` - Array property
- `item.treePath` - Built-in property
- `item.getMediaPath()` - Method name
- Synchronous calls (blocking)
- ECMAScript 3

### UXP (New)
- `ppro.Project.getActiveProject()` - Async method
- `rootItem.getItems()` - Async method
- No `treePath` - Must build manually
- `item.getMediaFilePath()` - Different method name
- Asynchronous calls (non-blocking)
- Modern JavaScript (ES6+)

### Migration Notes
- All project access methods are now async
- Properties like `name` and `type` remain synchronous
- No more direct `app.project` access
- Must `require('premierepro')` to access API
- Actions/transactions required for modifications

---

## 14. Resources & Documentation

### Official Documentation
- **Main UXP Docs:** https://developer.adobe.com/premiere-pro/uxp/
- **API Reference:** https://developer.adobe.com/premiere-pro/uxp/ppro_reference/
- **Classes:** https://developer.adobe.com/premiere-pro/uxp/ppro_reference/classes/
- **Constants:** https://developer.adobe.com/premiere-pro/uxp/ppro_reference/constants/

### GitHub Samples
- **Official Samples:** https://github.com/AdobeDocs/uxp-premiere-pro-samples
- **Sample Panel:** `/sample-panels/premiere-api/`

### TypeScript Definitions
- Available at: https://developer.adobe.com/premiere-pro/uxp/assets/[hash]/types.d.ts
- Add to your project for IntelliSense

### Key Sample Files
- `src/projectPanel.ts` - Project item enumeration examples
- `src/project.ts` - Project access patterns
- `src/sequence.ts` - Sequence manipulation
- `types.d.ts` - Complete type definitions

---

## 15. Recommended Implementation Strategy

### Phase 1: Basic Collection
1. Access active project
2. Get root item
3. Recursively traverse folders
4. Cast items to appropriate types
5. Collect basic info (name, type, path)

### Phase 2: Enhanced Details
1. Check online/offline status
2. Detect asset types (video/audio/image/sequence)
3. Get proxy information
4. Calculate duration
5. Build tree paths

### Phase 3: Sequence Analysis
1. Get all sequences
2. Enumerate tracks
3. Collect clips used in sequences
4. Track usage counts
5. Identify offline media in use

### Sample Starter Code

```javascript
const ppro = require('premierepro');

class AssetCollector {
    constructor() {
        this.assets = [];
    }
    
    async collect() {
        const project = await ppro.Project.getActiveProject();
        if (!project) throw new Error('No active project');
        
        const rootItem = await project.getRootItem();
        await this.traverse(rootItem, '');
        
        return this.assets;
    }
    
    async traverse(folderItem, pathPrefix) {
        const items = await folderItem.getItems();
        
        for (const item of items) {
            const path = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;
            
            // Handle folders
            const folder = ppro.FolderItem.cast(item);
            if (folder) {
                await this.traverse(folder, path);
                continue;
            }
            
            // Handle clips
            const clip = ppro.ClipProjectItem.cast(item);
            if (clip) {
                await this.processClip(clip, path);
            }
        }
    }
    
    async processClip(clip, path) {
        const contentType = await clip.getContentType();
        
        if (contentType === ppro.Constants.ContentType.MEDIA) {
            const asset = {
                name: clip.name,
                treePath: path,
                type: 'media',
                filePath: await clip.getMediaFilePath(),
                offline: await clip.isOffline(),
                hasProxy: await clip.hasProxy()
            };
            
            this.assets.push(asset);
        } else if (contentType === ppro.Constants.ContentType.SEQUENCE) {
            const sequence = await clip.getSequence();
            const asset = {
                name: clip.name,
                treePath: path,
                type: 'sequence',
                videoTracks: sequence.getVideoTrackCount(),
                audioTracks: sequence.getAudioTrackCount()
            };
            
            this.assets.push(asset);
        }
    }
}

// Usage
const collector = new AssetCollector();
const assets = await collector.collect();
console.log(`Collected ${assets.length} assets`);
```

---

## 16. Summary Checklist

### ✅ Confirmed API Capabilities

- [x] Access current project via `Project.getActiveProject()`
- [x] Get root item via `project.getRootItem()`
- [x] Traverse project structure via `folderItem.getItems()`
- [x] Cast items to specific types (FolderItem, ClipProjectItem)
- [x] Get file paths via `clipItem.getMediaFilePath()`
- [x] Check offline status via `clipItem.isOffline()`
- [x] Detect sequences via `clipItem.isSequence()` or `getContentType()`
- [x] Access sequences via `project.getSequences()` or `clipItem.getSequence()`
- [x] Enumerate sequence tracks and clips
- [x] Get proxy information via `hasProxy()` and `getProxyPath()`
- [x] Access metadata
- [x] Distinguish asset types via type constants

### ⚠️ Does NOT Exist

- [ ] ~~`app.project`~~ (use `Project.getActiveProject()`)
- [ ] ~~`item.treePath`~~ (must build manually)
- [ ] ~~`item.children`~~ (use `getItems()` on FolderItem)
- [ ] ~~`getMediaPath()`~~ (use `getMediaFilePath()`)
- [ ] ~~ProjectItemType enum~~ (use type property and constants)

---

## Conclusion

The Adobe Premiere Pro UXP API provides comprehensive access to project data and assets. All required functionality for enumerating project items, detecting types, getting file paths, and checking online/offline status is available through well-documented async methods. The key is understanding the object hierarchy, using proper casting patterns, and building tree paths manually during traversal.

**Next Steps for Implementation:**
1. Set up UXP plugin structure
2. Implement recursive traversal logic
3. Add type detection and casting
4. Build asset data collection
5. Export/display collected data

**References:**
- Primary: https://developer.adobe.com/premiere-pro/uxp/ppro_reference/
- Samples: https://github.com/AdobeDocs/uxp-premiere-pro-samples
- TypeScript Defs: Include `types.d.ts` in project for IntelliSense
