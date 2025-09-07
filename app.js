// Import all your page/tool renderers at the top
import { renderFilesPage } from './pages/files.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderCodeEditorPage } from './tools/codeeditor.js';
// We need to access the IndexedDB manager from here to save files
import { IndexedDBManager } from './pages/files.js'; 

// Main container for the app
const appContainer = document.getElementById('app');

/**
 * Main navigation function to switch between pages.
 * @param {string} page The key of the page to navigate to.
 * @param {object} [data] Optional data to pass to the page (like a file object).
 */
async function navigate(page, data) {
    // --- DEBUGGING: See if the navigate function is being called correctly ---
    console.log(`Navigating to page: '${page}'`, data ? `with data: ${data.name}`: '');

    // Clear the container before rendering a new page
    appContainer.innerHTML = ''; 

    switch (page) {
        case 'dashboard':
            // The navigate function is passed so the dashboard can trigger navigation
            renderDashboardPage(appContainer, navigate);
            break;

        case 'files':
            renderFilesPage(appContainer, navigate);
            break;
        
        // --- THIS IS THE CRUCIAL NEW PART ---
        case 'editor':
            if (!data) {
                console.error("Navigation error: Tried to open editor with no file data.");
                navigate('files'); // Go back to files if no file is provided
                return;
            }
            // Pass the container, the file data, the navigate function, and a save function
            renderCodeEditorPage(appContainer, data, navigate, saveFileCallback);
            break;

        default:
            // Default to the dashboard if the page is unknown
            console.warn(`Unknown page '${page}', navigating to dashboard.`);
            renderDashboardPage(appContainer, navigate);
            break;
    }
}

/**
 * A callback function that the code editor can use to save a file.
 * This keeps the saving logic centralized in app.js.
 * @param {object} fileToSave The updated file object from the editor.
 */
async function saveFileCallback(fileToSave) {
    // --- DEBUGGING: Confirm the save callback is triggered ---
    console.log("app.js received file to save:", fileToSave.name);
    await IndexedDBManager.init(); // Ensure DB is ready
    await IndexedDBManager.saveFile(fileToSave);
    // In a real app, you might show a small "Saved!" notification here.
}


// --- App Initialization ---
// This function runs when the script is first loaded.
function initialize() {
    console.log("App initializing...");
    // Start the application by navigating to the default page.
    navigate('files'); 
}

// Start the app!
initialize();

