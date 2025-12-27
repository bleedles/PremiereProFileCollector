/**
 * Project Relinking Module
 * Handles updating Premiere Pro project files (.prproj) with new asset paths
 * after collection and copying to a new location.
 * 
 * .prproj files are GZip-compressed XML files. This module:
 * 1. Decompresses the project file
 * 2. Parses the XML structure
 * 3. Extracts and maps media file paths
 * 4. Rewrites paths to new locations
 * 5. Compresses and saves the updated project
 */

const fs = require('uxp').storage.localFileSystem;

/**
 * Decompress and parse a Premiere Pro project file
 * @param {string} projectPath - Path to the .prproj file
 * @returns {Promise<{xmlDoc: Document, originalXml: string}>} Parsed XML document and original XML string
 */
async function decompressProject(projectPath) {
    try {
        console.log('Reading project file:', projectPath);

        // Get file entry for the project
        const projectFile = await fs.getEntryWithUrl('file://' + projectPath);

        // Read as binary (ArrayBuffer)
        const arrayBuffer = await projectFile.read({ format: 'binary' });

        // Try to decompress as GZip
        let xmlString;
        try {
            // Attempt GZip decompression
            const decompressed = await decompressGZip(arrayBuffer);
            xmlString = new TextDecoder('utf-8').decode(decompressed);
        } catch (gzipError) {
            console.log('Not a GZip file, trying as plain XML');
            // If not GZipped, treat as plain text XML
            xmlString = new TextDecoder('utf-8').decode(arrayBuffer);
        }

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('XML parsing error: ' + parserError.textContent);
        }

        console.log('Project file parsed successfully');
        return { xmlDoc, originalXml: xmlString };

    } catch (error) {
        console.error('Error decompressing project:', error);
        throw new Error(`Failed to read project file: ${error.message}`);
    }
}

/**
 * Decompress GZip data
 * @param {ArrayBuffer} data - Compressed data
 * @returns {Promise<Uint8Array>} Decompressed data
 */
async function decompressGZip(data) {
    // Check if native DecompressionStream is available
    if (typeof DecompressionStream !== 'undefined') {
        try {
            const stream = new DecompressionStream('gzip');
            const blob = new Blob([data]);
            const decompressedStream = blob.stream().pipeThrough(stream);
            const decompressedBlob = await new Response(decompressedStream).blob();
            return new Uint8Array(await decompressedBlob.arrayBuffer());
        } catch (e) {
            console.error('DecompressionStream failed:', e);
            throw e;
        }
    }

    // Fallback: Try using pako library if available
    if (typeof pako !== 'undefined') {
        return pako.inflate(new Uint8Array(data));
    }

    throw new Error('No GZip decompression available');
}

/**
 * Extract all media file paths from project XML
 * @param {Document} xmlDoc - Parsed XML document
 * @returns {Array<{element: Element, attribute: string, path: string, type: string}>} Array of path references
 */
function extractPaths(xmlDoc) {
    const paths = [];

    // Common path attributes in Premiere Pro projects
    const pathAttributes = ['pathurl', 'filepath', 'relativeurl'];

    // Common elements that contain paths
    const pathElements = [
        'pathurl',
        'File',
        'MediaPath',
        'PreviewFile',
        'CaptureFile',
        'AudioPreview'
    ];

    // Search for all elements with path attributes
    pathAttributes.forEach(attr => {
        const elements = xmlDoc.querySelectorAll(`[${attr}]`);
        elements.forEach(element => {
            const pathValue = element.getAttribute(attr);
            if (pathValue && pathValue.trim()) {
                paths.push({
                    element,
                    attribute: attr,
                    path: decodePathUrl(pathValue),
                    type: element.tagName
                });
            }
        });
    });

    // Search for text content in path elements
    pathElements.forEach(tagName => {
        const elements = xmlDoc.getElementsByTagName(tagName);
        for (let element of elements) {
            const pathValue = element.textContent;
            if (pathValue && pathValue.trim() && !hasPathAttribute(element)) {
                paths.push({
                    element,
                    attribute: 'textContent',
                    path: decodePathUrl(pathValue),
                    type: tagName
                });
            }
        }
    });

    console.log(`Extracted ${paths.length} path references from project`);
    return paths;
}

/**
 * Check if element has any path attribute
 * @param {Element} element - XML element
 * @returns {boolean} True if element has path attribute
 */
function hasPathAttribute(element) {
    return element.hasAttribute('pathurl') ||
        element.hasAttribute('filepath') ||
        element.hasAttribute('relativeurl');
}

/**
 * Decode file URL path
 * @param {string} pathUrl - URL-encoded path (e.g., "file://localhost/path%20to/file.mp4")
 * @returns {string} Decoded file system path
 */
function decodePathUrl(pathUrl) {
    try {
        // Remove file:// protocol prefix
        let path = pathUrl.replace(/^file:\/\/localhost\/?/, '');
        path = path.replace(/^file:\/\/\//, '/');
        path = path.replace(/^file:\/\//, '');

        // Decode URL encoding (%20, etc.)
        path = decodeURIComponent(path);

        // Normalize path separators (handle Windows \ and Unix /)
        // Keep original separator style for now

        return path;
    } catch (error) {
        console.error('Error decoding path URL:', pathUrl, error);
        return pathUrl;
    }
}

/**
 * Encode file system path to URL format
 * @param {string} path - File system path
 * @returns {string} URL-encoded path with file:// prefix
 */
function encodePathUrl(path) {
    try {
        // Normalize separators to forward slash
        let normalized = path.replace(/\\/g, '/');

        // Encode special characters but preserve /
        const encoded = normalized.split('/').map(segment => {
            return encodeURIComponent(segment);
        }).join('/');

        // Add file:// prefix
        // For absolute paths, add localhost
        if (encoded.startsWith('/')) {
            return 'file://localhost' + encoded;
        } else if (encoded.match(/^[A-Za-z]:/)) {
            // Windows absolute path
            return 'file://localhost/' + encoded;
        } else {
            // Relative path
            return encoded;
        }
    } catch (error) {
        console.error('Error encoding path URL:', path, error);
        return path;
    }
}

/**
 * Create mapping from old paths to new paths based on collected assets
 * @param {Array<Object>} pathReferences - Array of extracted path references
 * @param {Object} collectionResult - Result from asset collection with file mappings
 * @returns {Map<string, string>} Map of old paths to new paths
 */
function createPathMapping(pathReferences, collectionResult) {
    const mapping = new Map();

    // collectionResult.copiedFiles is an array of { original, destination }
    if (!collectionResult.copiedFiles) {
        console.warn('No copied files in collection result');
        return mapping;
    }

    // Create a lookup map for faster matching
    const copiedFilesMap = new Map();
    collectionResult.copiedFiles.forEach(({ original, destination }) => {
        // Normalize paths for comparison
        const normalizedOriginal = normalizePath(original);
        copiedFilesMap.set(normalizedOriginal, destination);
    });

    // Map each path reference to its new location
    pathReferences.forEach(ref => {
        const normalizedPath = normalizePath(ref.path);
        const newPath = copiedFilesMap.get(normalizedPath);

        if (newPath) {
            mapping.set(ref.path, newPath);
            console.log(`Mapped: ${ref.path} -> ${newPath}`);
        } else {
            console.log(`No mapping found for: ${ref.path}`);
        }
    });

    console.log(`Created ${mapping.size} path mappings`);
    return mapping;
}

/**
 * Normalize path for comparison (handle separators and case)
 * @param {string} path - File system path
 * @returns {string} Normalized path
 */
function normalizePath(path) {
    // Convert all separators to forward slash
    let normalized = path.replace(/\\/g, '/');

    // On Windows, make case-insensitive
    if (process.platform === 'win32') {
        normalized = normalized.toLowerCase();
    }

    // Remove trailing slashes
    normalized = normalized.replace(/\/+$/, '');

    return normalized;
}

/**
 * Rewrite paths in XML document
 * @param {Document} xmlDoc - Parsed XML document
 * @param {Array<Object>} pathReferences - Array of path references to update
 * @param {Map<string, string>} pathMapping - Map of old paths to new paths
 * @returns {number} Number of paths updated
 */
function rewritePaths(xmlDoc, pathReferences, pathMapping) {
    let updatedCount = 0;

    pathReferences.forEach(ref => {
        const oldPath = ref.path;
        const newPath = pathMapping.get(oldPath);

        if (newPath) {
            // Encode new path as URL
            const encodedPath = encodePathUrl(newPath);

            // Update the element
            if (ref.attribute === 'textContent') {
                ref.element.textContent = encodedPath;
            } else {
                ref.element.setAttribute(ref.attribute, encodedPath);
            }

            updatedCount++;
        }
    });

    console.log(`Updated ${updatedCount} path references in project XML`);
    return updatedCount;
}

/**
 * Compress and save updated project file
 * @param {Document} xmlDoc - Updated XML document
 * @param {string} outputPath - Path where to save the updated project
 * @returns {Promise<boolean>} Success status
 */
async function compressProject(xmlDoc, outputPath) {
    try {
        console.log('Compressing and saving project to:', outputPath);

        // Serialize XML to string
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(xmlDoc);

        // Compress as GZip
        let compressedData;
        try {
            compressedData = await compressGZip(xmlString);
        } catch (gzipError) {
            console.warn('GZip compression failed, saving as plain XML:', gzipError);
            // Fallback to plain XML if compression fails
            compressedData = new TextEncoder().encode(xmlString);
        }

        // Get parent folder
        const parentPath = outputPath.substring(0, outputPath.lastIndexOf('/'));
        const fileName = outputPath.substring(outputPath.lastIndexOf('/') + 1);

        const parentFolder = await fs.getEntryWithUrl('file://' + parentPath);

        // Create file
        const outputFile = await parentFolder.createFile(fileName, { overwrite: true });

        // Write binary data
        await outputFile.write(compressedData, { format: 'binary' });

        console.log('Project file saved successfully');
        return true;

    } catch (error) {
        console.error('Error compressing/saving project:', error);
        throw new Error(`Failed to save project file: ${error.message}`);
    }
}

/**
 * Compress data as GZip
 * @param {string} text - Text to compress
 * @returns {Promise<Uint8Array>} Compressed data
 */
async function compressGZip(text) {
    // Check if native CompressionStream is available
    if (typeof CompressionStream !== 'undefined') {
        try {
            const stream = new CompressionStream('gzip');
            const blob = new Blob([text]);
            const compressedStream = blob.stream().pipeThrough(stream);
            const compressedBlob = await new Response(compressedStream).blob();
            return new Uint8Array(await compressedBlob.arrayBuffer());
        } catch (e) {
            console.error('CompressionStream failed:', e);
            throw e;
        }
    }

    // Fallback: Try using pako library if available
    if (typeof pako !== 'undefined') {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(text);
        return pako.gzip(data);
    }

    throw new Error('No GZip compression available');
}

/**
 * Validate project XML structure
 * @param {Document} xmlDoc - XML document to validate
 * @returns {{valid: boolean, errors: Array<string>}} Validation result
 */
function validateProject(xmlDoc) {
    const errors = [];

    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        errors.push('XML parsing error: ' + parserError.textContent);
    }

    // Check for root element
    const root = xmlDoc.documentElement;
    if (!root) {
        errors.push('No root element found');
        return { valid: false, errors };
    }

    // Check for expected Premiere Pro structure
    const expectedRoots = ['PremiereData', 'xmeml', 'Project'];
    if (!expectedRoots.includes(root.tagName)) {
        errors.push(`Unexpected root element: ${root.tagName}`);
    }

    // Validate that paths are properly formatted
    const pathElements = xmlDoc.querySelectorAll('[pathurl], [filepath]');
    pathElements.forEach((element, index) => {
        const pathurl = element.getAttribute('pathurl') || element.getAttribute('filepath');
        if (pathurl && pathurl.includes('<') || pathurl.includes('>')) {
            errors.push(`Invalid path format at element ${index}: contains XML characters`);
        }
    });

    const valid = errors.length === 0;

    if (valid) {
        console.log('Project XML validation passed');
    } else {
        console.error('Project XML validation failed:', errors);
    }

    return { valid, errors };
}

/**
 * Main function: Relink project file with new asset paths
 * @param {string} projectPath - Path to original .prproj file
 * @param {string} outputPath - Path where to save updated .prproj file
 * @param {Object} collectionResult - Result from asset collection
 * @returns {Promise<{success: boolean, updatedPaths: number, errors: Array}>} Relinking result
 */
async function relinkProject(projectPath, outputPath, collectionResult) {
    const errors = [];

    try {
        console.log('Starting project relinking...');
        console.log('Original project:', projectPath);
        console.log('Output project:', outputPath);

        // Step 1: Decompress and parse project
        const { xmlDoc, originalXml } = await decompressProject(projectPath);

        // Step 2: Extract paths
        const pathReferences = extractPaths(xmlDoc);

        if (pathReferences.length === 0) {
            console.warn('No media paths found in project');
            return {
                success: true,
                updatedPaths: 0,
                errors: ['No media paths found in project']
            };
        }

        // Step 3: Create path mapping
        const pathMapping = createPathMapping(pathReferences, collectionResult);

        if (pathMapping.size === 0) {
            console.warn('No path mappings created');
            return {
                success: true,
                updatedPaths: 0,
                errors: ['No matching paths found to update']
            };
        }

        // Step 4: Rewrite paths
        const updatedCount = rewritePaths(xmlDoc, pathReferences, pathMapping);

        // Step 5: Validate updated XML
        const validation = validateProject(xmlDoc);
        if (!validation.valid) {
            throw new Error('Project validation failed: ' + validation.errors.join(', '));
        }

        // Step 6: Compress and save
        await compressProject(xmlDoc, outputPath);

        console.log('Project relinking completed successfully');
        return {
            success: true,
            updatedPaths: updatedCount,
            errors: []
        };

    } catch (error) {
        console.error('Project relinking failed:', error);
        return {
            success: false,
            updatedPaths: 0,
            errors: [error.message]
        };
    }
}

// Export functions
module.exports = {
    relinkProject,
    decompressProject,
    extractPaths,
    createPathMapping,
    rewritePaths,
    compressProject,
    validateProject
};
