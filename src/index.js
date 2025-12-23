/**
 * Adobe Premiere Pro Asset Collector Extension
 * Main entry point and UI controller
 */

const fs = require('uxp').storage.localFileSystem;
const { app } = require('premierepro');

// Import modules
// These will be implemented in subsequent phases
// const { collectAssets, getProjectAssets } = require('./js/assetCollector.js');
// const { copyFiles, createFolderStructure } = require('./js/fileOperations.js');
// const { getProject, saveProject } = require('./js/projectAPI.js');

// State management
let state = {
    destinationFolder: null,
    collectionInProgress: false,
    options: {
        includeUnused: true,
        maintainStructure: true,
        consolidate: true
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
        if (app && app.project) {
            showStatus('Extension loaded. Select a destination folder to begin.', 'info');
        } else {
            showStatus('No project is currently open.', 'warning');
        }
    } catch (error) {
        console.error('Error initializing:', error);
        showStatus('Error initializing extension: ' + error.message, 'error');
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
            document.getElementById('collectButton').disabled = false;
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
    
    if (!app || !app.project) {
        showStatus('No project is currently open.', 'error');
        return;
    }
    
    try {
        state.collectionInProgress = true;
        document.getElementById('collectButton').disabled = true;
        
        // Show progress section
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        
        showStatus('Starting asset collection...', 'info');
        updateProgress(0, 'Analyzing project...');
        
        // TODO: Implement asset collection logic
        // This is a placeholder for Phase 2-4 implementation
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
 * Perform asset collection (placeholder for Phase 2-4 implementation)
 */
async function performAssetCollection() {
    // Phase 2: Get project assets
    updateProgress(10, 'Enumerating project items...');
    
    // Simulate work for now
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateProgress(30, 'Analyzing asset paths...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 3: Collect and deduplicate assets
    updateProgress(50, 'Preparing file list...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 4: Copy files
    updateProgress(70, 'Copying files...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateProgress(90, 'Finalizing...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProgress(100, 'Collection complete!');
    
    // Show results
    showResults({
        filesCollected: 0,
        totalSize: 0,
        missingFiles: 0,
        errors: 0,
        errorMessages: []
    });
    
    showStatus('Asset collection completed successfully!', 'success');
}

/**
 * Update progress bar and text
 */
function updateProgress(percent, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = percent + '%';
    progressText.textContent = text || `${percent}% complete`;
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
