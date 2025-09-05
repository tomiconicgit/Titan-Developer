import { renderDashboard } from './pages/dashboard.js';
// Correctly imports the function from the self-contained tool module
import { renderTitanZipPage } from './tools/titanzip.js';
import { renderNavBar } from './components/navbar.js';

const navContainer = document.getElementById('nav-container');
const pageContainer = document.getElementById('page-container');

/**
 * Main navigation function.
 * @param {string} page - The key of the page to navigate to.
 */
function navigateTo(page) {
    renderNavBar(navContainer, navigateTo, page);
    pageContainer.innerHTML = '';

    switch (page) {
        case 'titanzip':
            // The function call is now simpler and correct
            renderTitanZipPage(pageContainer);
            break;
        case 'dashboard':
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

// Initial load: navigate to the dashboard
navigateTo('dashboard');


