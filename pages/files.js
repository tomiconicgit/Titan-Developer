/**
 * Renders the File Manager page, redesigned to fix layout and match new visuals.
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

        /* --- REVISED CONTAINER AND ICON STYLING --- */
        .file-icon-wrapper {
            position: relative;
            /* This is the key fix: aspect-ratio on the container */
            aspect-ratio: 1 / 1;
            margin-bottom: 10px;
            
            /* Glassmorphic Style */
            background-color: rgba(30, 30, 30, 0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 18px;

            /* Black Drop Shadow */
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

            /* Center the icon inside */
            display: flex;
            justify-content: center;
            align-items: center;

            /* Padding shrinks the icon inside the container */
            padding: 22%;
        }

        .file-icon-base {
            width: 100%;
            height: 100%;
        }
        
        .file-type-label {
            position: absolute;
            bottom: 22%;
            left: 10%;
            right: 10%;
            padding: 3px 0;
            border-radius: 4px;
            font-size: 1.1em;
            font-weight: 600;
            color: white;
            text-transform: uppercase;
        }
        
        .label-js { background-color: #F0A500; }
        .label-html { background-color: #E34F26; }
        .label-css { background-color: #1572B6; }
        .label-txt { background-color: #8A2BE2; }
        .label-json { background-color: #5E5E5E; }
        .label-default { background-color: #6c757d; }

        .file-name {
            font-size: 0.8em;
            color: #e3e3e3;
            font-weight: 500;
            margin: 0;
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

function createFileItem(file) {
    const baseFileIcon = `<svg class="file-icon-base" viewBox="0 0 80 100" fill="#E0E0E0"><path d="M65 0H15C6.7 0 0 6.7 0 15v70C0 93.3 6.7 100 15 100h50c8.3 0 15-6.7 15-15V25L55 0z"/></svg>`;
    const folderIcon = `<svg class="file-icon-base" viewBox="0 0 96 96" fill="#1E88E5"><path d="M82.3 27.8H48.8L39.3 16H13.7C9.5 16 6 19.5 6 23.7V77.3C6 81.5 9.5 85 13.7 85H82.3c4.2 0 7.7-3.5 7.7-7.7V35.5c0-4.2-3.5-7.7-7.7-7.7z"/></svg>`;

    let iconHtml = '';
    
    if (file.type === 'folder') {
        iconHtml = folderIcon;
    } else {
        const fileTypes = {
            js: { label: 'js', class: 'label-js' },
            html: { label: 'html', class: 'label-html' },
            css: { label: 'css', class: 'label-css' },
            txt: { label: 'txt', class: 'label-txt' },
            json: { label: 'json', class: 'label-json' },
        };
        const typeInfo = fileTypes[file.type] || { label: file.type, class: 'label-default' };

        iconHtml = `
            ${baseFileIcon}
            <div class="file-type-label ${typeInfo.class}">
                ${typeInfo.label}
            </div>
        `;
    }

    return `
        <div class="file-item">
            <div class="file-icon-wrapper">
                ${iconHtml}
            </div>
            <p class="file-name">${file.name}</p>
            <p class="file-meta">${file.meta}</p>
        </div>
    `;
}


