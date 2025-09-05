import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipTool } from './tools/titanzip.js';
import { renderTopHeader } from './components/topheader.js';
import { renderNavBar } from './components/navbar.js';

// Get references to all containers
const headerContainer = document.getElementById('header-container');
const navbarContainer = document.getElementById('navbar-container');
const pageContainer = document.getElementById('page-container');

/**
 * The main router. It now re-renders the navbar on each navigation
 * to update the 'active' state of the links.
 * @param {string} page - The name of the page to render.
 */
function navigateTo(page) {
    // 1. Re-render the navbar, passing the new page name to set the active link
    renderNavBar(navbarContainer, navigateTo, page);
    
    // 2. Clear and render the page content
    pageContainer.innerHTML = '';
    switch (page) {
        case 'titanzip':
            renderTitanZipTool(pageContainer);
            break;
        case 'dashboard':
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

// Main application startup logic
window.addEventListener('DOMContentLoaded', () => {
    // Render the persistent top header once
    renderTopHeader(headerContainer);

    // Navigate to the initial page (dashboard)
    navigateTo('dashboard');
});


