import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipPage } from './tools/titanzip.js';
import { renderMenu } from './components/menu.js';
// Import the new header component
import { renderHeader } from './components/header.js';

// Get all the main containers from the DOM
const headerContainer = document.getElementById('header-container');
const menuContainer = document.getElementById('menu-container');
const pageContainer = document.getElementById('page-container');

/**
 * Main navigation function.
 * @param {string} page - The key of the page to navigate to.
 */
function navigateTo(page) {
    pageContainer.innerHTML = '';
    
    if (page === 'dashboard') {
        renderDashboard(pageContainer, navigateTo);
        return;
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
// The header needs the page container to attach its scroll listener
renderHeader(headerContainer, pageContainer); 
renderMenu(menuContainer, navigateTo);
navigateTo('dashboard');


