/**
 * Renders the main dashboard UI into a given container.
 * @param {HTMLElement} container - The DOM element to render the dashboard into.
 * @param {function} navigate - The navigation function from app.js to switch pages.
 */
export function renderDashboard(container, navigate) {
    const dashboardStyles = `
        .dashboard-wrapper {
            padding: 20px 15px;
            width: 100%;
        }
        .header {
            text-align: left;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 1.8em;
            font-weight: 600;
        }
        /* Grid layout for cards */
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr; /* Default to a single column for mobile */
            gap: 15px;
        }
        /* Use two columns for wider screens */
        @media (min-width: 600px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        .stat-card {
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
        }
        .stat-card h2 {
            font-size: 0.95em;
            font-weight: 500;
            color: var(--secondary-text-color);
            margin: 0 0 10px 0;
        }
        .stat-card .stat-value {
            font-size: 2.2em;
            font-weight: 600;
            color: var(--primary-text-color);
            line-height: 1.2;
        }

        .tools-section {
             margin-top: 30px;
        }
        
        .tool-card {
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .tool-card:active {
             background-color: #2a2a2a;
        }
        .tool-card h2 {
            margin: 0;
            font-size: 1.1em;
            font-weight: 500;
        }
        .tool-card .open-arrow {
            font-size: 1.2em;
            color: var(--accent-color);
        }
    `;

    // Inject styles for this page
    const styleElement = document.createElement('style');
    styleElement.textContent = dashboardStyles;
    document.head.appendChild(styleElement);

    // Render the HTML structure
    container.innerHTML = `
        <div class="dashboard-wrapper">
            <div class="header">
                <h1>Activity</h1>
            </div>

            <!-- Grid for individual stat cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h2>Characters Typed</h2>
                    <p class="stat-value">4,592</p>
                </div>
                <div class="stat-card">
                    <h2>Files Created</h2>
                    <p class="stat-value">12</p>
                </div>
                <div class="stat-card">
                    <h2>Files Unzipped</h2>
                    <p class="stat-value">7</p>
                </div>
                 <div class="stat-card">
                    <h2>Lines of Code</h2>
                    <p class="stat-value">1,024</p>
                </div>
            </div>

            <!-- Section for launching tools -->
            <div class="tools-section">
                <div class="header">
                     <h1>Tools</h1>
                </div>
                <div class="tool-card" id="tool-titanzip">
                    <h2>📁 Zip & Unzip</h2>
                    <span class="open-arrow">&rarr;</span>
                </div>
            </div>
        </div>
    `;

    // Add event listener to navigate to the tools
    container.querySelector('#tool-titanzip').addEventListener('click', () => {
        navigate('titanzip');
    });
}


