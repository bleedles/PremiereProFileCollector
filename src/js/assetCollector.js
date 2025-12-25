/**
 * Asset Collector Module
 * Handles enumeration and collection of project assets
 */

const ppro = require('premierepro');
const { getProject } = require('./projectAPI.js');

/**
 * Get all assets from the current project
 * @param {Object} options - Collection options
 * @param {boolean} options.includeUnused - Include assets not used in sequences
 * @param {boolean} options.maintainStructure - Maintain folder structure
 * @param {boolean} options.consolidate - Consolidate duplicate files
 * @returns {Promise<Array>} Array of asset objects
 */
async function getProjectAssets(options = {}) {
    console.log('getProjectAssets called with options:', options);
    
    const assets = [];
    const assetMap = new Map(); // Track assets by path to detect duplicates
    
    try {
        const project = await getProject();
        const rootItem = await project.getRootItem();
        
        // Recursively collect assets from project structure
        await traverseProjectItem(rootItem, assets, assetMap, options, '');
        
        console.log(`Found ${assets.length} total assets`);
        
    } catch (error) {
        console.error('Error getting project assets:', error);
        throw error;
    }
    
    return assets;
}

/**
 * Recursively traverse project items
 * @param {ProjectItem} item - Current project item
 * @param {Array} assets - Array to store assets
 * @param {Map} assetMap - Map to track assets by path
 * @param {Object} options - Collection options
 * @param {string} currentPath - Current path in project hierarchy
 */
async function traverseProjectItem(item, assets, assetMap, options, currentPath) {
    try {
        if (!item) return;
        
        const itemName = item.name || 'Unnamed';
        const itemPath = currentPath ? `${currentPath}/${itemName}` : itemName;
        
        // Try to cast to FolderItem (bin/folder)
        const folderItem = ppro.FolderItem.cast(item);
        if (folderItem) {
            console.log(`Traversing folder: ${itemPath}`);
            
            // Get all items in this folder
            const childItems = await folderItem.getItems();
            
            // Recursively process each child
            for (const childItem of childItems) {
                await traverseProjectItem(childItem, assets, assetMap, options, itemPath);
            }
            return;
        }
        
        // Try to cast to ClipProjectItem (media clip)
        const clipItem = ppro.ClipProjectItem.cast(item);
        if (clipItem) {
            await processClipItem(clipItem, assets, assetMap, options, itemPath);
            return;
        }
        
        console.log(`Unknown item type: ${itemName}`);
        
    } catch (error) {
        console.error('Error traversing project item:', error);
        // Continue processing other items even if one fails
    }
}

/**
 * Process a clip item and extract its media path
 * @param {ClipProjectItem} clipItem - Clip project item
 * @param {Array} assets - Array to store assets
 * @param {Map} assetMap - Map to track assets by path
 * @param {Object} options - Collection options
 * @param {string} projectPath - Path in project hierarchy
 */
async function processClipItem(clipItem, assets, assetMap, options, projectPath) {
    try {
        const clipName = clipItem.name || 'Unnamed Clip';
        
        // Check if this is a sequence (sequences are also ClipProjectItems)
        const isSequence = await clipItem.isSequence();
        if (isSequence) {
            console.log(`Found sequence: ${clipName}`);
            // TODO: Optionally process sequence contents in future
            return;
        }
        
        // Get the media file path
        const mediaPath = await clipItem.getMediaFilePath();
        
        if (!mediaPath) {
            console.log(`No media path for: ${clipName} (may be generated content)`);
            return;
        }
        
        // Check if file is offline
        const isOffline = await clipItem.isOffline();
        
        // Check if we've already seen this asset
        if (assetMap.has(mediaPath)) {
            console.log(`Duplicate asset: ${mediaPath}`);
            if (options.consolidate) {
                // Skip duplicate if consolidating
                return;
            }
        }
        
        // Create asset object
        const asset = {
            name: clipName,
            path: mediaPath,
            projectPath: projectPath,
            isOffline: isOffline,
            type: getAssetType(mediaPath),
            clipItem: clipItem // Keep reference for future use
        };
        
        // Add to collection
        assets.push(asset);
        assetMap.set(mediaPath, asset);
        
        console.log(`Added asset: ${clipName} -> ${mediaPath} (offline: ${isOffline})`);
        
    } catch (error) {
        console.error('Error processing clip item:', error);
    }
}

/**
 * Get asset type from file path
 * @param {string} path - File path
 * @returns {string} Asset type (video, audio, image, other)
 */
function getAssetType(path) {
    const ext = getFileExtension(path).toLowerCase();
    
    if (isVideoExtension(ext)) {
        return 'video';
    } else if (isAudioExtension(ext)) {
        return 'audio';
    } else if (isImageExtension(ext)) {
        return 'image';
    } else {
        return 'other';
    }
}

/**
 * Collect assets with deduplication
 * @param {Array} assets - Array of asset objects
 * @returns {Array} Deduplicated assets
 */
function deduplicateAssets(assets) {
    // TODO: Implement in Phase 3
    // Remove duplicate file paths
    
    const uniquePaths = new Set();
    const uniqueAssets = [];
    
    for (const asset of assets) {
        if (!uniquePaths.has(asset.path)) {
            uniquePaths.add(asset.path);
            uniqueAssets.push(asset);
        }
    }
    
    return uniqueAssets;
}

/**
 * Categorize assets by type
 * @param {Array} assets - Array of asset objects
 * @returns {Object} Assets categorized by type
 */
function categorizeAssets(assets) {
    // TODO: Implement in Phase 3
    
    const categories = {
        video: [],
        audio: [],
        image: [],
        other: []
    };
    
    for (const asset of assets) {
        const ext = getFileExtension(asset.path).toLowerCase();
        
        if (isVideoExtension(ext)) {
            categories.video.push(asset);
        } else if (isAudioExtension(ext)) {
            categories.audio.push(asset);
        } else if (isImageExtension(ext)) {
            categories.image.push(asset);
        } else {
            categories.other.push(asset);
        }
    }
    
    return categories;
}

/**
 * Get file extension from path
 */
function getFileExtension(path) {
    return path.split('.').pop() || '';
}

/**
 * Check if extension is video
 */
function isVideoExtension(ext) {
    const videoExts = ['mp4', 'mov', 'avi', 'mxf', 'r3d', 'braw', 'dng', 'mkv', 'mpg', 'mpeg'];
    return videoExts.includes(ext);
}

/**
 * Check if extension is audio
 */
function isAudioExtension(ext) {
    const audioExts = ['wav', 'mp3', 'aac', 'aif', 'aiff', 'flac', 'm4a'];
    return audioExts.includes(ext);
}

/**
 * Check if extension is image
 */
function isImageExtension(ext) {
    const imageExts = ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'psd', 'psb', 'bmp', 'gif'];
    return imageExts.includes(ext);
}

module.exports = {
    getProjectAssets,
    deduplicateAssets,
    categorizeAssets
};
