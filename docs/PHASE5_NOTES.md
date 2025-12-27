# Phase 5: Project Relinking - Implementation Notes

## Overview

Phase 5 implements automatic project relinking to enable seamless editor handoff. When assets are collected and copied to a new location, the project file must be updated to reference the new asset paths, allowing the receiving editor to open the project without manual relinking.

## Research: .prproj File Format

### File Structure
Adobe Premiere Pro project files (.prproj) are **GZip-compressed XML** files:
- Container format: GZip compression
- Inner format: XML document
- Encoding: UTF-8
- Schema: Proprietary Adobe format, varies by Premiere Pro version

### Key XML Structure Elements

Based on research and documentation, .prproj files contain these critical elements:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PremiereData Version="3">
  <Project>
    <!-- Project settings and metadata -->
  </Project>
  
  <Media>
    <!-- Media references - THIS IS WHERE PATHS ARE STORED -->
    <Video>
      <ClipItem>
        <File pathurl="file://localhost/path/to/video.mp4"/>
        <pathurl>file://localhost/path/to/video.mp4</pathurl>
      </ClipItem>
    </Video>
    <Audio>
      <ClipItem>
        <File pathurl="file://localhost/path/to/audio.wav"/>
      </ClipItem>
    </Audio>
  </Media>
  
  <Sequences>
    <!-- Timeline sequences -->
  </Sequences>
</PremiereData>
```

### Path Reference Patterns

Media file paths appear in multiple formats:
1. **File URL format**: `file://localhost/C:/path/to/file.mp4`
2. **Absolute paths**: `/Users/username/project/footage.mov`
3. **Relative paths**: `./footage/clip.mp4`
4. **Network paths**: `file://server/share/media.mp4`
5. **URL-encoded spaces**: `file://localhost/path%20with%20spaces/file.mp4`

### XML Nodes Containing Paths

Critical XML elements that may contain file paths:
- `<pathurl>` - Primary media file path
- `<File pathurl="">` - Alternative path attribute
- `<relativeurl>` - Relative path reference
- `<filepath>` - Direct file path
- `<MediaPath>` - Legacy path reference
- `<PreviewFile>` - Render/preview file paths
- `<CaptureFile>` - Capture scratch paths
- `<AudioPreview>` - Audio preview file paths

## Implementation Strategy

### Phase 5.1: Project File I/O ✅
Create utilities to read and decompress .prproj files:
1. Read .prproj file as binary
2. Decompress using GZip
3. Parse XML to DOM
4. Extract path references
5. Validate XML structure

### Phase 5.2: Path Extraction & Mapping
Extract and categorize all media paths:
1. Find all XML nodes with path attributes
2. Extract URLs and decode URL encoding
3. Normalize path separators (\ vs /)
4. Distinguish absolute vs relative paths
5. Create old-to-new path mapping

### Phase 5.3: Path Rewriting Logic
Transform old paths to new paths based on folder mode:

**Folder Mode: Maintain Structure**
- Preserve original folder hierarchy
- Map `/original/project/footage/clip.mp4` → `<dest>/footage/clip.mp4`
- Keep relative structure intact

**Folder Mode: By Type**
- Group by media type
- Map `/original/anywhere/video.mp4` → `<dest>/video/video.mp4`
- Map `/original/anywhere/audio.wav` → `<dest>/audio/audio.wav`

**Folder Mode: Flat**
- All files in single directory
- Map `/original/path/file.mp4` → `<dest>/file.mp4`
- Handle name conflicts with numbering

### Phase 5.4: XML Rewriting
Update XML with new paths:
1. Replace path values in DOM
2. URL-encode new paths properly
3. Convert to relative paths when possible
4. Preserve XML formatting and attributes

### Phase 5.5: Project File Writing
Write updated project file:
1. Serialize XML DOM to string
2. GZip compress XML
3. Write to new .prproj file
4. Create backup of original
5. Validate output file

### Phase 5.6: Validation & Safety
Ensure safe operation:
1. Validate XML before writing
2. Verify all paths are accessible
3. Create rollback mechanism
4. Emit clear error messages
5. Never modify original .prproj

## Technical Challenges

### Challenge 1: GZip Compression
**Problem**: .prproj files are GZip compressed, not plain XML
**Solution**: Use UXP file system API with compression support or implement GZip handling

### Challenge 2: Version Variations
**Problem**: Different Premiere Pro versions may have different XML schemas
**Solution**: Focus on common path elements, test with multiple versions, add version detection

### Challenge 3: Path URL Encoding
**Problem**: Spaces and special characters must be URL-encoded
**Solution**: Use proper URL encoding/decoding, handle edge cases like `%20`, `%2C`, etc.

### Challenge 4: Relative vs Absolute Paths
**Problem**: Projects may use mix of relative and absolute paths
**Solution**: Detect path type, prefer relative paths in output for portability

### Challenge 5: Offline/Missing Files
**Problem**: Project may reference files that don't exist
**Solution**: Track and report missing files, allow operation to continue

### Challenge 6: Nested Sequences
**Problem**: Sequences may reference other sequences
**Solution**: Update all sequence references, maintain internal project structure

### Challenge 7: Templates and MOGRTs
**Problem**: Motion Graphics Templates have embedded file paths
**Solution**: Identify MOGRT references, update template paths or document limitation

## API & Libraries Needed

### UXP File System APIs
```javascript
const fs = require('uxp').storage.localFileSystem;
const File = require('uxp').storage.File;

// Read binary file
const file = await fs.getFileForOpening();
const arrayBuffer = await file.read({ format: 'binary' });

// Write binary file
await file.write(arrayBuffer, { format: 'binary' });
```

### XML Parsing
```javascript
// Parse XML string to DOM
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlString, "text/xml");

// Query XML
const pathNodes = xmlDoc.querySelectorAll('[pathurl]');

// Serialize back to string
const serializer = new XMLSerializer();
const xmlString = serializer.serializeToString(xmlDoc);
```

### Compression (if not built into UXP)
May need to use:
- `pako` library for GZip compression/decompression
- Or native Node.js `zlib` if available in UXP

## Implementation Plan

### Step 1: Create projectRelinking.js Module
New file: `src/js/projectRelinking.js`
- `decompressProject(filePath)` - Read and decompress .prproj
- `extractPaths(xmlDoc)` - Extract all media paths from XML
- `createPathMapping(oldPaths, newPaths, mode)` - Map old to new paths
- `rewritePaths(xmlDoc, pathMapping)` - Update XML with new paths
- `compressProject(xmlDoc, outputPath)` - Write new .prproj file
- `validateProject(xmlDoc)` - Verify XML structure and paths

### Step 2: Integrate with fileOperations.js
Update `collectAssets()` function:
1. After copying files, collect path mapping
2. Call project relinking functions
3. Save updated .prproj to destination
4. Report relinking success/failure

### Step 3: Update UI
Add status messages for relinking:
- "Updating project file..."
- "Project relinked successfully"
- "Warning: Some paths could not be relinked"

### Step 4: Error Handling
- Backup original project before modifying
- Validate XML before writing
- Rollback on failure
- Clear error messages for users

## Edge Cases to Handle

1. **Mixed path separators**: `C:\path\file.mp4` vs `/path/file.mp4`
2. **Network paths**: `\\server\share\file.mp4` or `smb://server/share/file.mp4`
3. **Special characters**: Spaces, unicode, symbols in filenames
4. **Deeply nested folders**: Very long path names
5. **Duplicate filenames**: Same filename in different folders
6. **Offline markers**: Files marked as offline in project
7. **Proxy files**: Linked proxy media
8. **Render files**: Cached render/preview files
9. **Capture scratch**: Dynamic capture locations
10. **Plugin content**: Third-party plugin file references

## Testing Strategy

### Unit Tests
- Test GZip compression/decompression
- Test XML parsing and serialization
- Test path extraction from various formats
- Test path mapping logic for each folder mode
- Test URL encoding/decoding

### Integration Tests
- Test with small project (5-10 clips)
- Test with medium project (50+ clips)
- Test with large project (200+ clips)
- Test with mixed media types (video, audio, images)
- Test with nested sequences
- Test with offline files

### Edge Case Tests
- Project with spaces in filenames
- Project with unicode characters
- Project with network paths
- Project with nested folder structures
- Project with duplicate filenames

## Success Criteria

Phase 5 is complete when:
- ✅ Can read and decompress .prproj files
- ✅ Can extract all media file paths
- ✅ Can map old paths to new paths correctly
- ✅ Can rewrite XML with new paths
- ✅ Can compress and save updated .prproj
- ✅ Validation prevents corrupted projects
- ✅ Error handling with rollback works
- ✅ All three folder modes work correctly
- ✅ Edge cases handled gracefully
- ✅ Comprehensive tests pass

## Risks & Mitigation

### Risk 1: Corrupting Project Files
**Mitigation**: Always create backup, validate XML, never modify original, extensive testing

### Risk 2: Version Incompatibility
**Mitigation**: Test with multiple Premiere versions, graceful degradation, clear error messages

### Risk 3: Performance with Large Projects
**Mitigation**: Stream processing for large files, progress indicators, async operations

### Risk 4: Incomplete Path Updates
**Mitigation**: Comprehensive path extraction, verify all nodes updated, report missing updates

## Next Steps

1. ✅ Create this documentation file
2. 🔄 Implement project file I/O utilities
3. ⏳ Implement path extraction logic
4. ⏳ Implement path rewriting logic
5. ⏳ Implement project file writing
6. ⏳ Add validation and error handling
7. ⏳ Handle edge cases
8. ⏳ Create comprehensive tests
9. ⏳ Update documentation

## References

- UXP File System API: https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/
- DOMParser API: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
- XMLSerializer API: https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer
- URL Encoding: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

---

**Status**: Phase 5.1 in progress
**Last Updated**: December 27, 2025
