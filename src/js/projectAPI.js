/**
 * Project API Module
 * Wrapper for Premiere Pro project interactions
 */

// UXP API for Premiere Pro
const ppro = require('premierepro');

/**
 * Get current project
 * @returns {Promise<Project>} Current Premiere Pro project
 */
async function getProject() {
    try {
        const project = await ppro.Project.getActiveProject();
        if (!project) {
            throw new Error('No active project');
        }
        return project;
    } catch (error) {
        console.error('Error getting project:', error);
        throw new Error('No active project');
    }
}

/**
 * Get project name
 * @returns {Promise<string>} Project name
 */
async function getProjectName() {
    const project = await getProject();
    return project.name || 'Untitled';
}

/**
 * Get project path
 * @returns {Promise<string>} Project file path
 */
async function getProjectPath() {
    const project = await getProject();
    return project.path || '';
}

/**
 * Get project document ID
 * @returns {Promise<string>} Project document ID
 */
async function getProjectDocumentID() {
    const project = await getProject();
    return project.documentID || '';
}

/**
 * Save project
 * @returns {Promise<boolean>} Success status
 */
async function saveProject() {
    try {
        const project = await getProject();
        await project.save();
        console.log('Project saved successfully');
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
    try {
        const project = await getProject();
        await project.saveAs(newPath);
        console.log('Project saved as:', newPath);
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
    // This functionality has been moved to projectRelinking.js module
    // Use relinkProject() function instead for full project relinking
    console.log('updateAssetPaths - use projectRelinking.relinkProject() instead');
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
Promise < boolean >} True if project has unsaved changes
    */
async function hasUnsavedChanges() {
    try {
        const project = await getProject();
        // Note: UXP API may not expose isDirty flag
        // This is a limitation we'll need to work around
        return false;
    } catch (error) {
        console.error('Error checking unsaved changes:', error);
        return false;
    }
}

/**
 * Close project
 * @returns {Promise<boolean>} Success status
 */
async function closeProject() {
    try {
        const project = await getProject();
        await project.close();
        console.log('Project closed');
        return true;
    } catch (error) {
        console.error('Error closing project:', error);
        throw error;
    }
}

module.exports = {
    getProject,
    getProjectName,
    getProjectPath,
    getProjectDocumentID,
    saveProject,
    saveProjectAs,
    updateAssetPaths,
    hasUnsavedChanges,
    closeProject