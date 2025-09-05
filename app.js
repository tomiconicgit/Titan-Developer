import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipPage } from './tools/titanzip.js';
// Import the new menu component
import { renderMenu } from './components/menu.js';

// Get the main containers from the DOM
const menuContainer = document.getElementById('menu-container');
const pageContainer = document.getElementById('page-container');

/**
 * Main navigation function.
 * @param {string} page - The key of the page to navigate to.
 */
function navigateTo(page) {
    pageContainer.innerHTML = '';
    
    // The menu is persistent, so we don't re-render it on navigation.
    // We navigate back to the dashboard by default if the page is 'dashboard'.
    if (page === 'dashboard') {
        renderDashboard(pageContainer, navigateTo);
        return; // Early exit to prevent falling through the switch
    }

    switch (page) {
        case 'titanzip':
            renderTitanZipPage(pageContainer);
            break;
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

// Initial render
renderMenu(menuContainer, navigateTo);
navigateTo('dashboard');


