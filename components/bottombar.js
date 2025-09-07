/**
 * Renders the fixed bottom navigation bar for the application.
 * @param {HTMLElement} container - The DOM element to render the bar into.
 * @param {function} navigate - The main navigation function from app.js.
 * @param {string} currentPage - The key of the currently active page.
 */
export function renderBottomBar(container, navigate, currentPage) {
    const bottomBarStyles = `
        .bottom-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 70px; /* Base height */
            padding-bottom: env(safe-area-inset-bottom, 0); /* SafeArea for iPhones */
            
            /* Glass Effect */
            background-color: rgba(20, 20, 20, 0.75);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-top: 1px solid rgba(128, 128, 128, 0.2);

            display: flex;
            justify-content: space-around;
            align-items: flex-start; /* Align to top of bar */
            padding-top: 10px;
            z-index: 1000;
        }
        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            flex-grow: 1;
            color: #d1d1d1; /* Off-white */
            transition: color 0.2s;
            -webkit-tap-highlight-color: transparent; /* Removes tap highlight on mobile */
        }
        .nav-item svg {
            width: 26px;
            height: 26px;
            fill: currentColor; /* Inherits color from parent */
            pointer-events: none; /* Make sure click event is on the parent div */
        }
        /* Active State */
        .nav-item.active {
            color: #FFA500; /* Orange */
        }
    `;

    // Inject styles
    const styleElement = document.createElement('style');
    // A simple check to avoid adding styles repeatedly if not needed.
    if (!document.getElementById('bottom-bar-styles')) {
        styleElement.id = 'bottom-bar-styles';
        styleElement.textContent = bottomBarStyles;
        document.head.appendChild(styleElement);
    }
    

    // Navigation links definitions
    const navLinks = [
        { id: 'dashboard', svg: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>` },
        { id: 'files', svg: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>` },
        { id: 'browser', svg: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>` },
        { id: 'titanzip', svg: `<svg viewBox="0 0 24 24"><path d="M20 6h-8L10 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2h-2v-2h2v2h2v-2h2v2z"/></svg>` }
    ];

    const linksHTML = navLinks.map(link => `
        <div class="nav-item ${currentPage === link.id ? 'active' : ''}" data-page="${link.id}">
            ${link.svg}
        </div>
    `).join('');

    // Render HTML
    container.innerHTML = `<nav class="bottom-bar">${linksHTML}</nav>`;

    // Add event listeners
    container.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            const page = e.currentTarget.dataset.page;
            if (page) navigate(page);
        });
    });
}


