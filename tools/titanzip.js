/**
 * This is a self-contained module for the Titan Zip tool.
 * It includes the core unzipping logic, the component styles,
 * and the function to render the UI.
 */

// A list of common text file extensions.
const TEXT_EXTENSIONS = ['.js', '.html', '.css', '.json', '.txt', '.md', '.py', '.java', '.xml'];

function isTextFile(path) {
    return TEXT_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext));
}

/**
 * The core class for handling ZIP file processing.
 */
class TitanZip {
    async unzipAndAnalyze(file, onProgress) {
        if (!file) throw new Error("No file provided.");
        const zip = new JSZip();
        await zip.loadAsync(file);
        const fileEntries = Object.values(zip.files).filter(entry => !entry.dir);
        const fileCount = fileEntries.length;
        let processedCount = 0;

        const promises = fileEntries.map(async (zipEntry) => {
            const type = isTextFile(zipEntry.name) ? 'text' : 'binary';
            const content = type === 'text' ? await zipEntry.async("string") : null;
            processedCount++;
            if (onProgress) onProgress((processedCount / fileCount) * 100);
            return { path: zipEntry.name, content, type };
        });

        const allFiles = await Promise.all(promises);
        const tree = {};
        allFiles.forEach(f => {
            const parts = f.path.split('/').filter(p => p);
            let currentNode = tree;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!currentNode[part]) currentNode[part] = {};
                currentNode = currentNode[part];
            }
            currentNode[parts[parts.length - 1]] = f;
        });
        return this.#buildTreeText(tree);
    }

    #buildTreeText(node, indent = '') {
        let text = '';
        const entries = Object.entries(node).sort((a, b) => {
            const aIsFolder = typeof a[1] === 'object' && !a[1].path;
            const bIsFolder = typeof b[1] === 'object' && !b[1].path;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a[0].localeCompare(b[0]);
        });
        for (const [key, value] of entries) {
            const isFolder = typeof value === 'object' && !value.path;
            text += `${indent}📁 ${key}${isFolder ? '/' : ''}\n`;
            if (isFolder) {
                text += this.#buildTreeText(value, indent + '  ');
            } else {
                if (value.type === 'text' && value.content) {
                    text += `${indent}  --------------------\n`;
                    value.content.split('\n').forEach(line => {
                        text += `${indent}  | ${line}\n`;
                    });
                    text += `${indent}  --------------------\n`;
                } else {
                    text += `${indent}  (Binary File)\n`;
                }
            }
        }
        return text;
    }
}

/**
 * --- THIS IS THE EXPORTED RENDER FUNCTION ---
 * It builds the UI for the Titan Zip tool.
 * @param {HTMLElement} container - The DOM element to render the tool into.
 */
export function renderTitanZipPage(container) {
    const titanZipStyles = `
        .tz-container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .tz-h1 { font-size: 1.8em; font-weight: 600; text-align: center; color: var(--primary-text-color); }
        .tz-input[type="file"] { display: none; }
        .tz-label { display: block; padding: 15px 20px; background-color: var(--surface-color); border: 2px dashed var(--border-color); border-radius: 12px; text-align: center; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; font-weight: 500; }
        .tz-label:hover { background-color: #2a2a2a; border-color: var(--accent-color); }
        .tz-button { padding: 15px; font-size: 1em; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; transition: opacity 0.2s; }
        .tz-button:hover { opacity: 0.85; }
        #tz-process { background-color: var(--accent-color); color: white; }
        #tz-copy { background-color: var(--surface-color); color: var(--accent-color); }
        #tz-progress { width: 100%; background-color: var(--surface-color); border-radius: 8px; overflow: hidden; display: none; }
        #tz-progress-bar { width: 0; height: 10px; background-color: var(--accent-color); transition: width 0.3s ease-in-out; }
        #tz-output { background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; flex-grow: 1; min-height: 200px; overflow: auto; white-space: pre; word-wrap: break-word; font-family: "Menlo", "Consolas", "Courier New", monospace; font-size: 0.85em; line-height: 1.5; color: var(--secondary-text-color); }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = titanZipStyles;
    document.head.appendChild(styleElement);

    container.innerHTML = `
        <div class="tz-container">
            <h1 class="tz-h1">Titan Zip</h1>
            <label for="tz-upload" class="tz-label">Choose a .zip file</label>
            <input type="file" id="tz-upload" class="tz-input" accept=".zip">
            <button id="tz-process" class="tz-button">Unzip and Analyze</button>
            <div id="tz-progress"><div id="tz-progress-bar"></div></div>
            <div id="tz-output">Your file structure will appear here...</div>
            <button id="tz-copy" class="tz-button">Copy All</button>
        </div>
    `;

    let selectedFile = null;
    const uploadInput = container.querySelector('#tz-upload');
    const uploadLabel = container.querySelector('.tz-label');
    const processBtn = container.querySelector('#tz-process');
    const copyBtn = container.querySelector('#tz-copy');
    const outputDiv = container.querySelector('#tz-output');
    const progressDiv = container.querySelector('#tz-progress');
    const progressBar = container.querySelector('#tz-progress-bar');
    
    uploadInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        uploadLabel.textContent = selectedFile ? selectedFile.name : 'Choose a .zip file';
        uploadLabel.style.borderColor = selectedFile ? 'var(--accent-color)' : 'var(--border-color)';
    });

    processBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Please select a ZIP file first.');
            return;
        }
        outputDiv.textContent = 'Processing...';
        progressDiv.style.display = 'block';
        progressBar.style.width = '0%';
        const zipper = new TitanZip();
        try {
            const onProgress = (percent) => { progressBar.style.width = `${percent}%`; };
            const treeText = await zipper.unzipAndAnalyze(selectedFile, onProgress);
            outputDiv.textContent = treeText;
        } catch (error) {
            outputDiv.textContent = 'Error processing ZIP: ' + error.message;
        } finally {
            setTimeout(() => {
                progressDiv.style.display = 'none';
                progressBar.style.width = '0%';
            }, 500);
        }
    });

    copyBtn.addEventListener('click', () => {
        if (outputDiv.textContent && outputDiv.textContent !== 'Your file structure will appear here...') {
            navigator.clipboard.writeText(outputDiv.textContent)
                .then(() => alert('Content copied to clipboard!'))
                .catch(err => alert('Failed to copy: ' + err));
        } else {
            alert('Nothing to copy yet!');
        }
    });
}


