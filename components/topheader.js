/**
 * Renders a fixed global header with a logo and title.
 * @param {HTMLElement} container - The DOM element to render the header into.
 */
export function renderTopHeader(container) {
    const headerStyles = `
        .global-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px; /* Standard mobile header height */
            background-color: var(--surface-color);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            padding: 0 15px;
            z-index: 1000; /* Ensures header is on top of other content */
        }
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px; /* Space between logo and text */
        }
        .logo-svg {
            width: 32px; /* Logo size */
            height: 32px;
        }
        .app-title {
            font-size: 1.1em;
            /* Use -apple-system font stack which defaults to San Francisco on Apple devices. font-weight: 600 makes it bold. */
            font-weight: 600; 
            color: var(--primary-text-color);
        }
    `;

    // Inject the component's styles into the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = headerStyles;
    document.head.appendChild(styleElement);

    // Render the header's HTML structure
    container.innerHTML = `
        <header class="global-header">
            <div class="logo-container">
                <!-- SVG for Corinthian Helmet Logo -->
                <svg class="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9V14C5 15.66 6.34 17 8 17H9V20C9 20.55 9.45 21 10 21H14C14.55 21 15 20.55 15 20V17H16C17.66 17 19 15.66 19 14V9C19 5.13 15.87 2 12 2ZM17 14C17 14.55 16.55 15 16 15H8C7.45 15 7 14.55 7 14V9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9V14Z" fill="white"/>
                    <path d="M12 6C10.9 6 10 6.9 10 8V11H14V8C14 6.9 13.1 6 12 6Z" fill="white" fill-opacity="0.5"/>
                </svg>
                <span class="app-title">Titan Developer</span>
            </div>
        </header>
    `;
}

