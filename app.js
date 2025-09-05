import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipPage } from './tools/titanzip.js';
// We only need to import the new unified navbar
import { renderNavBar } from './components/navbar.js';

// Get the main containers from the DOM
const navContainer = document.getElementById('nav-container');
const pageContainer = document.getElementById('page-container');

/**
 * Main navigation function. Clears the page and renders the new content.
 * It also re-renders the navbar to update the 'active' state.
 * @param {string} page - The key of the page to navigate to.
 */
function navigateTo(page) {
    // Re-render the navbar on every navigation to update the active link
    renderNavBar(navContainer, navigateTo, page);
    
    // Clear the current page content
    pageContainer.innerHTML = '';

    // Render the selected page
    switch (page) {
        case 'titanzip':
            renderTitanZipPage(pageContainer, navigateTo);
            break;
        case 'dashboard':
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

// Initial load: navigate to the dashboard
navigateTo('dashboard');


