// --- App Modules ---
import { renderFilesPage } from './pages/files.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCodeEditorPage } from './tools/codeeditor.js';
import { renderTitanZipPage } from './tools/titanzip.js';
import { renderBrowserPage } from './pages/browser.js'; // New
import { renderBottomBar } from './components/bottombar.js';
import { IndexedDBManager } from './pages/files.js'; 

// --- Main App Containers ---
const appContainer = document.getElementById('app');
const bottomBarContainer = document.getElementById('bottom-bar-container');

/**
 * Main navigation function to switch between pages.
 */
async function navigate(page, data) {
    console.log(`Navigating to page: '${page}'`, data ? `with data: ${JSON.stringify(data)}`: '');
    
    renderBottomBar(bottomBarContainer, navigate, page);
    
    appContainer.innerHTML = ''; 

    switch (page) {
        case 'dashboard':
            renderDashboard(appContainer, navigate);
            break;
        case 'files':
            // Pass the current folder ID if available, otherwise default to root
            renderFilesPage(appContainer, navigate, data?.folderId);
            break;
        case 'editor':
            if (!data) {
                console.error("Navigation error: Tried to open editor with no file data.");
                return navigate('files'); 
            }
            renderCodeEditorPage(appContainer, data, navigate, saveFileCallback);
            break;
        case 'browser': // New
            renderBrowserPage(appContainer, navigate);
            break;
        case 'titanzip':
            renderTitanZipPage(appContainer);
            break;
        default:
            console.warn(`Unknown page '${page}', navigating to dashboard.`);
            navigate('dashboard');
            break;
    }
}

/**
 * A callback function for the code editor to save files.
 */
async function saveFileCallback(fileToSave) {
    await IndexedDBManager.init();
    await IndexedDBManager.saveItem(fileToSave);
}

// --- App Initialization ---
function initialize() {
    console.log("App initializing...");
    // Start by navigating to the dashboard.
    navigate('dashboard'); 
}

initialize();


