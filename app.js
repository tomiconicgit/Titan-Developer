// --- CORRECTED IMPORTS ---
import { renderFilesPage } from './pages/files.js';
// Corrected the function name from renderDashboardPage to renderDashboard
import { renderDashboard } from './pages/dashboard.js'; 
import { renderCodeEditorPage } from './tools/codeeditor.js';
// Added the missing import for the bottom bar
import { renderBottomBar } from './components/bottombar.js';
import { IndexedDBManager } from './pages/files.js'; 
import { renderTitanZipPage } from './tools/titanzip.js';

// --- Main App Containers ---
const appContainer = document.getElementById('app');
const bottomBarContainer = document.getElementById('bottom-bar-container');

/**
 * Main navigation function to switch between pages.
 */
async function navigate(page, data) {
    console.log(`Navigating to page: '${page}'`, data ? `with data: ${data.name}`: '');
    
    // The bottom bar is rendered outside the main app container
    // so it doesn't get cleared on every navigation.
    renderBottomBar(bottomBarContainer, navigate, page);
    
    // Clear only the main content area
    appContainer.innerHTML = ''; 

    switch (page) {
        case 'dashboard':
            renderDashboard(appContainer, navigate);
            break;
        case 'files':
            renderFilesPage(appContainer, navigate);
            break;
        case 'editor':
            if (!data) {
                console.error("Navigation error: Tried to open editor with no file data.");
                navigate('files'); 
                return;
            }
            renderCodeEditorPage(appContainer, data, navigate, saveFileCallback);
            break;
        case 'titanzip':
            renderTitanZipPage(appContainer);
            break;
        // The 'browser' page is in the nav bar but doesn't have a file yet.
        // We'll add a placeholder for it.
        case 'browser':
            appContainer.innerHTML = `<h1 style="text-align: center; margin-top: 50px;">Browser Page Coming Soon</h1>`;
            break;
        default:
            console.warn(`Unknown page '${page}', navigating to files.`);
            navigate('files'); // Default to files page
            break;
    }
}

/**
 * A callback function for the code editor to save files.
 */
async function saveFileCallback(fileToSave) {
    console.log("app.js received file to save:", fileToSave.name);
    await IndexedDBManager.init();
    await IndexedDBManager.saveFile(fileToSave);
}

// --- App Initialization ---
function initialize() {
    console.log("App initializing...");
    // Start by navigating to the files page.
    navigate('files'); 
}

// Start the app!
initialize();


