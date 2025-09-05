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
            height: 100%;
            overflow-y: auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 2em;
            font-weight: 600;
        }
        .card-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .card {
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            transition: background-color 0.2s;
        }
        .card.interactive:active {
             background-color: #2a2a2a;
        }
        .card h2 {
            font-size: 1.2em;
            color: var(--primary-text-color);
            margin: 0 0 15px 0;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.95em;
            margin-bottom: 10px;
        }
        .stat-label {
            color: var(--secondary-text-color);
        }
        .stat-value {
            font-weight: 600;
            color: var(--primary-text-color);
        }
        .tool-item {
            cursor: pointer;
        }
        .tool-item .stat-value {
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
                <h1>Dashboard</h1>
            </div>
            <div class="card-list">
                <div class="card">
                    <h2>Statistics</h2>
                    <div class="stat-item">
                        <span class="stat-label">Characters Used</span>
                        <span class="stat-value">4,592</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Files Created</span>
                        <span class="stat-value">12</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Time in App</span>
                        <span class="stat-value">1h 27m</span>
                    </div>
                </div>
                
                <div class="card interactive" id="tools-card">
                    <h2>Tools</h2>
                    <div class="stat-item tool-item">
                        <span class="stat-label">📁 Zip & Unzip Tool</span>
                        <span class="stat-value">Open &rarr;</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listener to navigate to the tools
    container.querySelector('#tools-card').addEventListener('click', () => {
        navigate('titanzip');
    });
}

