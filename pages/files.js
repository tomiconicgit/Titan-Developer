// --- IndexedDB Logic for Local-First Storage ---
// (This object needs to be exported so app.js can use it)
export const IndexedDBManager = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve();
            const request = indexedDB.open('fileSystemDB', 1);
            request.onerror = e => reject("Error opening DB: " + e.target.error);
            request.onsuccess = e => { this.db = e.target.result; resolve(); };
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'id' });
                }
            };
        });
    },
    async saveFile(file) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files'], 'readwrite');
            const store = tx.objectStore('files');
            const request = store.put(file);
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e.target.error);
        });
    },
    async getAllFiles() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files'], 'readonly');
            const store = tx.objectStore('files');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e.target.error);
        });
    },
    async deleteFile(fileId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files'], 'readwrite');
            const store = tx.objectStore('files');
            const request = store.delete(fileId);
            request.onsuccess = () => resolve();
            request.onerror = e => reject(e.target.error);
        });
    }
};

// --- Debouncer for Cloud Syncing ---
let syncTimer;
const SYNC_DELAY = 10 * 60 * 1000;

function debouncedSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
        console.log("--- SYNCING TO FIREBASE (Placeholder) ---");
    }, SYNC_DELAY);
}

// --- Page Rendering and UI Logic ---
let currentFiles = [];

export async function renderFilesPage(container, navigate) {
    await IndexedDBManager.init();
    container.innerHTML = `
        <div class="files-page-wrapper">
            <div class="top-controls">
                <button id="add-file-btn" class="action-btn">+ New File</button>
                <div class="search-bar">
                     <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input" placeholder="Search...">
                </div>
            </div>
            <div class="file-grid"></div>
        </div>
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Main Page Styles */ .files-page-wrapper { padding: 20px 15px; } .top-controls { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; } .action-btn { padding: 10px 15px; border-radius: 12px; border: none; background: #007AFF; color: white; cursor: pointer; font-weight: 500; } .search-bar { flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 10px 15px; background-color: rgba(30, 30, 30, 0.75); backdrop-filter: blur(10px); border: 1px solid rgba(128, 128, 128, 0.2); border-radius: 12px; } .search-bar svg { width: 18px; height: 18px; fill: #d1d1d1; } .search-input { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-size: 1em; } .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 25px 20px; } .file-item { text-align: center; cursor: pointer; padding: 5px; border-radius: 8px; transition: background-color 0.2s; } .file-item:hover { background-color: rgba(255, 255, 255, 0.1); } .file-icon-wrapper { width: 70px; height: 70px; margin: 0 auto 10px; display: flex; justify-content: center; align-items: center; } .file-icon-img { max-width: 100%; max-height: 100%; object-fit: contain; } .file-name { font-size: 0.85em; color: #e3e3e3; font-weight: 500; margin: 0; word-break: break-all; } .file-meta { font-size: 0.75em; color: #888; margin-top: 4px; }
        /* Modal Styles */ .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); } .modal-content { background: #2c2c2e; padding: 25px; border-radius: 16px; width: 90%; max-width: 400px; text-align: center; border: 1px solid #444; } .modal-content h3 { margin-top: 0; margin-bottom: 20px; } .modal-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #555; background: #3a3a3c; color: white; font-size: 1em; margin-bottom: 20px; box-sizing: border-box; } .modal-actions { display: flex; gap: 10px; justify-content: flex-end; } .modal-btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; } .modal-btn.cancel { background: #555; color: white; } .modal-btn.create { background: #007AFF; color: white; }
        /* Context Menu Styles */ .context-menu { position: absolute; z-index: 1001; background: #3a3a3c; border-radius: 8px; overflow: hidden; border: 1px solid #555; box-shadow: 0 5px 15px rgba(0,0,0,0.3); } .context-menu ul { list-style: none; margin: 0; padding: 5px; } .context-menu li { padding: 10px 15px; cursor: pointer; color: #f0f0f0; } .context-menu li:hover { background-color: #007AFF; } .context-menu li.delete { color: #ff5555; } .context-menu li.delete:hover { background: #ff5555; color: white; }
    `;
    document.head.appendChild(styleElement);

    container.querySelector('#add-file-btn').addEventListener('click', () => showCreateFileModal(container));
    // Pass the navigate function to the grid click handler
    container.querySelector('.file-grid').addEventListener('click', (e) => handleGridClick(e, navigate));
    
    await renderGridFromDB(container);
}

async function renderGridFromDB(container) {
    currentFiles = await IndexedDBManager.getAllFiles();
    const grid = container.querySelector('.file-grid');
    if (!grid) return;

    if (currentFiles.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; color: #888;">No local files. Click "+ New File" to create one.</p>`;
    } else {
        grid.innerHTML = currentFiles.map(createFileItemHTML).join('');
    }
}

function handleGridClick(event, navigate) {
    const fileItem = event.target.closest('.file-item');
    closeContextMenu();
    if (fileItem) {
        event.preventDefault();
        const fileId = fileItem.dataset.id;
        const file = currentFiles.find(f => f.id === fileId);
        if (file) {
            showContextMenu(file, event.clientX, event.clientY, navigate);
        }
    }
}

function showCreateFileModal(container) {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Create New File</h3>
                <input type="text" id="new-filename-input" class="modal-input" placeholder="e.g., index.html, styles.css">
                <div class="modal-actions">
                    <button class="modal-btn cancel">Cancel</button>
                    <button class="modal-btn create">Create</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const overlay = document.querySelector('.modal-overlay');
    const input = document.getElementById('new-filename-input');
    const closeModal = () => overlay.remove();
    overlay.querySelector('.cancel').addEventListener('click', closeModal);
    overlay.querySelector('.create').addEventListener('click', async () => {
        await handleCreateFile(input.value, container);
        closeModal();
    });
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
    input.focus();
}

async function handleCreateFile(filename, container) {
    if (!filename || !filename.includes('.')) {
        console.error("Invalid filename. Must include an extension.");
        return;
    }
    const name = filename;
    const type = name.split('.').pop();
    const newFile = {
        id: `file-${Date.now()}`,
        name: name,
        type: type,
        meta: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        content: ``,
        needsSync: true
    };
    await IndexedDBManager.saveFile(newFile);
    await renderGridFromDB(container);
    debouncedSync();
}

function showContextMenu(file, x, y, navigate) {
    const menuHTML = `
        <div class="context-menu" style="top: ${y}px; left: ${x}px;">
            <ul>
                <li data-action="edit">Code Editor</li>
                <li data-action="rename">Rename</li>
                <li data-action="duplicate">Duplicate</li>
                <li data-action="move">Move</li>
                <li data-action="delete" class="delete">Delete</li>
            </ul>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    const menu = document.querySelector('.context-menu');
    
    menu.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        const appContainer = document.querySelector('.files-page-wrapper').parentElement;
        closeContextMenu();

        switch (action) {
            // --- THIS IS THE MOST IMPORTANT CHANGE ---
            case 'edit':
                // --- DEBUGGING: Confirm the edit action is firing ---
                console.log('Edit action triggered for:', file.name);
                navigate('editor', file); 
                break;
            case 'delete': 
                await IndexedDBManager.deleteFile(file.id);
                await renderGridFromDB(appContainer);
                break;
            // Placeholders for other actions
            case 'rename': console.log("Rename action for:", file.name); break;
            case 'duplicate': console.log("Duplicate action for:", file.name); break;
            case 'move': console.log("Move action for:", file.name); break;
        }
    });

    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    }, 0);
}

function closeContextMenu() {
    const menu = document.querySelector('.context-menu');
    if (menu) menu.remove();
}

function createFileItemHTML(file) {
    let iconPath = 'icons/Photoroom_20250906_030640.png'; // Default
    switch (file.type) {
        case 'folder': iconPath = 'icons/Photoroom_20250906_030913.png'; break;
        case 'html': case 'svg': iconPath = 'icons/Photoroom_20250906_030640.png'; break;
        case 'css': iconPath = 'icons/css-icon.png'; break; // Using a more specific icon for example
        case 'json': iconPath = 'icons/json-icon.png'; break;
        case 'txt': case 'md': case 'pdf': iconPath = 'icons/Photoroom_20250906_030557.png'; break;
        case 'js': iconPath = 'icons/Photoroom_20250906_030622.png'; break;
    }
    return `<div class="file-item" data-id="${file.id}" data-type="${file.type}">
                <div class="file-icon-wrapper"><img src="${iconPath}" alt="${file.type} icon" class="file-icon-img"></div>
                <p class="file-name">${file.name}</p>
                <p class="file-meta">${file.meta}</p>
            </div>`;
}


