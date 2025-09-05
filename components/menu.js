/**
 * Renders and manages the floating navigation menu system.
 * This includes the menu button and the overlay with navigation links.
 * @param {HTMLElement} container - The DOM element to render the menu button into.
 * @param {function} navigate - The main navigation function from app.js.
 */
export function renderMenu(container, navigate) {
    const menuStyles = `
        /* Menu Button Styling */
        .menu-button {
            position: fixed;
            top: 14px;
            left: 15px;
            width: 44px;
            height: 44px;
            background: linear-gradient(145deg, #ffb866, #ff8c00);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1002; /* Above the page, below the menu overlay */
            border: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            transition: transform 0.1s ease-in-out;
        }
        .menu-button:active {
            transform: scale(0.92); /* Push in animation on press */
        }
        .menu-button svg {
            width: 24px;
            height: 24px;
            fill: #ffffff;
        }

        /* Menu Overlay Styling */
        .menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 1001; /* Above everything else */
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .menu-overlay.visible {
            opacity: 1;
            visibility: visible;
        }
        .menu-container {
            display: flex;
            gap: 20px;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .menu-overlay.visible .menu-container {
             transform: translateY(0);
        }
        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            cursor: pointer;
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.2s, transform 0.2s;
        }
        .menu-item:hover {
            opacity: 1;
            transform: scale(1.05);
        }
        .menu-item-icon-wrapper {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(145deg, #0096ff, #0052cc); /* Blue Gradient */
        }
        .menu-item-icon-wrapper svg {
            width: 40px;
            height: 40px;
            fill: #ffffff;
        }
        .menu-item-label {
            font-size: 1em;
            font-weight: 500;
            color: var(--primary-text-color);
        }
    `;

    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = menuStyles;
    document.head.appendChild(styleElement);

    // --- HTML Structure ---
    container.innerHTML = `
        <!-- The floating menu button -->
        <button class="menu-button" id="menu-toggle">
            <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>
        </button>

        <!-- The hidden menu overlay -->
        <div class="menu-overlay" id="menu-overlay">
            <div class="menu-container">
                <!-- Titan Zip Tool Link -->
                <a href="#" class="menu-item" data-page="titanzip">
                    <div class="menu-item-icon-wrapper">
                        <svg viewBox="0 0 24 24"><path d="M18 4V2h-4v2h-2V2h-4v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2h-4zm-2 2h-2v2h2v2h-2v2h2v2h-2v-2h-2v2h-2v-2h2v-2h-2v-2h2V6h-2V4h2v2h2V4h2v2z"/></svg>
                    </div>
                    <span class="menu-item-label">Titan Zip</span>
                </a>
                <!-- Add more tools here in the future -->
            </div>
        </div>
    `;

    // --- Functionality ---
    const menuButton = document.getElementById('menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');

    // Function to open/close the menu
    const toggleMenu = (show) => {
        menuOverlay.classList.toggle('visible', show);
    };

    // Event listener for the menu button
    menuButton.addEventListener('click', () => {
        // Haptic feedback (if supported)
        if (navigator.vibrate) {
            navigator.vibrate(50); // A short, crisp vibration
        }
        toggleMenu(true);
    });

    // Close the menu if the overlay background is clicked
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            toggleMenu(false);
        }
    });

    // Event listeners for the navigation items inside the menu
    menuOverlay.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            toggleMenu(false); // Close the menu first
            // Navigate after a short delay to allow the closing animation to be seen
            setTimeout(() => {
                if (page) navigate(page);
            }, 300);
        });
    });
}

