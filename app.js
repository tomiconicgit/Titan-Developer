import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipTool } from './tools/titanzip.js';
import { renderTopHeader } from './components/topheader.js';

// Get references to the new containers
const headerContainer = document.getElementById('header-container');
const pageContainer = document.getElementById('page-container');

/**
 * A simple client-side router to switch between views.
 * It now clears and renders content only within the page container,
 * leaving the header untouched.
 * @param {string} page - The name of the page to render.
 */
function navigateTo(page) {
    // Clear only the page container
    pageContainer.innerHTML = '';

    // Render the requested page into the page container
    switch (page) {
        case 'titanzip':
            renderTitanZipTool(pageContainer, navigateTo);
            break;
        case 'dashboard':
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

// Main application startup logic
window.addEventListener('DOMContentLoaded', () => {
    // 1. Render the persistent header
    renderTopHeader(headerContainer);

    // 2. Navigate to the initial page (dashboard)
    navigateTo('dashboard');
});


