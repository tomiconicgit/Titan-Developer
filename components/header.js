/**
 * Renders the slim header bar that provides the glass effect on scroll.
 * @param {HTMLElement} headerContainer - The container for the header bar.
 * @param {HTMLElement} pageContainer - The main page container to attach the scroll listener to.
 */
export function renderHeader(headerContainer, pageContainer) {
    const headerStyles = `
        .slim-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 70px; /* Provides space for the menu button */
            z-index: 1000; /* Sits behind the menu button and overlay */
            background-color: var(--background-color); /* Initial state: solid black */
            transition: background-color 0.4s ease, backdrop-filter 0.4s ease;
        }

        /* The 'scrolled' state for the glass effect */
        .slim-header.scrolled {
            background-color: rgba(20, 20, 20, 0.65); /* Semi-transparent */
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px); /* For Safari */
            border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }
    `;

    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = headerStyles;
    document.head.appendChild(styleElement);

    // Render HTML
    headerContainer.innerHTML = `<div id="slim-header" class="slim-header"></div>`;

    // --- Scroll Effect Logic ---
    const headerBar = document.getElementById('slim-header');

    // Listen for scroll events on the page container
    pageContainer.addEventListener('scroll', () => {
        // If the user has scrolled more than 10px, add the class. Otherwise, remove it.
        if (pageContainer.scrollTop > 10) {
            headerBar.classList.add('scrolled');
        } else {
            headerBar.classList.remove('scrolled');
        }
    });
}

