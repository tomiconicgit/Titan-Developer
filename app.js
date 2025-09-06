import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipPage } from './tools/titanzip.js';
// Import the new bottom bar component
import { renderBottomBar } from './components/bottombar.js';

// Get the main containers from the DOM
const pageContainer = document.getElementById('page-container');
const bottomBarContainer = document.getElementById('bottom-bar-container');

/**
 * Main navigation function.
 * @param {string} page - The key of the page to navigate to.
 */
function navigateTo(page) {
    // Re-render the bottom bar to update the active icon
    renderBottomBar(bottomBarContainer, navigateTo, page);
    
    // Clear the current page content
    pageContainer.innerHTML = '';
    
    // Switch to the correct page
    switch (page) {
        case 'titanzip':
            renderTitanZipPage(pageContainer);
            break;
        
        // For now, these all lead to the dashboard
        case 'files':
        case 'browser':
        case 'dashboard':
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

// Initial render
navigateTo('dashboard'); // Start on the dashboard page


