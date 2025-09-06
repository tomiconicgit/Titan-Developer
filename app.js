import { renderDashboard } from './pages/dashboard.js';
import { renderTitanZipPage } from './tools/titanzip.js';
import { renderBottomBar } from './components/bottombar.js';
// Import the new files page
import { renderFilesPage } from './pages/files.js';

const pageContainer = document.getElementById('page-container');
const bottomBarContainer = document.getElementById('bottom-bar-container');

function navigateTo(page) {
    renderBottomBar(bottomBarContainer, navigateTo, page);
    pageContainer.innerHTML = '';
    // Scroll to top on page change
    pageContainer.scrollTop = 0;

    switch (page) {
        case 'titanzip':
            renderTitanZipPage(pageContainer);
            break;
        
        // Add the new files page to the router
        case 'files':
            renderFilesPage(pageContainer, navigateTo);
            break;

        case 'browser': // Falls through to default for now
        case 'dashboard':
        default:
            renderDashboard(pageContainer, navigateTo);
            break;
    }
}

navigateTo('dashboard');


