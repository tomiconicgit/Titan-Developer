/**
 * Renders the redesigned main dashboard UI.
 */
export function renderDashboard(container, navigate) {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Titan UI for Dashboard */
        .dashboard-wrapper { padding: 20px 15px; }
        .dashboard-header { margin-bottom: 30px; }
        .dashboard-header h1 { font-size: 2.2em; font-weight: 700; color: #E6EDF3; margin: 0 0 5px 0; }
        .dashboard-header p { font-size: 1.1em; color: #8B949E; margin: 0; }
        .section-title { font-size: 1.5em; font-weight: 600; color: #C9D1D9; margin: 40px 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid #30363D;}
        .quick-access-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .qa-card { background-color: #161B22; border-radius: 12px; border: 1px solid #30363D; padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; cursor: pointer; transition: transform 0.2s ease, background-color 0.2s ease; }
        .qa-card:hover { background-color: #21262D; transform: translateY(-3px); }
        .qa-card .icon { font-size: 2em; line-height: 1; }
        .qa-card .title { font-size: 1.1em; font-weight: 600; color: #E6EDF3; }
        .stats-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
        @media (min-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .stat-card { background-color: #161B22; border-radius: 12px; border: 1px solid #30363D; padding: 15px; display: flex; align-items: center; gap: 15px; }
        .stat-icon { width: 32px; height: 32px; flex-shrink: 0; display: grid; place-items: center; background-color: rgba(88, 166, 255, 0.1); border-radius: 8px; color: #58A6FF; }
        .stat-icon svg { width: 20px; height: 20px; fill: currentColor; }
        .stat-details h2 { font-size: 0.9em; font-weight: 500; color: #8B949E; margin: 0 0 4px 0; }
        .stat-details .stat-value { font-size: 1.8em; font-weight: 600; color: #E6EDF3; line-height: 1.1; }
    `;
    document.head.appendChild(styleElement);

    container.innerHTML = `
        <div class="dashboard-wrapper page-content-wrapper">
            <header class="dashboard-header">
                <h1>Home</h1>
                <p>Welcome to your developer workspace.</p>
            </header>

            <div class="quick-access-grid">
                <div class="qa-card" data-page="files">
                    <span class="icon">📁</span>
                    <span class="title">File Manager</span>
                </div>
                <div class="qa-card" data-page="browser">
                     <span class="icon">🌐</span>
                    <span class="title">Browser</span>
                </div>
                <div class="qa-card" data-page="titanzip">
                     <span class="icon">📦</span>
                    <span class="title">TitanZip</span>
                </div>
                 <div class="qa-card" data-page="editor">
                     <span class="icon">✏️</span>
                    <span class="title">New Scratchpad</span>
                </div>
            </div>

            <h2 class="section-title">Activity</h2>
            <div class="stats-grid">
                <!-- Stats Cards -->
            </div>
        </div>
    `;

    container.querySelectorAll('.qa-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            if (page === 'editor') {
                 // Create a temporary scratchpad file to open
                 const scratchFile = { id: `scratch-${Date.now()}`, name: "scratchpad.js", type: "js", content: "// Start typing...", parentId: 'root' };
                 navigate('editor', scratchFile);
            } else {
                navigate(page);
            }
        });
    });
}


