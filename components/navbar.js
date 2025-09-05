/**
 * Renders a horizontally-scrolling navigation bar with icons.
 * @param {HTMLElement} container - The DOM element to render the navbar into.
 * @param {function} navigate - The main navigation function from app.js.
 * @param {string} currentPage - The name of the currently active page to highlight.
 */
export function renderNavBar(container, navigate, currentPage) {
    const navStyles = `
        .nav-scroller {
            position: fixed;
            top: 60px; /* Position directly below the 60px main header */
            left: 0;
            width: 100%;
            background-color: var(--surface-color);
            z-index: 999;
            border-bottom: 1px solid var(--border-color);
            padding: 0 15px;
            overflow-x: auto; /* Enables horizontal scrolling */
            white-space: nowrap; /* Prevents items from wrapping */
        }
        .nav-scroller::-webkit-scrollbar {
            display: none; /* Hide scrollbar for a cleaner look */
        }
        .nav-list {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 48px;
        }
        .nav-item {
            display: flex; /* Use flexbox to align icon and text */
            align-items: center;
            gap: 8px; /* Space between icon and text */
            padding: 8px 16px;
            border-radius: 8px;
            color: var(--secondary-text-color);
            font-size: 0.9em;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
        }
        .nav-item.active {
            color: var(--primary-text-color);
            background-color: #333;
        }
        .nav-item svg {
            width: 16px; /* Icon size */
            height: 16px;
            /* The general 'fill: currentColor' is removed to allow for specific colors. */
        }

        /* --- NEW: Specific colors for each icon --- */
        .nav-item .icon-dashboard {
            fill: #FFA500; /* Orange */
        }
        .nav-item .icon-titanzip {
            fill: var(--accent-color); /* Blue from the app's theme */
        }
    `;

    // Inject the component's styles
    const styleElement = document.createElement('style');
    styleElement.textContent = navStyles;
    document.head.appendChild(styleElement);

    // Define the navigation links, now with SVG icons that have classes for coloring
    const navLinks = [
        { 
            id: 'dashboard', 
            text: 'Dashboard',
            // Added class="icon-dashboard"
            svg: `<svg class="icon-dashboard" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>`
        },
        { 
            id: 'titanzip', 
            text: 'Titan Zip',
            // Added class="icon-titanzip"
            svg: `<svg class="icon-titanzip" viewBox="0 0 24 24"><path d="M18 4V2h-4v2h-2V2h-4v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2h-4zm-2 2h-2v2h2v2h-2v2h2v2h-2v-2h-2v2h-2v-2h2v-2h-2v-2h2V6h-2V4h2v2h2V4h2v2z"/></svg>`
        },
        // ... more tools will be added here
    ];

    // Build the HTML for the navigation items, now including the SVG
    const linksHTML = navLinks.map(link => `
        <div class="nav-item ${currentPage === link.id ? 'active' : ''}" data-page="${link.id}">
            ${link.svg}
            <span>${link.text}</span>
        </div>
    `).join('');
    
    // Render the navbar structure
    container.innerHTML = `
        <nav class="nav-scroller">
            <div class="nav-list">
                ${linksHTML}
            </div>
        </nav>
    `;

    // Add event listeners to the navigation items
    container.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            if (page) {
                navigate(page);
            }
        });
    });
}


