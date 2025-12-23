/**
 * Asset Collector Module
 * Handles enumeration and collection of project assets
 */

const { app } = require('premierepro');

/**
 * Get all assets from the current project
 * @param {Object} options - Collection options
 * @returns {Promise<Array>} Array of asset objects
 */
async function getProjectAssets(options = {}) {
    // TODO: Implement in Phase 2
    // This will recursively traverse the project structure
    // and collect all media file paths
    
    console.log('getProjectAssets called with options:', options);
    
    const assets = [];
    
    try {
        if (!app || !app.project) {
            throw new Error('No active project');
        }
        
        const rootItem = app.project.rootItem;
        
        // Recursively collect assets
        await traverseProjectItem(rootItem, assets, options);
        
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
 * @param {Object} options - Collection options
 */
async function traverseProjectItem(item, assets, options) {
    // TODO: Implement in Phase 2
    // This will be implemented once we research the Premiere Pro API
    
    console.log('traverseProjectItem placeholder');
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
