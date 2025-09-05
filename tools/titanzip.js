// This class contains the core, non-UI logic for processing zip files.
class TitanZip {
    isTextFile(path) {
        const textExtensions = ['.js', '.html', '.css', '.json', '.txt', '.md', '.py', '.java', '.xml'];
        return textExtensions.some(ext => path.toLowerCase().endsWith(ext));
    }

    async unzipAndAnalyze(file, onProgress) {
        if (!file) throw new Error("A file must be selected.");
        
        const zip = await JSZip.loadAsync(file);
        const fileEntries = Object.values(zip.files).filter(entry => !entry.dir);
        const fileCount = fileEntries.length;
        let processedCount = 0;

        const allFiles = await Promise.all(
            fileEntries.map(async (zipEntry) => {
                const type = this.isTextFile(zipEntry.name) ? 'text' : 'binary';
                const content = type === 'text' ? await zipEntry.async("string") : null;
                
                processedCount++;
                if (onProgress) onProgress((processedCount / fileCount) * 100);

                return { path: zipEntry.name, content, type };
            })
        );

        const tree = {};
        allFiles.forEach(f => {
            let currentNode = tree;
            f.path.split('/').forEach((part, index, arr) => {
                if (index === arr.length - 1) {
                    currentNode[part] = f;
                } else {
                    currentNode[part] = currentNode[part] || {};
                    currentNode = currentNode[part];
                }
            });
        });

        return this.#buildTreeText(tree);
    }

    #buildTreeText(node, indent = '') {
        let text = '';
        const entries = Object.entries(node).sort(([keyA, valA], [keyB, valB]) => {
            const aIsFolder = !valA.path;
            const bIsFolder = !valB.path;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return keyA.localeCompare(keyB);
        });

        for (const [key, value] of entries) {
            const isFolder = !value.path;
            text += `${indent}${isFolder ? '📁' : '📄'} ${key}\n`;
            if (isFolder) {
                text += this.#buildTreeText(value, indent + '  ');
            } else if (value.type === 'text' && value.content) {
                const lines = value.content.split('\n').map(line => `${indent}  | ${line}`).join('\n');
                text += `${lines}\n`;
            }
        }
        return text;
    }
}


/**
 * Renders the TitanZip tool UI and functionality into a container.
 * The navigate function is no longer needed here as the navbar handles all navigation.
 * @param {HTMLElement} container - The DOM element to render the tool into.
 */
export function renderTitanZipTool(container) {
    const toolStyles = `
        .tool-container { padding: 20px 15px; display: flex; flex-direction: column; gap: 20px; max-width: 600px; margin: 0 auto; }
        h1 { font-size: 1.8em; font-weight: 600; text-align: center; }
        input[type="file"] { display: none; }
        .file-upload-label { display: block; padding: 15px 20px; background-color: var(--surface-color); border: 2px dashed var(--border-color); border-radius: 12px; text-align: center; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; font-weight: 500; }
        .file-upload-label:hover { background-color: #2a2a2a; border-color: var(--accent-color); }
        button { padding: 15px; font-size: 1em; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; transition: opacity 0.2s; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        #process { background-color: var(--accent-color); color: white; }
        #copy { background-color: var(--surface-color); color: var(--accent-color); }
        #progress { width: 100%; background-color: var(--surface-color); border-radius: 8px; overflow: hidden; display: none; height: 10px; }
        #progress-bar { width: 0; height: 100%; background-color: var(--accent-color); transition: width 0.3s ease-in-out; }
        #output { background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; min-height: 250px; overflow: auto; white-space: pre; word-wrap: break-word; font-family: "Menlo", "Consolas", monospace; font-size: 0.85em; color: var(--secondary-text-color); }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = toolStyles;
    document.head.appendChild(styleElement);

    container.innerHTML = `
        <div class="tool-container">
            <!-- Back button has been removed, as the new navbar handles global navigation -->
            <h1>Titan Zip</h1>
            <label for="upload" class="file-upload-label">Choose a .zip file</label>
            <input type="file" id="upload" accept=".zip">
            <button id="process" disabled>Unzip and Analyze</button>
            <div id="progress"><div id="progress-bar"></div></div>
            <div id="output">Your file structure will appear here...</div>
            <button id="copy">Copy to Clipboard</button>
        </div>
    `;

    // --- Tool Logic & Event Handlers ---
    let selectedFile = null;
    const zipper = new TitanZip();
    
    const uploadInput = container.querySelector('#upload');
    const uploadLabel = container.querySelector('.file-upload-label');
    const processBtn = container.querySelector('#process');
    const copyBtn = container.querySelector('#copy');
    const outputDiv = container.querySelector('#output');
    const progressDiv = container.querySelector('#progress');
    const progressBar = container.querySelector('#progress-bar');
    
    uploadInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            uploadLabel.textContent = selectedFile.name;
            uploadLabel.style.borderColor = 'var(--accent-color)';
            processBtn.disabled = false;
        } else {
            uploadLabel.textContent = 'Choose a .zip file';
            uploadLabel.style.borderColor = 'var(--border-color)';
            processBtn.disabled = true;
        }
    });

    processBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        outputDiv.textContent = 'Processing...';
        progressDiv.style.display = 'block';
        progressBar.style.width = '0%';
        processBtn.disabled = true;

        try {
            const treeText = await zipper.unzipAndAnalyze(selectedFile, (percent) => {
                progressBar.style.width = `${percent}%`;
            });
            outputDiv.textContent = treeText;
        } catch (error) {
            outputDiv.textContent = 'Error: ' + error.message;
        } finally {
            setTimeout(() => {
                progressDiv.style.display = 'none';
            }, 500);
            processBtn.disabled = false;
        }
    });

    copyBtn.addEventListener('click', () => {
        const textToCopy = outputDiv.textContent;
        if (textToCopy && textToCopy !== 'Your file structure will appear here...') {
            navigator.clipboard.writeText(textToCopy)
                .then(() => { copyBtn.textContent = 'Copied!'; setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 1500); })
                .catch(() => { copyBtn.textContent = 'Failed to Copy'; setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 1500); });
        }
    });
}


