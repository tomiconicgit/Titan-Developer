/**
 * Renders a horizontally-scrolling navigation bar.
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
        /* Hide scrollbar for a cleaner look on supported browsers */
        .nav-scroller::-webkit-scrollbar {
            display: none;
        }
        .nav-list {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 48px; /* Standard tappable height for mobile nav */
        }
        .nav-item {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 8px;
            background-color: transparent;
            color: var(--secondary-text-color);
            border: 1px solid transparent;
            font-size: 0.9em;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
        }
        .nav-item.active {
            color: var(--primary-text-color);
            background-color: #333; /* Active state indicator */
        }
    `;

    // Inject the component's styles
    const styleElement = document.createElement('style');
    styleElement.textContent = navStyles;
    document.head.appendChild(styleElement);

    // Define the navigation links
    const navLinks = [
        { id: 'dashboard', text: 'Dashboard' },
        { id: 'titanzip', text: 'Titan Zip' },
        // ... more tools will be added here
    ];

    // Build the HTML for the navigation items
    const linksHTML = navLinks.map(link => `
        <div class="nav-item ${currentPage === link.id ? 'active' : ''}" data-page="${link.id}">
            ${link.text}
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

