/**
 * Renders the unified top navigation bar, which includes the app title/logo
 * and the horizontally-scrolling tool links.
 * @param {HTMLElement} container - The DOM element to render the navbar into.
 * @param {function} navigate - The main navigation function from app.js.
 * @param {string} currentPage - The name of the currently active page to highlight.
 */
export function renderNavBar(container, navigate, currentPage) {
    const navStyles = `
        .unified-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: var(--background-color);
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        .nav-header {
            display: flex;
            align-items: center;
            gap: 12px;
            height: 50px;
            padding: 0 15px;
            border-bottom: 1px solid var(--border-color);
        }
        .logo-svg {
            width: 28px;
            height: 28px;
        }
        .app-title {
            font-size: 1.1em;
            font-weight: 700;
            color: var(--primary-text-color);
        }
        .nav-scroller {
            width: 100%;
            padding: 0 15px;
            overflow-x: auto;
            white-space: nowrap;
        }
        .nav-scroller::-webkit-scrollbar {
            display: none;
        }
        .nav-list {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 48px;
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 8px;
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
            width: 16px;
            height: 16px;
        }
        .nav-item .icon-dashboard {
            fill: #FFA500; /* Orange */
        }
        .nav-item .icon-titanzip {
            fill: var(--accent-color); /* Blue */
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = navStyles;
    document.head.appendChild(styleElement);

    const navLinks = [
        { id: 'dashboard', text: 'Dashboard', svg: `<svg class="icon-dashboard" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>` },
        { id: 'titanzip', text: 'Titan Zip', svg: `<svg class="icon-titanzip" viewBox="0 0 24 24"><path d="M18 4V2h-4v2h-2V2h-4v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2h-4zm-2 2h-2v2h2v2h-2v2h2v2h-2v-2h-2v2h-2v-2h2v-2h-2v-2h2V6h-2V4h2v2h2V4h2v2z"/></svg>` },
    ];

    const linksHTML = navLinks.map(link => `
        <div class="nav-item ${currentPage === link.id ? 'active' : ''}" data-page="${link.id}">
            ${link.svg}
            <span>${link.text}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="unified-nav">
            <div class="nav-header">
                <svg class="logo-svg" viewBox="0 0 512 512">
                    <path fill="#FFFFFF" d="M256 0C167.4 0 96 71.4 96 160v128h320V160C416 71.4 344.6 0 256 0z M128 416h256v32H128v-32zm-32-64h320v32H96v-32zm-32-64h384v32H64v-32z"/>
                    <path fill="#FFFFFF" d="M64 480h384v32H64z"/>
                </svg>
                <span class="app-title">Titan Developer</span>
            </div>
            <nav class="nav-scroller">
                <div class="nav-list">
                    ${linksHTML}
                </div>
            </nav>
        </div>
    `;

    container.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            if (page) navigate(page);
        });
    });
}


