// --- STATE MANAGEMENT ---
// Mock data is now the state. It's given unique IDs and placed at the top level.
let files = [
    { id: 'item-1', name: 'Project Assets', type: 'folder', meta: '12 items' },
    { id: 'item-2', name: 'index.html', type: 'html', meta: 'Sep 5, 2025' },
    { id: 'item-3', name: 'manifest.json', type: 'json', meta: 'Sep 5, 2025' },
    { id: 'item-4', name: 'styles.css', type: 'css', meta: 'Sep 4, 2025' },
    { id: 'item-5', name: 'app.js', type: 'js', meta: 'Sep 5, 2025' },
    { id: 'item-6', name: 'notes.txt', type: 'txt', meta: 'Aug 30, 2025' },
    { id: 'item-7', name: 'design.pdf', type: 'pdf', meta: 'Aug 29, 2025' },
    { id: 'item-8', name: 'README.md', type: 'md', meta: 'Aug 28, 2025' },
];

/**
 * Main entry point for rendering the File Manager page.
 * Sets up the static elements and performs the initial grid render.
 */
export function renderFilesPage(container, navigate) {
    const filesPageStyles = `
        /* ... existing styles ... */
        .files-page-wrapper { padding: 20px 15px; }
        .top-controls { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; }
        .search-bar { flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 10px 15px; background-color: rgba(30, 30, 30, 0.75); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(128, 128, 128, 0.2); border-radius: 12px; }
        .search-bar svg { width: 18px; height: 18px; fill: #d1d1d1; flex-shrink: 0; }
        .search-input { width: 100%; background: transparent; border: none; outline: none; color: var(--primary-text-color); font-size: 1em; }
        .filter-button { padding: 10px; border-radius: 12px; background-color: rgba(30, 30, 30, 0.75); border: 1px solid rgba(128, 128, 128, 0.2); cursor: pointer; }
        .filter-button svg { width: 22px; height: 22px; fill: #d1d1d1; }
        .file-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px 20px; }
        .file-item { text-align: center; transition: transform 0.2s ease-out; }
        .file-icon-wrapper { position: relative; width: 70px; height: 70px; margin: 0 auto 10px auto; display: flex; justify-content: center; align-items: center; }
        .file-icon-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .no-save { pointer-events: none; -webkit-user-select: none; user-select: none; }
        .file-name { font-size: 0.85em; color: #e3e3e3; font-weight: 500; margin: 0; word-break: break-word; }
        .file-meta { font-size: 0.75em; color: var(--secondary-text-color); margin-top: 4px; }
        
        /* --- DRAG & DROP VISUAL FEEDBACK STYLES --- */
        .file-item.dragging {
            opacity: 0.4;
            transform: scale(0.9);
        }
        .file-item[data-type="folder"].drag-over {
            transform: scale(1.05);
            background-color: rgba(0, 122, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 0 15px rgba(0, 122, 255, 0.5);
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
            <div class="file-grid"></div>
        </div>
    `;

    // Initial render of the grid
    renderGrid();
}

/**
 * Renders the file grid based on the current `files` state and attaches listeners.
 */
function renderGrid() {
    const grid = document.querySelector('.file-grid');
    if (!grid) return;

    grid.innerHTML = files.map(file => createFileItem(file)).join('');
    attachDragListeners();
}

/**
 * Attaches all necessary drag-and-drop event listeners to the grid items.
 */
function attachDragListeners() {
    const items = document.querySelectorAll('.file-item');
    
    items.forEach(item => {
        // Only files can be dragged
        if (item.dataset.type !== 'folder') {
            item.addEventListener('dragstart', handleDragStart);
        }
        item.addEventListener('dragend', handleDragEnd);

        // Only folders can be drop targets
        if (item.dataset.type === 'folder') {
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
        }
    });
}

// --- DRAG & DROP EVENT HANDLERS ---

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    // Use a timeout to allow the browser to render the drag image before applying the class
    setTimeout(() => {
        e.target.classList.add('dragging');
    }, 0);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault(); // This is necessary to allow a drop.
}

function handleDragEnter(e) {
    e.preventDefault();
    if (e.target.closest('.file-item').dataset.type === 'folder') {
        e.target.closest('.file-item').classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.closest('.file-item').dataset.type === 'folder') {
        e.target.closest('.file-item').classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest('.file-item');
    dropTarget.classList.remove('drag-over');

    const draggedItemId = e.dataTransfer.getData('text/plain');
    const targetFolderId = dropTarget.dataset.id;

    // Find the folder and update its item count
    const targetFolder = files.find(f => f.id === targetFolderId);
    if (targetFolder) {
        let currentCount = parseInt(targetFolder.meta) || 0;
        currentCount++;
        targetFolder.meta = `${currentCount} items`;
    }

    // Remove the dragged item from the state
    files = files.filter(file => file.id !== draggedItemId);

    // Re-render the entire grid with the new state
    renderGrid();
}

/**
 * Generates the HTML for a single file or folder item, now including data attributes.
 */
function createFileItem(file) {
    let iconPath = '';
    // ... (rest of the switch statement is the same)
    switch (file.type) {
        case 'folder': iconPath = 'icons/Photoroom_20250906_030821.png'; break;
        case 'html': case 'css': case 'json': iconPath = 'icons/Photoroom_20250906_030640.png'; break;
        case 'txt': case 'md': case 'pdf': iconPath = 'icons/Photoroom_20250906_030557.png'; break;
        case 'js': iconPath = 'icons/Photoroom_20250906_030622.png'; break;
        default: iconPath = 'icons/Photoroom_20250906_030640.png'; break;
    }

    return `
        <div class="file-item" draggable="${file.type !== 'folder'}" data-id="${file.id}" data-type="${file.type}">
            <div class="file-icon-wrapper">
                <img src="${iconPath}" alt="${file.type} icon" class="file-icon-img no-save">
            </div>
            <p class="file-name">${file.name}</p>
            <p class="file-meta">${file.meta}</p>
        </div>
    `;
}


