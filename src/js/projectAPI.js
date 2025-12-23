/**
 * Project API Module
 * Wrapper for Premiere Pro project interactions
 */

const { app } = require('premierepro');

/**
 * Get current project
 * @returns {Project} Current Premiere Pro project
 */
function getProject() {
    if (!app || !app.project) {
        throw new Error('No active project');
    }
    return app.project;
}

/**
 * Get project name
 * @returns {string} Project name
 */
function getProjectName() {
    const project = getProject();
    return project.name || 'Untitled';
}

/**
 * Get project path
 * @returns {string} Project file path
 */
function getProjectPath() {
    const project = getProject();
    return project.path || '';
}

/**
 * Save project
 * @returns {Promise<boolean>} Success status
 */
async function saveProject() {
    // TODO: Implement in Phase 5
    
    try {
        const project = getProject();
        // Use Premiere Pro API to save project
        // await project.save();
        console.log('saveProject placeholder');
        return true;
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
}

/**
 * Save project as new file
 * @param {string} newPath - New project file path
 * @returns {Promise<boolean>} Success status
 */
async function saveProjectAs(newPath) {
    // TODO: Implement in Phase 5
    
    try {
        const project = getProject();
        // Use Premiere Pro API to save project as
        // await project.saveAs(newPath);
        console.log('saveProjectAs placeholder:', newPath);
        return true;
    } catch (error) {
        console.error('Error saving project as:', error);
        throw error;
    }
}

/**
 * Update asset paths in project
 * @param {Object} pathMapping - Map of old paths to new paths
 * @returns {Promise<boolean>} Success status
 */
async function updateAssetPaths(pathMapping) {
    // TODO: Implement in Phase 5
    // This is complex and may require working with project file format
    
    console.log('updateAssetPaths placeholder');
    return true;
}

/**
 * Check if project has unsaved changes
 * @returns {boolean} True if project has unsaved changes
 */
function hasUnsavedChanges() {
    // TODO: Implement using Premiere Pro API
    return false;
}

module.exports = {
    getProject,
    getProjectName,
    getProjectPath,
    saveProject,
    saveProjectAs,
    updateAssetPaths,
    hasUnsavedChanges
};
