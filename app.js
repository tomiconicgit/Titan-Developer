import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipTool } from './tools/titanzip.js';

const appContainer = document.getElementById('app');

/**
 * A simple client-side router to switch between views.
 * It clears the main app container and calls the render function
 * for the requested page.
 * @param {string} page - The name of the page to render ('dashboard', 'titanzip', etc.).
 */
function navigateTo(page) {
    // Clear the container before rendering the new view
    appContainer.innerHTML = '';

    // Pass the container and the navigateTo function to each page
    // so they can render themselves and trigger navigation.
    switch (page) {
        case 'titanzip':
            renderTitanZipTool(appContainer, navigateTo);
            break;
        case 'dashboard':
        default:
            renderDashboard(appContainer, navigateTo);
            break;
    }
}

// The application starts by navigating to the dashboard.
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('dashboard');
});

