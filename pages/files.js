// --- IndexedDB Logic for Local-First Storage ---

const DB_NAME = 'fileSystemDB';
const DB_VERSION = 1;

/**
 * A manager for all IndexedDB interactions.
 */
const IndexedDBManager = {
    db: null,

    /**
     * Initializes the database and creates object stores if needed.
     */
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve();
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject("Error opening DB");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database initialised successfully.");
                resolve();
            };

            // This event is only fired when the version changes.
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create an object store for files. `id` is the key.
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'id', autoIncrement: false });
                }
                // Future stores for folders, analytics, etc., would be created here.
            };
        });
    },

    /**
     * Adds or updates a file in the 'files' object store.
     * @param {object} file The file object to save.
     */
    async saveFile(file) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.put(file);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Retrieves all files from the 'files' object store.
     */
    async getAllFiles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
};

// --- Debouncer for Cloud Syncing ---

let syncTimer;
const SYNC_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Triggers a sync process after a period of inactivity.
 */
function debouncedSync() {
    clearTimeout(syncTimer);
    console.log(`Change detected. Resetting ${SYNC_DELAY / 60000}-minute sync timer...`);
    syncTimer = setTimeout(() => {
        console.log("Timer finished. Starting sync process...");
        syncChangesToFirebase();
    }, SYNC_DELAY); 
}

/**
 * Placeholder for the function that will sync to the cloud.
 */
async function syncChangesToFirebase() {
    console.log("--- SYNCING TO FIREBASE (Placeholder) ---");
    // 1. Get all files from IndexedDB where needsSync is true.
    // 2. Send them to Firebase.
    // 3. On success, update their needsSync flag to false in IndexedDB.
    // We are not using alert() as it's bad practice in modern web apps.
    // A more subtle notification system would be used in a real app.
    console.log("Data would now be synced with Firebase!");
}


// --- Page Rendering Logic ---

/**
 * Renders the files page using data from IndexedDB.
 */
export async function renderFilesPage(container, navigate) {
    if (!container) {
        console.error("CRITICAL: The 'container' element is missing.");
        document.body.innerHTML = '<div style="color: red; font-size: 24px; padding: 50px;">Error: App container not found.</div>';
        return;
    }

    // Initialize the local database first
    await IndexedDBManager.init();

    // Static HTML and styles
    container.innerHTML = `
        <div class="files-page-wrapper">
            <div class="top-controls">
                <button id="add-file-btn" style="padding: 10px; border-radius: 12px; border: none; background: #007AFF; color: white; cursor: pointer;">+ New JS File</button>
                <div class="search-bar">
                     <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input" placeholder="Search...">
                </div>
            </div>
            <div class="file-grid"></div>
        </div>
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = `.files-page-wrapper { padding: 20px 15px; } .top-controls { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; } .search-bar { flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 10px 15px; background-color: rgba(30, 30, 30, 0.75); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(128, 128, 128, 0.2); border-radius: 12px; } .search-bar svg { width: 18px; height: 18px; fill: #d1d1d1; flex-shrink: 0; } .search-input { width: 100%; background: transparent; border: none; outline: none; color: var(--primary-text-color); font-size: 1em; } .file-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px 20px; } .file-item { text-align: center; } .file-icon-wrapper { width: 70px; height: 70px; margin: 0 auto 10px; display: flex; justify-content: center; align-items: center; } .file-icon-img { max-width: 100%; max-height: 100%; } .file-name { font-size: 0.85em; color: #e3e3e3; font-weight: 500; margin: 0; } .file-meta { font-size: 0.75em; color: #888; margin-top: 4px; }`;
    document.head.appendChild(styleElement);

    // Add event listener for the button
    container.querySelector('#add-file-btn').addEventListener('click', createNewFile);
    
    // Render the initial grid from local data
    await renderGridFromDB();
}

/**
 * Fetches all files from IndexedDB and renders the grid.
 */
async function renderGridFromDB() {
    const files = await IndexedDBManager.getAllFiles();
    const grid = document.querySelector('.file-grid');
    if (!grid) return;

    if (files.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1;">No local files found. Click "+ New JS File" to create one.</p>`;
    } else {
        grid.innerHTML = files.map(file => createFileItem(file)).join('');
    }
}

/**
 * Creates a new file, saves it to IndexedDB, and triggers a sync.
 */
async function createNewFile() {
    const newFile = {
        id: `file-${Date.now()}`, // Unique ID
        name: `new-script-${Math.floor(Math.random() * 100)}.js`,
        type: 'js',
        meta: new Date().toLocaleDateString(),
        content: '// Your new JavaScript file',
        needsSync: true // Mark for syncing
    };

    await IndexedDBManager.saveFile(newFile);
    console.log("New file saved to IndexedDB:", newFile);
    
    // Re-render the grid to show the new file
    await renderGridFromDB();

    // Start the sync timer
    debouncedSync();
}

/**
 * Generates the HTML string for a single file item.
 */
function createFileItem(file) {
    let iconPath = '';
    switch (file.type) {
        case 'folder': iconPath = 'icons/Photoroom_20250906_030913.png'; break;
        case 'html': case 'css': case 'json': iconPath = 'icons/Photoroom_20250906_030640.png'; break;
        case 'txt': case 'md': case 'pdf': iconPath = 'icons/Photoroom_20250906_030557.png'; break;
        case 'js': iconPath = 'icons/Photoroom_20250906_030622.png'; break;
        default: iconPath = 'icons/Photoroom_20250906_030640.png'; break;
    }
    return `<div class="file-item" data-id="${file.id}" data-type="${file.type}"><div class="file-icon-wrapper"><img src="${iconPath}" alt="${file.type} icon" class="file-icon-img"></div><p class="file-name">${file.name}</p><p class="file-meta">${file.meta}</p></div>`;
}


