/**
 * Adobe Premiere Pro Asset Collector Extension
 * Main entry point and UI controller
 */

const fs = require('uxp').storage.localFileSystem;

// Import modules
const { getProjectAssets, deduplicateAssets, categorizeAssets } = require('./js/assetCollector.js');
const { copyFiles, createFolderStructure, calculateTotalSize } = require('./js/fileOperations.js');
const { getProject, getProjectName, getProjectPath } = require('./js/projectAPI.js');

// State management
let state = {
    destinationFolder: null,
    collectionInProgress: false,
    options: {
        includeUnused: true,
        maintainStructure: true,
        consolidate: true,
        organizeByType: false,
        skipExisting: false
    }
};

/**
 * Initialize the extension
 */
async function initialize() {
    console.log('Asset Collector: Initializing...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if a project is open
    try {
        const project = await getProject();
        if (project) {
            const projectName = await getProjectName();
            showStatus(`Extension loaded. Project: ${projectName}`, 'info');
        }
    } catch (error) {
        console.error('Error initializing:', error);
        showStatus('No project is currently open.', 'warning');
    }
}

/**
 * Set up UI event listeners
 */
function setupEventListeners() {
    // Browse button
    const browseButton = document.getElementById('browseButton');
    browseButton.addEventListener('click', handleBrowseClick);
    
    // Collect button
    const collectButton = document.getElementById('collectButton');
    collectButton.addEventListener('click', handleCollectClick);
    
    // Options checkboxes
    document.getElementById('includeUnused').addEventListener('change', (e) => {
        state.options.includeUnused = e.target.checked;
    });
    
    document.getElementById('maintainStructure').addEventListener('change', (e) => {
        state.options.maintainStructure = e.target.checked;
    });
    
    document.getElementById('consolidate').addEventListener('change', (e) => {
        state.options.consolidate = e.target.checked;
    });
}

/**
 * Handle browse button click
 */
async function handleBrowseClick() {
    try {
        const folder = await fs.getFolder();
        if (folder) {
            state.destinationFolder = folder;
            document.getElementById('destinationPath').value = folder.nativePath;
            
            // Update button state
            const collectButton = document.getElementById('collectButton');
            collectButton.disabled = false;
            const hint = collectButton.querySelector('.button-hint');
            if (hint) {
                hint.textContent = 'Ready to collect';
            }
            
            showStatus('Destination folder selected.', 'success');
        }
    } catch (error) {
        console.error('Error selecting folder:', error);
        showStatus('Error selecting folder: ' + error.message, 'error');
    }
}

/**
 * Handle collect button click
 */
async function handleCollectClick() {
    if (!state.destinationFolder) {
        showStatus('Please select a destination folder first.', 'warning');
        return;
    }
    
    try {
        // Check if project is open
        const project = await getProject();
        if (!project) {
            showStatus('No project is currently open.', 'error');
            return;
        }
        
        state.collectionInProgress = true;
        document.getElementById('collectButton').disabled = true;
        
        // Show progress section
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        
        showStatus('Starting asset collection...', 'info');
        
        // Perform asset collection
        await performAssetCollection();
        
    } catch (error) {
        console.error('Error collecting assets:', error);
        showStatus('Error collecting assets: ' + error.message, 'error');
        updateProgress(0, 'Collection failed.');
    } finally {
        state.collectionInProgress = false;
        document.getElementById('collectButton').disabled = false;
    }
}

/**
 * Perform asset collection
 */
async function performAssetCollection() {
    try {
        // Phase 2: Get project assets
        updateProgress(10, 'Enumerating project items...');
        const allAssets = await getProjectAssets(state.options);
        
        if (allAssets.length === 0) {
            showStatus('No assets found in project.', 'warning');
            updateProgress(100, 'No assets to collect.');
            showResults({
                filesCollected: 0,
                totalSize: 0,
                missingFiles: 0,
                errors: 0,
                errorMessages: []
            });
            return;
        }
        
        console.log(`Fo20, `Found ${allAssets.length} assets. Analyzing...`);
        
        // Separate online and offline files
        const onlineAssets = allAssets.filter(asset => !asset.isOffline);
        const offlineAssets = allAssets.filter(asset => asset.isOffline);
        
        console.log(`Online: ${onlineAssets.length}, Offline: ${offlineAssets.length}`);
        
        if (onlineAssets.length === 0) {
            showStatus('No online assets to copy. All files are offline.', 'warning');
            updateProgress(100, 'No files to copy.');
            showResults({
                filesCollected: 0,
                totalSize: 0,
                missingFiles: offlineAssets.length,
                errors: 0,
                errorMessages: ['All assets are offline']
            });
            return;
        }
        
        // Phase 3: Categorize assets
        updateProgress(30, 'Categorizing assets...');
        const categories = categorizeAssets(onlineAssets);
        console.log('Categories:', {
            video: categories.video.length,
            audio: categories.audio.length,
            image: categories.image.length,
            other: categories.other.length
        });
        
        // Calculate total size
        updateProgress(40, 'Calculating file sizes...');
        const totalSize = await calculateTotalSize(onlineAssets);
        console.log(`Total size: ${formatBytes(totalSize)}`);
        
        // Phase 4: Copy files
        updateProgress(50, 'Starting file copy...');
        
        const copyResults = await copyFiles(
            onlineAssets,
            state.destinationFolder,
            state.options,
            (progress, message) => {
                // Map 0-100 of copy progress to 50-95 of overall progress
                const overallProgress = 50 + Math.round(progress * 0.45);
                updateProgress(overallProgress, message);
            }
        );
        
        updateProgress(100, 'Collection complete!');
        
        // Compile final results
        const results = {
            filesCollected: copyResults.success.length,
            totalSize: copyResults.totalBytes,
            missingFiles: offlineAssets.length,
            errors: copyResults.failed.length,
            errorMessages: copyResults.errors
        };
        
        // Show results
        showResults(results);
        
        if (results.errors > 0) {
            showStatus(`Collection completed with ${results.errors} error(s).`, 'warning');
        } else {
            showStatus('Asset collection completed successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Error in performAssetCollection:', error);
        throw error;
    }
}

// Remove simulateCopyFiles function - no longer needed       errorMessages: []
    };
}

/**
 * Update progress bar and text
 */
function updateProgress(percent, text, subtext = '') {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressSubtext = document.getElementById('progressSubtext');
    
    progressFill.style.width = percent + '%';
    progressText.textContent = text || `${percent}% complete`;
    if (subtext) {
        progressSubtext.textContent = subtext;
    }
}

/**
 * Show results
 */
function showResults(results) {
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('filesCollected').textContent = results.filesCollected;
    document.getElementById('totalSize').textContent = formatBytes(results.totalSize);
    document.getElementById('missingFiles').textContent = results.missingFiles;
    document.getElementById('errorCount').textContent = results.errors;
    
    // Show error list if there are errors
    const errorList = document.getElementById('errorList');
    if (results.errors > 0 && results.errorMessages.length > 0) {
        errorList.innerHTML = '<h4>Errors:</h4>' + 
            results.errorMessages.map(err => `<div class="error-item">${err}</div>`).join('');
        errorList.style.display = 'block';
    } else {
        errorList.style.display = 'none';
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message status-' + type;
    statusMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
