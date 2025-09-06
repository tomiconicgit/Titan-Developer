/**
 * Renders a sovereign, custom-built code editor page.
 * @param {HTMLElement} container - The element to render the editor into.
 * @param {object} file - The file object to be edited.
 * @param {function} navigate - Function to navigate back to the files page.
 * @param {function} saveFileCallback - Function to call when the save button is clicked.
 */
export function renderCodeEditorPage(container, file, navigate, saveFileCallback) {
    if (!file) {
        console.error("No file provided to the editor.");
        navigate('files');
        return;
    }

    // --- UI Structure and Styling ---
    container.innerHTML = `
        <div class="sovereign-editor-wrapper">
            <header class="sovereign-editor-header">
                <button id="sovereign-back-btn" class="sovereign-header-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>Files</span>
                </button>
                <div class="sovereign-file-info">
                    <span class="sovereign-file-name-display">${file.name}</span>
                </div>
                <button id="sovereign-save-btn" class="sovereign-header-btn primary">Save</button>
            </header>
            <main class="sovereign-editor-main">
                <div id="line-numbers" class="line-numbers">1</div>
                <div class="editor-content-wrapper">
                    <textarea id="sovereign-editor-textarea" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
                    <pre id="sovereign-highlighting-pre" aria-hidden="true"><code id="sovereign-highlighting-code"></code></pre>
                </div>
            </main>
        </div>
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        :root {
            --editor-bg: #212121;
            --header-bg: #263238;
            --border-color: #37474F;
            --text-color: #E0E0E0;
            --line-number-color: #6c757d;
            --font-family: 'Fira Code', 'monospace';
            --font-size: 16px;
        }
        .sovereign-editor-wrapper { display: flex; flex-direction: column; height: 100vh; background-color: var(--editor-bg); color: var(--text-color); }
        .sovereign-editor-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background-color: var(--header-bg); border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .sovereign-header-btn { background: none; border: none; color: #B0BEC5; cursor: pointer; display: flex; align-items: center; font-size: 16px; padding: 8px 12px; border-radius: 8px; transition: background-color 0.2s; }
        .sovereign-header-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
        .sovereign-header-btn.primary { background-color: #007AFF; color: white; }
        .sovereign-header-btn.primary:hover { background-color: #0056b3; }
        .sovereign-header-btn svg { margin-right: 5px; }
        .sovereign-editor-main { flex-grow: 1; display: flex; overflow: hidden; }
        .line-numbers { padding: 10px; font-family: var(--font-family); font-size: var(--font-size); line-height: 1.5; color: var(--line-number-color); background-color: var(--header-bg); text-align: right; user-select: none; }
        .editor-content-wrapper { position: relative; flex-grow: 1; height: 100%; }
        #sovereign-editor-textarea, #sovereign-highlighting-pre {
            margin: 0;
            padding: 10px;
            border: 0;
            font-family: var(--font-family);
            font-size: var(--font-size);
            line-height: 1.5;
            white-space: pre;
            overflow-wrap: normal;
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            resize: none;
        }
        #sovereign-editor-textarea {
            z-index: 1;
            background: transparent;
            color: transparent;
            caret-color: white;
            outline: none;
        }
        #sovereign-highlighting-pre {
            z-index: 0;
            pointer-events: none;
        }
        /* Syntax Highlighting Colors */
        .token-comment { color: #6a9955; }
        .token-keyword { color: #569cd6; }
        .token-string { color: #ce9178; }
        .token-number { color: #b5cea8; }
        .token-punctuation { color: #d4d4d4; }
        .token-function { color: #dcdcaa; }
        .token-tag { color: #569cd6; }
        .token-attr-name { color: #9cdcfe; }
        .token-attr-value { color: #ce9178; }
    `;
    document.head.appendChild(styleElement);

    // --- Editor Core Logic ---
    const textarea = document.getElementById('sovereign-editor-textarea');
    const highlightingCode = document.getElementById('sovereign-highlighting-code');
    const lineNumbersDiv = document.getElementById('line-numbers');

    const fileExtension = file.name.split('.').pop();
    const highlighter = getHighlighter(fileExtension);
    
    function updateEditor() {
        const text = textarea.value;
        const highlightedText = highlighter(text);
        highlightingCode.innerHTML = highlightedText;
        updateLineNumbers(text);
    }

    function updateLineNumbers(text) {
        const lineCount = text.split('\n').length;
        lineNumbersDiv.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    }

    function syncScroll() {
        highlightingCode.parentElement.scrollTop = textarea.scrollTop;
        highlightingCode.parentElement.scrollLeft = textarea.scrollLeft;
        lineNumbersDiv.scrollTop = textarea.scrollTop;
    }
    
    textarea.addEventListener('input', updateEditor);
    textarea.addEventListener('scroll', syncScroll);
    
    // Handle Tab key for indentation
    textarea.addEventListener('keydown', function(e) {
        if (e.key == 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
        }
    });

    // Initial content
    textarea.value = file.content || `// Welcome to ${file.name}\n`;
    updateEditor();

    // --- Event Listeners ---
    document.getElementById('sovereign-back-btn').addEventListener('click', () => navigate('files'));
    document.getElementById('sovereign-save-btn').addEventListener('click', () => {
        const updatedContent = textarea.value;
        const updatedFile = { ...file, content: updatedContent };
        saveFileCallback(updatedFile);
        const saveBtn = document.getElementById('sovereign-save-btn');
        saveBtn.textContent = 'Saved!';
        setTimeout(() => { saveBtn.textContent = 'Save'; }, 1500);
    });
}

/**
 * Basic HTML escaping to prevent code injection.
 * @param {string} text 
 */
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Returns a highlighting function based on the file extension.
 * This is our "language plugin" system.
 * @param {string} extension 
 */
function getHighlighter(extension) {
    switch (extension) {
        case 'js':
        case 'json':
            return (text) => escapeHtml(text)
                .replace(/\b(const|let|var|function|return|if|else|for|while|new|import|export|from)\b/g, '<span class="token-keyword">$&</span>')
                .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span class="token-comment">$&</span>') // Comments
                .replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, '<span class="token-string">$&</span>') // Strings
                .replace(/\b(\d+)\b/g, '<span class="token-number">$&</span>')
                .replace(/([(){}[\]=.,;])/g, '<span class="token-punctuation">$&</span>');

        case 'html':
        case 'svg':
             return (text) => escapeHtml(text)
                .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$&</span>') // Comments
                .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="token-tag">$2</span>') // Tags
                .replace(/\b([a-zA-Z-]+)=/g, '<span class="token-attr-name">$&</span>') // Attribute names
                .replace(/(".*?")/g, '<span class="token-attr-value">$&</span>'); // Attribute values
        
        case 'md':
             return (text) => escapeHtml(text)
                .replace(/^(#+)(.*)/gm, '<span class="token-keyword">$1</span><span class="token-function">$2</span>') // Headings
                .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>') // Bold
                .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>') // Italic
                .replace(/(`)(.*?)\1/g, '<span class="token-string">$2</span>'); // Inline code

        case 'txt':
        default:
            return (text) => escapeHtml(text); // No highlighting
    }
}

