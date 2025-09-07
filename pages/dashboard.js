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
        .header h1 {
            font-size: 1.8em;
            font-weight: 600;
            margin-bottom: 20px;
        }
        /* --- NEW: Quick Access Styles --- */
        .quick-access-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 40px;
        }
        .qa-card {
            background-color: rgba(30, 30, 30, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(128, 128, 128, 0.2);
            border-radius: 16px;
            padding: 20px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            text-align: center;
            font-weight: 500;
            color: var(--primary-text-color);
            transition: background-color 0.2s, transform 0.2s;
        }
        .qa-card:active {
            transform: scale(0.95);
        }
        .qa-card:hover {
            background-color: rgba(45, 45, 45, 0.8);
        }
        .qa-card span {
            font-size: 2em;
            line-height: 1;
        }
        /* --- End New Styles --- */
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }
        @media (min-width: 600px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        .stat-card {
            background-color: rgba(30, 30, 30, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(128, 128, 128, 0.2);
            border-radius: 16px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .stat-icon {
            width: 24px;
            height: 24px;
            fill: #FFA500; /* Orange color for icons */
            flex-shrink: 0;
        }
        .stat-details {
            text-align: left;
        }
        .stat-details h2 {
            font-size: 0.9em;
            font-weight: 500;
            color: var(--secondary-text-color);
            margin: 0 0 4px 0;
        }
        .stat-details .stat-value {
            font-size: 1.8em;
            font-weight: 600;
            color: var(--primary-text-color);
            line-height: 1.1;
        }
    `;

    // Inject styles for this page
    const styleElement = document.createElement('style');
    styleElement.textContent = dashboardStyles;
    document.head.appendChild(styleElement);

    // Render the HTML structure including the quick access section
    container.innerHTML = `
        <div class="dashboard-wrapper page-content-wrapper">
            <!-- NEW: Quick Access Section -->
            <div class="quick-access-grid">
                <div class="qa-card" data-page="files"><span>📁</span> Files</div>
                <div class="qa-card" data-page="browser"><span>🌐</span> Browser</div>
                <div class="qa-card" data-page="titanzip"><span>📦</span> TitanZip</div>
            </div>
            
            <div class="header">
                <h1>Activity</h1>
            </div>

            <div class="stats-grid">
                <!-- Characters Typed Card -->
                <div class="stat-card">
                    <svg class="stat-icon" viewBox="0 0 24 24"><path d="M6.2,19.2h11.6L19,15.7H5L6.2,19.2z M17.6,4.8H6.4C5.7,4.8,5.2,5.3,5.2,6v7.2h13.6V6C18.8,5.3,18.3,4.8,17.6,4.8z"/></svg>
                    <div class="stat-details">
                        <h2>Characters Typed</h2>
                        <p class="stat-value">4,592</p>
                    </div>
                </div>

                <!-- Files Created Card -->
                <div class="stat-card">
                    <svg class="stat-icon" viewBox="0 0 24 24"><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h7v5h5V20z"/></svg>
                    <div class="stat-details">
                        <h2>Files Created</h2>
                        <p class="stat-value">12</p>
                    </div>
                </div>

                <!-- Files Unzipped Card -->
                <div class="stat-card">
                     <svg class="stat-icon" viewBox="0 0 24 24"><path d="M20,6h-8L10,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z M12,17v-2h-2v-2h2v-2h2v2h2v2h-2v2H12z"/></svg>
                    <div class="stat-details">
                        <h2>Files Unzipped</h2>
                        <p class="stat-value">7</p>
                    </div>
                </div>

                 <!-- Lines of Code Card -->
                <div class="stat-card">
                    <svg class="stat-icon" viewBox="0 0 24 24"><path d="M9.4,16.6L4.8,12l4.6-4.6L8,6l-6,6l6,6L9.4,16.6z M14.6,16.6l4.6-4.6l-4.6-4.6L16,6l6,6l-6,6L14.6,16.6z"/></svg>
                    <div class="stat-details">
                        <h2>Lines of Code</h2>
                        <p class="stat-value">1,024</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners to the new quick access cards
    container.querySelectorAll('.qa-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            if (page) {
                navigate(page);
            }
        });
    });
}


