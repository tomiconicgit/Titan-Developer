/**
 * Renders the File Manager page.
 * @param {HTMLElement} container - The DOM element to render the page into.
 * @param {function} navigate - The main navigation function.
 */
export function renderFilesPage(container, navigate) {
    // --- MOCK DATA: Replace with real data from storage later ---
    const files = [
        { name: 'index.html', type: 'html', size: '2 KB', date: '2025-09-05' },
        { name: 'styles.css', type: 'css', size: '5 KB', date: '2025-09-04' },
        { name: 'app.js', type: 'js', size: '12 KB', date: '2025-09-05' },
        { name: 'Project Brief', type: 'folder', size: '3 files', date: '2025-09-01' },
        { name: 'notes.txt', type: 'txt', size: '1 KB', date: '2025-08-30' },
        { name: 'image-assets', type: 'folder', size: '15 files', date: '2025-08-28' },
        { name: 'README.md', type: 'md', size: '1 KB', date: '2025-08-28' },
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Default sort by date

    // --- STYLES ---
    const filesPageStyles = `
        .files-page-wrapper {
            padding: 20px 15px;
        }
        .top-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            align-items: center;
        }
        .search-bar {
            flex-grow: 1;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 15px;
            /* Glass Effect */
            background-color: rgba(30, 30, 30, 0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(128, 128, 128, 0.2);
            border-radius: 12px;
        }
        .search-bar svg {
            width: 18px;
            height: 18px;
            fill: #d1d1d1; /* Off-white */
            flex-shrink: 0;
        }
        .search-input {
            width: 100%;
            background: transparent;
            border: none;
            outline: none;
            color: var(--primary-text-color);
            font-size: 1em;
        }
        .filter-button {
            padding: 10px;
            border-radius: 12px;
            background-color: rgba(30, 30, 30, 0.75);
            border: 1px solid rgba(128, 128, 128, 0.2);
            cursor: pointer;
        }
        .filter-button svg { width: 22px; height: 22px; fill: #d1d1d1; }

        .file-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .file-item {
            text-align: center;
        }
        .file-icon {
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 16px;
            margin-bottom: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.4);
        }
        .file-icon svg { width: 50%; height: 50%; fill: white; }

        /* Icon Gradients */
        .bg-folder { background: linear-gradient(45deg, #007BFF, #00BFFF); }
        .bg-js { background: linear-gradient(45deg, #F7DF1E, #F0A500); }
        .bg-html { background: linear-gradient(45deg, #e3e3e3, #c4c4c4); color: #333; }
        .bg-css { background: linear-gradient(45deg, #264DE4, #1572B6); }
        .bg-txt { background: linear-gradient(45deg, #8A2BE2, #9932CC); }
        .bg-default { background: linear-gradient(45deg, #6c757d, #495057); }

        .file-name {
            font-size: 0.8em;
            color: #d1d1d1;
            word-break: break-all;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = filesPageStyles;
    document.head.appendChild(styleElement);

    // --- HTML ---
    container.innerHTML = `
        <div class="files-page-wrapper">
            <div class="top-controls">
                <div class="search-bar">
                    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input" placeholder="Search files...">
                </div>
                <div class="filter-button">
                    <svg viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>
                </div>
            </div>
            <div class="file-grid">
                ${files.map(file => createFileItem(file)).join('')}
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for a single file or folder item.
 * @param {object} file - The file or folder data.
 * @returns {string} The HTML string for the item.
 */
function createFileItem(file) {
    let iconContent = '';
    let backgroundClass = '';

    switch (file.type) {
        case 'folder':
            backgroundClass = 'bg-folder';
            iconContent = `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
            break;
        case 'js':
            backgroundClass = 'bg-js';
            iconContent = 'JS';
            break;
        case 'html':
            backgroundClass = 'bg-html';
            iconContent = 'HTML';
            break;
        case 'css':
            backgroundClass = 'bg-css';
            iconContent = 'CSS';
            break;
        case 'txt':
            backgroundClass = 'bg-txt';
            iconContent = `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
            break;
        default:
            backgroundClass = 'bg-default';
            iconContent = `<svg viewBox="0 0 24 24"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/></svg>`;
            break;
    }

    return `
        <div class="file-item">
            <div class="file-icon ${backgroundClass}">
                ${iconContent}
            </div>
            <p class="file-name">${file.name}</p>
        </div>
    `;
}

