/**
 * Renders the fixed global header for the application.
 * @param {HTMLElement} container - The DOM element to render the header into.
 */
export function renderTopHeader(container) {
    const headerStyles = `
        .app-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            /* --- CHANGE: Matched to main background color --- */
            background-color: var(--background-color);
            display: flex;
            align-items: center;
            padding: 0 15px;
            z-index: 1000;
            border-bottom: 1px solid var(--border-color);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo-svg {
            width: 32px;
            height: 32px;
        }
        .app-title {
            font-size: 1.1em;
            font-weight: 700; /* Bold weight */
            color: var(--primary-text-color);
            letter-spacing: 0.5px;
        }
    `;

    // Inject the component's styles into the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = headerStyles;
    document.head.appendChild(styleElement);

    // Render the header's HTML structure
    container.innerHTML = `
        <header class="app-header">
            <div class="logo-container">
                <svg class="logo-svg" viewBox="0 0 512 512">
                    <path fill="#FFFFFF" d="M256 0C167.4 0 96 71.4 96 160v128h320V160C416 71.4 344.6 0 256 0z M128 416h256v32H128v-32zm-32-64h320v32H96v-32zm-32-64h384v32H64v-32z"/>
                    <path fill="#FFFFFF" d="M64 480h384v32H64z"/>
                </svg>
                <span class="app-title">Titan Developer</span>
            </div>
        </header>
    `;
}


