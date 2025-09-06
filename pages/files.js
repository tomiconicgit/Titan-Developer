/**
 * Renders the File Manager page, now using specific PNG icons and no individual item containers.
 * @param {HTMLElement} container - The DOM element to render the page into.
 * @param {function} navigate - The main navigation function.
 */
export function renderFilesPage(container, navigate) {
    const files = [
        { name: 'Project Assets', type: 'folder', meta: '12 items' },
        { name: 'index.html', type: 'html', meta: 'Sep 5, 2025' },
        { name: 'manifest.json', type: 'json', meta: 'Sep 5, 2025' },
        { name: 'styles.css', type: 'css', meta: 'Sep 4, 2025' },
        { name: 'app.js', type: 'js', meta: 'Sep 5, 2025' },
        { name: 'notes.txt', type: 'txt', meta: 'Aug 30, 2025' },
        { name: 'design.pdf', type: 'pdf', meta: 'Aug 29, 2025' },
        { name: 'README.md', type: 'md', meta: 'Aug 28, 2025' },
    ];

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
            grid-template-columns: repeat(3, 1fr);
            gap: 25px 20px;
        }
        .file-item {
            text-align: center;
        }

        /* --- Updated for PNG Icons --- */
        .file-icon-wrapper {
            position: relative;
            width: 70px; /* Adjust size as needed for PNGs */
            height: 70px; /* Adjust size as needed for PNGs */
            margin: 0 auto 10px auto;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .file-icon-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain; /* Ensures the image fits without distortion */
        }
        
        /* Removed .file-type-label and related styles */

        .file-name {
            font-size: 0.85em;
            color: #e3e3e3;
            font-weight: 500;
            margin: 0;
            word-break: break-word; /* Ensure long names wrap */
        }
        .file-meta {
            font-size: 0.75em;
            color: var(--secondary-text-color);
            margin-top: 4px;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = filesPageStyles;
    document.head.appendChild(styleElement);

    container.innerHTML = `
        <div class="files-page-wrapper">
            <div class="top-controls">
                <div class="search-bar">
                    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input" placeholder="Search...">
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
 * Generates the HTML for a single file or folder item using PNG icons.
 * @param {object} file - The file or folder data.
 * @returns {string} The HTML string for the item.
 */
function createFileItem(file) {
    let iconPath = '';

    switch (file.type) {
        case 'folder':
            iconPath = 'icons/Photoroom_20250906_030821.png';
            break;
        case 'html':
        case 'css':
        case 'json':
            iconPath = 'icons/Photoroom_20250906_030640.png';
            break;
        case 'txt':
        case 'md':
        case 'pdf':
            iconPath = 'icons/Photoroom_20250906_030557.png';
            break;
        case 'js':
            iconPath = 'icons/Photoroom_20250906_030622.png';
            break;
        default:
            iconPath = 'icons/Photoroom_20250906_030640.png'; // Default to a generic file icon
            break;
    }

    return `
        <div class="file-item">
            <div class="file-icon-wrapper">
                <img src="${iconPath}" alt="${file.type} file icon" class="file-icon-img">
            </div>
            <p class="file-name">${file.name}</p>
            <p class="file-meta">${file.meta}</p>
        </div>
    `;
}

