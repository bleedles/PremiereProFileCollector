/**
 * File Operations Module
 * Handles file system operations for copying assets
 */

const fs = require('uxp').storage.localFileSystem;
const { Entry } = require('uxp').storage;

/**
 * Copy files to destination
 * @param {Array} assets - Array of asset objects with source paths
 * @param {Folder} destinationFolder - UXP folder object
 * @param {Object} options - Copy options
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} Results object
 */
async function copyFiles(assets, destinationFolder, options, progressCallback) {
    console.log('copyFiles: Starting with', assets.length, 'assets');
    
    const results = {
        success: [],
        failed: [],
        skipped: [],
        totalBytes: 0,
        errors: []
    };
    
    try {
        // Filter out offline assets
        const onlineAssets = assets.filter(asset => !asset.isOffline);
        
        if (onlineAssets.length === 0) {
            console.log('No online assets to copy');
            return results;
        }
        
        // Create folder structure
        const folderMap = await createFolderStructure(destinationFolder, onlineAssets, options);
        
        // Copy each file
        for (let i = 0; i < onlineAssets.length; i++) {
            const asset = onlineAssets[i];
            
            if (progressCallback) {
                const progress = Math.round((i / onlineAssets.length) * 100);
                progressCallback(progress, `Copying ${asset.name}... (${i + 1}/${onlineAssets.length})`);
            }
            
            try {
                // Determine destination folder based on options
                let targetFolder = destinationFolder;
                
                if (options.maintainStructure && asset.projectPath) {
                    // Use the mapped folder from structure creation
                    targetFolder = folderMap[asset.projectPath] || destinationFolder;
                } else if (options.organizeByType) {
                    // Use type-based folder
                    targetFolder = folderMap[asset.type] || destinationFolder;
                }
                
                // Copy the file
                const copyResult = await copyFile(asset.path, targetFolder, options);
                
                if (copyResult.success) {
                    results.success.push({
                        name: asset.name,
                        originalPath: asset.path,
                        newPath: copyResult.newPath,
                        size: copyResult.size
                    });
                    results.totalBytes += copyResult.size;
                } else if (copyResult.skipped) {
                    results.skipped.push({
                        name: asset.name,
                        path: asset.path,
                        reason: copyResult.reason
                    });
                } else {
                    results.failed.push({
                        name: asset.name,
                        path: asset.path,
                        error: copyResult.error
                    });
                    results.errors.push(`Failed to copy ${asset.name}: ${copyResult.error}`);
                }
                
            } catch (error) {
                console.error('Error copying asset:', asset.name, error);
                results.failed.push({
                    name: asset.name,
                    path: asset.path,
                    error: error.message
                });
                results.errors.push(`${asset.name}: ${error.message}`);
            }
        }
        
        console.log('Copy complete:', {
            success: results.success.length,
            failed: results.failed.length,
            skipped: results.skipped.length,
            totalBytes: results.totalBytes
        });
        
    } catch (error) {
        console.error('Error in copyFiles:', error);
        throw error;
    }
    
    return results;
}

/**
 * Copy a single file
 * @param {string} sourcePath - Source file path
 * @param {Folder} targetFolder - Destination folder
 * @param {Object} options - Copy options
 * @returns {Promise<Object>} Copy result
 */
async function copyFile(sourcePath, targetFolder, options) {
    try {
        // Get source file using native path
        const sourceFile = await fs.getEntryWithUrl(`file://${sourcePath}`);
        
        if (!sourceFile || !sourceFile.isFile) {
            return {
                success: false,
                skipped: false,
                error: 'Source file not found or not accessible'
            };
        }
        
        // Get file size
        const size = await getFileSize(sourceFile);
        
        // Generate target filename (handle conflicts)
        let targetName = sourceFile.name;
        if (await fileExistsInFolder(targetFolder, targetName)) {
            if (options.skipExisting) {
                return {
                    success: false,
                    skipped: true,
                    reason: 'File already exists'
                };
            } else {
                // Generate unique filename
                targetName = await generateUniqueFilename(targetFolder, targetName);
            }
        }
        
        // Copy the file
        await sourceFile.copyTo(targetFolder, { overwrite: false });
        
        const newPath = `${targetFolder.nativePath}/${targetName}`;
        
        return {
            success: true,
            newPath: newPath,
            size: size
        };
        
    } catch (error) {
        console.error('Error in copyFile:', error);
        return {
            success: false,
            skipped: false,
            error: error.message
        };
    }
}

/**
 * Create folder structure at destination
 * @param {Folder} destinationFolder - UXP folder object
 * @param {Array} assets - Array of asset objects
 * @param {Object} options - Structure options
 * @returns {Promise<Object>} Folder mapping
 */
async function createFolderStructure(destinationFolder, assets, options) {
    console.log('createFolderStructure called');
    
    const folderMap = {};
    
    try {
        if (options.maintainStructure) {
            // Recreate original folder hierarchy
            console.log('Maintaining original folder structure');
            
            // Collect all unique project paths
            const uniquePaths = new Set();
            for (const asset of assets) {
                if (asset.projectPath) {
                    // Get all parent paths
                    const parts = asset.projectPath.split('/');
                    for (let i = 1; i < parts.length; i++) {
                        const path = parts.slice(0, i).join('/');
                        if (path) uniquePaths.add(path);
                    }
                    uniquePaths.add(asset.projectPath);
           File} file - UXP file entry
 * @returns {Promise<number>} File size in bytes
 */
async function getFileSize(file) {
    try {
        if (!file || !file.isFile) {
            return 0;
        }
        // UXP file entries have a size property
        return file.size || 0;
    } catch (error) {
        console.error('Error getting file size:', error);
        return 0;
    }
}

/**
 * Check if file exists at path
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
    try {
        const entry = await fs.getEntryWithUrl(`file://${filePath}`);
        return entry && entry.isFile;
    } catch (error) {
        return false;
    }
}

/**
 * Check if file exists in folder
 * @param {Folder} folder - Folder to check
 * @param {string} filename - Filename to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExistsInFolder(folder, filename) {
    try {
        const entries = await folder.getEntries();
        for (const entry of entries) {
            if (entry.isFile && entry.name === filename) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
    }
}

/**
 * Generate unique filename to avoid conflicts
 * @param {Folder} folder - Destination folder
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Unique filename
 */
async function generateUniqueFilename(folder, filename) {
    let uniqueName = filename;
    let counter = 1;
    
    // Split filename into name and extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
    
    // Keep checking until we find a unique name
    while (await fileExistsInFolder(folder, uniqueName)) {
        uniqueName = `${name}_${counter}${ext}`;
        counter++;
        
        // Safety limit to prevent infinite loops
        if (counter > 9999) {
            uniqueName = `${name}_${Date.now()}${ext}`;
            break;
        }
    }
    
    return uniqueName;
}

/**
 * Calculate total size of assets
 * @param {Array} assets - Array of asset objects with paths
 * @returns {Promise<number>} Total size in bytes
 */
async function calculateTotalSize(assets) {
    let totalSize = 0;
    
    for (const asset of assets) {
        if (asset.isOffline) continue;
        
        try {
            const file = await fs.getEntryWithUrl(`file://${asset.path}`);
            if (file && file.isFile) {
                totalSize += await getFileSize(file);
            }
        } catch (error) {
            console.error('Error getting size for:', asset.path, error);
        }
    }
    
    return totalSize a folder
 * @param {Folder} parentFolder - Parent folder
 * @param {string} name - Folder name
 * @returns {Promise<Folder>} Folder
 */
async function getOrCreateFolder(parentFolder, name) {
    try {
        // Try to get existing folder
        const entries = await parentFolder.getEntries();
        for (const entry of entries) {
            if (entry.isFolder && entry.name === name) {
                return entry;
            }
        }
        
        // Create new folder if it doesn't exist
        return await parentFolder.createFolder(name);
        
    } catch (error) {
        console.error('Error getting/creating folder:', name, error);
        throw error;
    }
}

/**fileExistsInFolder,
    generateUniqueFilename,
    calculateTotalSiz
 * Get file size
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} File size in bytes
 */
async function getFileSize(filePath) {
    // TODO: Implement using UXP file system APIs
    return 0;
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
    // TODO: Implement using UXP file system APIs
    return false;
}

/**
 * Generate unique filename to avoid conflicts
 * @param {Folder} folder - Destination folder
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Unique filename
 */
async function generateUniqueFilename(folder, filename) {
    // TODO: Implement in Phase 4
    
    let uniqueName = filename;
    let counter = 1;
    
    // Check if file exists and append counter if needed
    while (await fileExistsInFolder(folder, uniqueName)) {
        const ext = filename.split('.').pop();
        const name = filename.substring(0, filename.lastIndexOf('.'));
        uniqueName = `${name}_${counter}.${ext}`;
        counter++;
    }
    
    return uniqueName;
}

/**
 * Check if file exists in folder
 */
async function fileExistsInFolder(folder, filename) {
    // TODO: Implement using UXP folder APIs
    return false;
}

module.exports = {
    copyFiles,
    createFolderStructure,
    getFileSize,
    fileExists,
    generateUniqueFilename
};
