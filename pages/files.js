/**
 * Renders the File Manager page.
 * @param {HTMLElement} container - The DOM element to render the page into.
 * @param {function} navigate - The main navigation function.
 */
export function renderFilesPage(container, navigate) {
    // --- MOCK DATA ---
    const files = [
        { name: 'index.html', type: 'html' }, { name: 'styles.css', type: 'css' },
        { name: 'app.js', type: 'js' }, { name: 'Project Brief', type: 'folder' },
        { name: 'notes.txt', type: 'txt' }, { name: 'image-assets', type: 'folder' },
        { name: 'README.md', type: 'md' }, { name: 'package.json', type: 'json' },
        { name: 'logo.svg', type: 'svg' }, { name: 'api.py', type: 'py' },
        { name: 'server.java', type: 'java' }, { name: 'data-proc', type: 'folder' },
    ];

    // --- STYLES ---
    const filesPageStyles = `
        .files-page-wrapper { padding: 20px 15px; }
        .top-controls { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; }
        .search-bar {
            flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 10px 15px;
            background-color: rgba(30, 30, 30, 0.75); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(128, 128, 128, 0.2); border-radius: 12px;
        }
        .search-bar svg { width: 18px; height: 18px; fill: #d1d1d1; flex-shrink: 0; }
        .search-input { width: 100%; background: transparent; border: none; outline: none; color: var(--primary-text-color); font-size: 1em; }
        .filter-button { padding: 10px; border-radius: 12px; background-color: rgba(30, 30, 30, 0.75); border: 1px solid rgba(128, 128, 128, 0.2); cursor: pointer; }
        .filter-button svg { width: 22px; height: 22px; fill: #d1d1d1; }

        .file-grid {
            display: grid;
            /* --- CHANGE: 4 columns across --- */
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        .file-card {
            /* --- CHANGE: Glassmorphic Container --- */
            background-color: rgba(30, 30, 30, 0.65);
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(128, 128, 128, 0.2);
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            /* --- CHANGE: Drop Shadow --- */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .file-icon-container {
            position: relative; /* For positioning the text initials */
            width: 100%;
            aspect-ratio: 1 / 1;
            margin-bottom: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .file-icon-svg {
            width: 100%;
            height: 100%;
        }
        .file-type-initials {
            position: absolute;
            top: 55%; /* Vertically center the text inside the icon */
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.8em;
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        /* --- CHANGE: Icon Color Classes (applied to SVG) --- */
        .icon-folder-color { fill: #0091EA; }
        .icon-js-color { fill: #F7DF1E; }
        .icon-html-color { fill: #E34F26; }
        .icon-css-color { fill: #1572B6; }
        .icon-txt-color { fill: #8A2BE2; }
        .icon-default-color { fill: #6c757d; }

        .file-name { font-size: 0.75em; color: #d1d1d1; word-break: break-all; }
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
    const fileIconSVG = `<svg class="file-icon-svg" viewBox="0 0 100 120"><path d="M85 25 L85 110 C85 115.523 80.523 120 75 120 L25 120 C19.477 120 15 115.523 15 110 L15 10 C15 4.477 19.477 0 25 0 L60 0 Z M65 5 L65 30 C65 32.761 67.239 35 70 35 L95 35 Z" /></svg>`;
    const folderIconSVG = `<svg class="file-icon-svg" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;

    let iconColorClass = '';
    let iconContent = '';
    let initials = '';

    switch (file.type) {
        case 'folder':
            iconColorClass = 'icon-folder-color';
            iconContent = folderIconSVG;
            break;
        case 'js':
            iconColorClass = 'icon-js-color';
            initials = 'JS';
            break;
        case 'html':
            iconColorClass = 'icon-html-color';
            initials = 'HTML';
            break;
        case 'css':
            iconColorClass = 'icon-css-color';
            initials = 'CSS';
            break;
        case 'txt':
            iconColorClass = 'icon-txt-color';
            initials = 'TXT';
            break;
        default:
            iconColorClass = 'icon-default-color';
            initials = file.type.toUpperCase().substring(0, 4);
            break;
    }

    // If it's a file (not a folder), set the standard file icon
    if (file.type !== 'folder') {
        iconContent = fileIconSVG;
    }

    return `
        <div class="file-card">
            <div class="file-icon-container">
                <div class="${iconColorClass}">${iconContent}</div>
                ${initials ? `<span class="file-type-initials">${initials}</span>` : ''}
            </div>
            <p class="file-name">${file.name}</p>
        </div>
    `;
}


