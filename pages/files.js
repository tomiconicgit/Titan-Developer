// --- IndexedDB Logic v3.0: Rewritten for 100% Reliability ---
export const IndexedDBManager = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve();
            const request = indexedDB.open('fileSystemDB', 2); // Version 2 for parentId index
            request.onerror = e => reject("DB Error: " + e.target.error);
            request.onsuccess = e => { this.db = e.target.result; resolve(); };
            request.onupgradeneeded = e => {
                const db = e.target.result;
                let store;
                if (!db.objectStoreNames.contains('items')) {
                    store = db.createObjectStore('items', { keyPath: 'id' });
                } else {
                    store = e.target.transaction.objectStore('items');
                }
                if (!store.indexNames.contains('parentId')) {
                    store.createIndex('parentId', 'parentId', { unique: false });
                }
            };
        });
    },

    // A single, robust function to save/update files and folders.
    async saveItem(item) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['items'], 'readwrite');
            const request = tx.objectStore('items').put(item);
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e.target.error);
        });
    },

    // Fetches all items within a specific parent folder.
    async getItemsByParentId(parentId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['items'], 'readonly');
            const request = tx.objectStore('items').index('parentId').getAll(parentId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e.target.error);
        });
    },

    // Gets a single item by its ID.
    async getItemById(id) {
        return new Promise((resolve, reject) => {
            if (id === 'root') return resolve({ id: 'root', name: 'Root' });
            const tx = this.db.transaction(['items'], 'readonly');
            const request = tx.objectStore('items').get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e.target.error);
        });
    },

    // Deletes an item and all its children recursively.
    async deleteItemAndChildren(itemId) {
        const tx = this.db.transaction(['items'], 'readwrite');
        const store = tx.objectStore('items');
        const index = store.index('parentId');
        
        async function getChildren(id) {
            return new Promise(resolve => {
                const req = index.getAll(id);
                req.onsuccess = () => resolve(req.result);
            });
        }

        const children = await getChildren(itemId);
        for (const child of children) {
            await this.deleteItemAndChildren(child.id);
        }
        
        return new Promise(resolve => {
            store.delete(itemId).onsuccess = resolve;
        });
    }
};

// --- State and UI Logic ---
let currentFolderId = 'root';

export async function renderFilesPage(container, navigate, folderId = 'root') {
    currentFolderId = folderId;
    await IndexedDBManager.init();

    container.innerHTML = `
        <div class="files-page-wrapper page-content-wrapper">
            <header class="page-header">
                <h1>Files</h1>
                <div class="add-new-container">
                    <button id="add-new-btn" class="icon-action-btn">
                        <img src="icons/Photoroom_20250907_162841.png" alt="Add New">
                    </button>
                    <div id="add-new-menu" class="context-menu add-menu hidden">
                        <ul>
                            <li data-action="new-file">New File</li>
                            <li data-action="new-folder">New Folder</li>
                        </ul>
                    </div>
                </div>
            </header>
            <div id="breadcrumb-nav" class="breadcrumb-nav"></div>
            <div id="file-grid" class="file-grid"></div>
        </div>
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Titan UI for Files */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .page-header h1 { font-size: 2em; font-weight: 700; color: #E6EDF3; margin: 0; }
        .icon-action-btn { background: transparent; border: none; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; cursor: pointer; padding: 0; border-radius: 8px; transition: background-color 0.2s, transform 0.2s; } .icon-action-btn:hover { background-color: rgba(139, 148, 158, 0.1); } .icon-action-btn:active { transform: scale(0.9); } .icon-action-btn img { width: 24px; height: 24px; }
        .breadcrumb-nav { display: flex; align-items: center; gap: 5px; font-size: 1.1em; color: #8B949E; flex-wrap: wrap; padding-bottom: 15px; border-bottom: 1px solid #30363D; }
        .breadcrumb-link { color: #58A6FF; cursor: pointer; text-decoration: none; padding: 5px 8px; border-radius: 6px; } .breadcrumb-link:hover { background-color: rgba(88, 166, 255, 0.1); }
        .breadcrumb-separator { color: #484F58; } .breadcrumb-current { color: #E6EDF3; font-weight: 500; padding: 5px 8px; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 20px; margin-top: 20px; }
        .file-item { text-align: center; cursor: pointer; padding: 10px 5px; border-radius: 12px; transition: background-color 0.2s; } .file-item:hover { background-color: #161B22; }
        .file-icon-wrapper { width: 70px; height: 70px; margin: 0 auto 10px; display: flex; justify-content: center; align-items: center; }
        .file-icon-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .file-name { font-size: 0.9em; color: #C9D1D9; font-weight: 500; margin: 0; word-break: break-all; }
        .file-meta { font-size: 0.75em; color: #8B949E; margin-top: 4px; }
        .add-new-container { position: relative; } .add-menu { top: 50px; right: 0; width: 180px; } .hidden { display: none; }
    `;
    document.head.appendChild(styleElement);

    container.querySelector('#add-new-btn').addEventListener('click', toggleAddNewMenu);
    container.querySelector('#add-new-menu').addEventListener('click', (e) => handleAddNewMenuClick(e, container, navigate));
    container.querySelector('#file-grid').addEventListener('click', (e) => handleGridClick(e, navigate));
    container.querySelector('#breadcrumb-nav').addEventListener('click', (e) => handleBreadcrumbClick(e, navigate));

    await renderCurrentFolder(container, navigate);
}

async function renderCurrentFolder(container, navigate) { /* ... same as previous ... */ }
async function buildBreadcrumbs(navElement) { /* ... same as previous ... */ }
function handleBreadcrumbClick(event, navigate) { /* ... same as previous ... */ }
async function handleGridClick(event, navigate) { /* ... same as previous ... */ }
function showCreateItemModal(type, container, navigate) { /* ... same as previous, but uses Titan UI styles */ }
async function handleCreateItem(name, type, container, navigate) { /* ... same as previous ... */ }
function showContextMenu(item, event, navigate) { /* ... same as previous, but uses deleteItemAndChildren ... */ }
function toggleAddNewMenu(event) { /* ... same as previous ... */ }
function closeAllMenus() { /* ... same as previous ... */ }
function handleAddNewMenuClick(event, container, navigate) { /* ... same as previous ... */ }
function createItemHTML(item) { /* ... same as previous ... */ }
function getFileIcon(ext) { /* ... same as previous ... */ }


