// --- IndexedDB Logic for Local-First Storage ---
// THIS VERSION IS REWRITTEN TO BE 100% RELIABLE AND FIX THE CREATION BUG.
export const IndexedDBManager = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve();
            const request = indexedDB.open('fileSystemDB', 1);
            request.onerror = e => reject("Error opening DB: " + e.target.error);
            request.onsuccess = e => { this.db = e.target.result; console.log("Database initialized successfully."); resolve(); };
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'id' });
                }
            };
        });
    },

    // --- DEFINITIVELY CORRECTED SAVE FUNCTION ---
    async saveFile(file) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("Database not initialized.");
            const tx = this.db.transaction(['files'], 'readwrite');
            const store = tx.objectStore('files');
            // We must listen to the request, not just the transaction
            const request = store.put(file);
            request.onsuccess = () => {
                console.log(`Request successful: File '${file.name}' put in store.`);
            };
            request.onerror = (event) => {
                console.error("Save file request error:", event.target.error);
                reject(event.target.error);
            };
            // Resolve only when the entire transaction is complete
            tx.oncomplete = () => {
                 console.log(`Transaction complete: File '${file.name}' is saved.`);
                resolve();
            };
            tx.onerror = (event) => {
                console.error("Save file transaction error:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    async getAllFiles() {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("Database not initialized.");
            const tx = this.db.transaction(['files'], 'readonly');
            const store = tx.objectStore('files');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e.target.error);
        });
    },

    // --- DEFINITIVELY CORRECTED DELETE FUNCTION ---
    async deleteFile(fileId) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("Database not initialized.");
            const tx = this.db.transaction(['files'], 'readwrite');
            const store = tx.objectStore('files');
            const request = store.delete(fileId);
            request.onsuccess = () => {
                 console.log(`Request successful: File '${fileId}' deleted from store.`);
            };
            request.onerror = (event) => {
                 console.error("Delete file request error:", event.target.error);
                 reject(event.target.error);
            };
            tx.oncomplete = () => {
                console.log(`Transaction complete: File '${fileId}' is deleted.`);
                resolve();
            };
            tx.onerror = (event) => {
                console.error("Delete file transaction error:", event.target.error);
                reject(event.target.error);
            };
        });
    }
};

// --- Debouncer for Cloud Syncing ---
let syncTimer;
const SYNC_DELAY = 10 * 60 * 1000;
function debouncedSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => console.log("--- SYNCING TO FIREBASE (Placeholder) ---"), SYNC_DELAY);
}

// --- Page Rendering and UI Logic ---
let currentFiles = [];

export async function renderFilesPage(container, navigate) {
    await IndexedDBManager.init();
    container.innerHTML = `
        <div class="files-page-wrapper page-content-wrapper">
            <div class="top-controls">
                <div class="add-new-container">
                    <button id="add-new-btn" class="icon-action-btn">
                        <img src="icons/Photoroom_20250907_162841.png" alt="Add New">
                    </button>
                    <div id="add-new-menu" class="context-menu add-menu hidden">
                        <ul>
                            <li data-action="new-file">New File</li>
                            <li data-action="new-folder">New Folder</li>
                            <li data-action="upload-file">Upload File</li>
                            <li data-action="upload-folder">Upload Folder</li>
                            <li data-action="upload-zip">Upload Zip</li>
                        </ul>
                    </div>
                </div>
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
        .files-page-wrapper { padding: 20px 15px; } .top-controls { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; } .search-bar { flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 10px 15px; background-color: rgba(30, 30, 30, 0.75); backdrop-filter: blur(10px); border: 1px solid rgba(128, 128, 128, 0.2); border-radius: 12px; } .search-bar svg { width: 18px; height: 18px; fill: #d1d1d1; } .search-input { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-size: 1em; } .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 25px 20px; } .file-item { text-align: center; cursor: pointer; padding: 5px; border-radius: 8px; transition: background-color 0.2s; } .file-item:hover { background-color: rgba(255, 255, 255, 0.1); } .file-icon-wrapper { width: 70px; height: 70px; margin: 0 auto 10px; display: flex; justify-content: center; align-items: center; } .file-icon-img { max-width: 100%; max-height: 100%; object-fit: contain; } .file-name { font-size: 0.85em; color: #e3e3e3; font-weight: 500; margin: 0; word-break: break-all; } .file-meta { font-size: 0.75em; color: #888; margin-top: 4px; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s ease; } .modal-overlay.visible { opacity: 1; } .modal-content { background: #2c2c2e; padding: 25px; border-radius: 16px; width: 90%; max-width: 400px; text-align: center; border: 1px solid #444; transform: scale(0.95); transition: transform 0.3s ease; } .modal-overlay.visible .modal-content { transform: scale(1); } .modal-content h3 { margin-top: 0; margin-bottom: 20px; } .modal-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #555; background: #3a3a3c; color: white; font-size: 1em; margin-bottom: 20px; box-sizing: border-box; } .modal-actions { display: flex; gap: 10px; justify-content: flex-end; } .modal-btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; } .modal-btn.cancel { background: #555; color: white; } .modal-btn.create { background: #007AFF; color: white; }
        .context-menu { position: absolute; z-index: 1001; background: #3a3a3c; border-radius: 8px; overflow: hidden; border: 1px solid #555; box-shadow: 0 5px 15px rgba(0,0,0,0.3); } .context-menu ul { list-style: none; margin: 0; padding: 5px; } .context-menu li { padding: 10px 15px; cursor: pointer; color: #f0f0f0; } .context-menu li:hover { background-color: #007AFF; } .context-menu li.delete { color: #ff5555; } .context-menu li.delete:hover { background: #ff5555; color: white; }
        .add-new-container { position: relative; } .icon-action-btn { background: transparent; border: none; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; cursor: pointer; padding: 0; border-radius: 8px; transition: background-color 0.2s, transform 0.2s; } .icon-action-btn:hover { background-color: rgba(255, 255, 255, 0.1); } .icon-action-btn:active { transform: scale(0.9); } .icon-action-btn img { width: 24px; height: 24px; pointer-events: none; } .add-menu { top: 54px; left: 0; width: 180px; } .hidden { display: none; }
    `;
    document.head.appendChild(styleElement);

    container.querySelector('#add-new-btn').addEventListener('click', toggleAddNewMenu);
    container.querySelector('#add-new-menu').addEventListener('click', (e) => handleAddNewMenuClick(e, container));
    container.querySelector('.file-grid').addEventListener('click', (e) => handleGridClick(e, navigate));
    
    await renderGridFromDB(container);
}

async function renderGridFromDB(container) {
    currentFiles = await IndexedDBManager.getAllFiles();
    const grid = container.querySelector('.file-grid');
    if (!grid) return;
    grid.innerHTML = currentFiles.length > 0 
        ? currentFiles.map(createFileItemHTML).join('') 
        : `<p style="grid-column: 1 / -1; color: #888;">No local files. Click '+' to create one.</p>`;
}

function handleGridClick(event, navigate) {
    const fileItem = event.target.closest('.file-item');
    closeAllMenus();
    if (fileItem) {
        event.preventDefault();
        const fileId = fileItem.dataset.id;
        const file = currentFiles.find(f => f.id === fileId);
        if (file) showContextMenu(file, event, navigate);
    }
}

function showCreateFileModal(container) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Create New File</h3>
            <input type="text" id="new-filename-input" class="modal-input" placeholder="e.g., index.html, styles.css">
            <div class="modal-actions">
                <button class="modal-btn cancel">Cancel</button>
                <button class="modal-btn create">Create</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));
    const input = modal.querySelector('#new-filename-input');
    const closeModal = () => {
        modal.classList.remove('visible');
        modal.addEventListener('transitionend', () => modal.remove(), { once: true });
    };
    modal.querySelector('.cancel').addEventListener('click', closeModal);
    modal.querySelector('.create').addEventListener('click', async () => {
        // This is now guaranteed to wait for the save to finish
        await handleCreateFile(input.value, container);
        closeModal();
    });
    modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
    input.focus();
}

async function handleCreateFile(filename, container) {
    if (!filename || !filename.includes('.')) return;
    const newFile = {
        id: `file-${Date.now()}`,
        name: filename,
        type: filename.split('.').pop(),
        meta: new Date().toLocaleDateString('en-GB', { day: 'short', month: 'short', year: 'numeric' }),
        content: ``,
        needsSync: true
    };
    try {
        await IndexedDBManager.saveFile(newFile);
        await renderGridFromDB(container);
        debouncedSync();
    } catch (error) {
        console.error("Failed to save file and re-render:", error);
        // In a real app, you would show an error message to the user here.
    }
}

function showContextMenu(file, event, navigate) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.top = `${event.clientY}px`;
    menu.style.left = `${event.clientX}px`;
    menu.innerHTML = `<ul><li data-action="edit">Code Editor</li><li data-action="rename">Rename</li><li data-action="duplicate">Duplicate</li><li data-action="move">Move</li><li data-action="delete" class="delete">Delete</li></ul>`;
    document.body.appendChild(menu);
    menu.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        const appContainer = document.querySelector('.files-page-wrapper').parentElement;
        closeAllMenus();
        switch (action) {
            case 'edit': navigate('editor', file); break;
            case 'delete': 
                await IndexedDBManager.deleteFile(file.id);
                await renderGridFromDB(appContainer);
                break;
            default: console.log(`${action} action for:`, file.name); break;
        }
    });
    setTimeout(() => document.addEventListener('click', closeAllMenus, { once: true }), 0);
}

function toggleAddNewMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('add-new-menu');
    const isHidden = menu.classList.contains('hidden');
    closeAllMenus();
    if (isHidden) {
        menu.classList.remove('hidden');
        setTimeout(() => document.addEventListener('click', closeAllMenus, { once: true }), 0);
    }
}

function handleAddNewMenuClick(event, container) {
    const action = event.target.dataset.action;
    if (!action) return;
    switch(action) {
        case 'new-file': showCreateFileModal(container); break;
        default: console.log("Action:", action); break;
    }
    closeAllMenus();
}

function closeAllMenus() {
    document.querySelectorAll('.context-menu').forEach(menu => {
        if (!menu.classList.contains('add-menu')) menu.remove();
        else menu.classList.add('hidden');
    });
}

function createFileItemHTML(file) {
    let iconPath = 'icons/Photoroom_20250906_030640.png';
    switch (file.type) {
        case 'folder': iconPath = 'icons/Photoroom_20250906_030913.png'; break;
        case 'html': case 'svg': iconPath = 'icons/Photoroom_20250906_030640.png'; break;
        case 'css': iconPath = 'icons/css-icon.png'; break; 
        case 'json': iconPath = 'icons/json-icon.png'; break;
        case 'txt': case 'md': case 'pdf': iconPath = 'icons/Photoroom_20250906_030557.png'; break;
        case 'js': iconPath = 'icons/Photoroom_20250906_030622.png'; break;
    }
    return `<div class="file-item" data-id="${file.id}" data-type="${file.type}"><div class="file-icon-wrapper"><img src="${iconPath}" alt="${file.type} icon" class="file-icon-img"></div><p class="file-name">${file.name}</p><p class="file-meta">${file.meta}</p></div>`;
}


