// Import Firestore functions and our user ID getter
import { db, getCurrentUserId } from '../firebase-config.js';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// This will hold the live file data from Firestore
let files = [];
let currentUserId = null;

/**
 * Main function to render the files page. Now it's async to fetch data.
 */
export async function renderFilesPage(container, navigate) {
    currentUserId = await getCurrentUserId();
    
    // Static HTML and styles
    container.innerHTML = `
        <div class="files-page-wrapper">
            <div class="top-controls">
                <!-- Add New File button for testing -->
                <button id="add-file-btn" style="padding: 10px; border-radius: 12px; border: none; background: #007AFF; color: white; cursor: pointer;">+ New</button>
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
        .files-page-wrapper { padding: 20px 15px; } .top-controls { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; } .search-bar { flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 10px 15px; background-color: rgba(30, 30, 30, 0.75); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(128, 128, 128, 0.2); border-radius: 12px; } .search-bar svg { width: 18px; height: 18px; fill: #d1d1d1; flex-shrink: 0; } .search-input { width: 100%; background: transparent; border: none; outline: none; color: var(--primary-text-color); font-size: 1em; } .file-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px 20px; } .file-item { text-align: center; transition: transform 0.2s ease-out; } .file-icon-wrapper { position: relative; width: 70px; height: 70px; margin: 0 auto 10px auto; display: flex; justify-content: center; align-items: center; } .file-icon-img { max-width: 100%; max-height: 100%; object-fit: contain; } .no-save { pointer-events: none; -webkit-user-select: none; user-select: none; } .file-name { font-size: 0.85em; color: #e3e3e3; font-weight: 500; margin: 0; word-break: break-word; } .file-meta { font-size: 0.75em; color: var(--secondary-text-color); margin-top: 4px; } .file-item.dragging { opacity: 0.4; } .file-item[data-type="folder"].drag-over { transform: scale(1.05); background-color: rgba(0, 122, 255, 0.1); border-radius: 12px; }
    `;
    document.head.appendChild(styleElement);

    // Add listener for our new button
    container.querySelector('#add-file-btn').addEventListener('click', createNewFile);
    
    // Fetch initial data and render the grid
    await fetchFiles();
}

/**
 * Fetches the user's files from Firestore and triggers a re-render.
 */
async function fetchFiles() {
    try {
        currentUserId = await getCurrentUserId();
        const filesCollection = collection(db, `users/${currentUserId}/files`);
        const snapshot = await getDocs(filesCollection);
        files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGrid();
    } catch (error) {
        // If Firebase isn't configured, use mock data
        console.warn("Firebase not configured. Using mock data.");
        files = [
            { id: 'item-1', name: 'My Folder', type: 'folder', meta: '2 items' },
            { id: 'item-2', name: 'index.html', type: 'html', meta: 'Sep 5, 2025' },
            { id: 'item-5', name: 'app.js', type: 'js', meta: 'Sep 5, 2025' },
        ];
        renderGrid();
    }
}

/**
 * Renders the grid based on the current `files` array and attaches listeners.
 */
function renderGrid() {
    const grid = document.querySelector('.file-grid');
    if (!grid) return;
    if (files.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1;">No files yet. Click "+ New" to create one!</p>`;
    } else {
        grid.innerHTML = files.map(file => createFileItem(file)).join('');
        attachDragListeners();
    }
}

/**
 * Creates a new sample file in Firestore for testing.
 */
async function createNewFile() {
    try {
        currentUserId = await getCurrentUserId();
        const filesCollection = collection(db, `users/${currentUserId}/files`);
        const fileTypes = ['js', 'html', 'css', 'txt', 'folder'];
        const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        
        await addDoc(filesCollection, {
            name: `new-${randomType}`,
            type: randomType,
            meta: new Date().toLocaleDateString(),
            createdAt: serverTimestamp()
        });
        await fetchFiles();
    } catch (error) {
        alert("Firebase is not configured. Cannot create new file.");
        console.error("Error creating file:", error);
    }
}

/**
 * Handles dropping a file onto a folder.
 */
async function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest('.file-item');
    dropTarget.classList.remove('drag-over');

    const draggedItemId = e.dataTransfer.getData('text/plain');
    const targetFolderId = dropTarget.dataset.id;
    
    if (draggedItemId === targetFolderId || dropTarget.dataset.type !== 'folder') return;
    
    try {
        currentUserId = await getCurrentUserId();
        const fileToDeleteRef = doc(db, `users/${currentUserId}/files`, draggedItemId);
        await deleteDoc(fileToDeleteRef);
        await fetchFiles();
    } catch (error) {
        alert("Firebase is not configured. Drag-and-drop is disabled.");
        console.error("Error during drop:", error);
    }
}

/**
 * Attaches drag-and-drop event listeners to file items.
 */
function attachDragListeners() {
    const items = document.querySelectorAll('.file-item');
    items.forEach(item => {
        if (item.dataset.type !== 'folder') {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
                setTimeout(() => e.target.classList.add('dragging'), 0);
            });
        }
        item.addEventListener('dragend', (e) => e.target.classList.remove('dragging'));
        if (item.dataset.type === 'folder') {
            item.addEventListener('dragenter', (e) => { e.preventDefault(); e.target.closest('.file-item').classList.add('drag-over'); });
            item.addEventListener('dragover', (e) => e.preventDefault());
            item.addEventListener('dragleave', (e) => e.target.closest('.file-item').classList.remove('drag-over'));
            item.addEventListener('drop', handleDrop);
        }
    });
}

/**
 * Generates the HTML string for a single file item.
 * @param {object} file - The file data object.
 * @returns {string} - The HTML string for the file item.
 */
function createFileItem(file) {
    let iconPath = '';
    switch (file.type) {
        case 'folder':
            iconPath = 'icons/Photoroom_20250906_030913.png'; // The updated icon path
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
            iconPath = 'icons/Photoroom_20250906_030640.png';
            break;
    }
    return `<div class="file-item" draggable="${file.type !== 'folder'}" data-id="${file.id}" data-type="${file.type}"><div class="file-icon-wrapper"><img src="${iconPath}" alt="${file.type} icon" class="file-icon-img no-save"></div><p class="file-name">${file.name}</p><p class="file-meta">${file.meta}</p></div>`;
}

