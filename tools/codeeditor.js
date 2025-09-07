/**
 * Renders a visually overhauled, sovereign code editor page.
 */
export function renderCodeEditorPage(container, file, navigate, saveFileCallback) {
    if (!file) {
        console.error("No file provided to the editor.");
        navigate('files');
        return;
    }

    container.innerHTML = `
        <div class="sovereign-editor-wrapper page-content-wrapper">
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
                <div id="line-numbers" class="line-numbers"><div>1</div></div>
                <div class="editor-content-wrapper">
                    <div id="highlighting-layer" class="highlighting-layer">
                        <pre id="sovereign-highlighting-pre" aria-hidden="true"><code id="sovereign-highlighting-code"></code></pre>
                    </div>
                    <textarea id="sovereign-editor-textarea" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
                </div>
            </main>
        </div>
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Import Fira Code font */
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');

        :root {
            /* Titan Dark Theme */
            --editor-font: 'Fira Code', 'monospace';
            --editor-bg: #1e1e1e;
            --header-bg: #252526;
            --gutter-bg: #1e1e1e;
            --gutter-text: #858585;
            --gutter-text-active: #c6c6c6;
            --line-highlight: rgba(100, 100, 100, 0.15);
            --border-color: #333333;
            --text-color: #d4d4d4;
            --accent-color: #007acc;
            --error-color: #f44747;
            
            /* Syntax Colors */
            --token-comment: #6A9955;
            --token-keyword: #C586C0;
            --token-string: #CE9178;
            --token-number: #B5CEA8;
            --token-punctuation: #d4d4d4;
            --token-function: #DCDCAA;
            --token-tag: #569CD6;
            --token-attr-name: #9CDCFE;
            --token-attr-value: #CE9178;
            --token-operator: #d4d4d4;
            --token-class-name: #4EC9B0;
        }
        .sovereign-editor-wrapper { display: flex; flex-direction: column; height: 100vh; background-color: var(--editor-bg); color: var(--text-color); font-family: var(--editor-font); }
        .sovereign-editor-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background-color: var(--header-bg); border-bottom: 1px solid var(--border-color); flex-shrink: 0; user-select: none; }
        .sovereign-header-btn { background: none; border: none; color: #ccc; cursor: pointer; display: flex; align-items: center; font-size: 16px; padding: 8px 12px; border-radius: 8px; transition: background-color 0.2s; }
        .sovereign-header-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
        .sovereign-header-btn.primary { background-color: var(--accent-color); color: white; }
        .sovereign-header-btn svg { margin-right: 5px; }
        .sovereign-editor-main { flex-grow: 1; display: flex; overflow: hidden; }
        .line-numbers { padding: 10px 10px 10px 0; font-size: 15px; line-height: 1.5; color: var(--gutter-text); background-color: var(--gutter-bg); text-align: right; user-select: none; border-right: 1px solid var(--border-color); }
        .line-numbers > div { padding-right: 15px; }
        .current-line-no { color: var(--gutter-text-active); }
        .editor-content-wrapper { position: relative; flex-grow: 1; height: 100%; }
        #sovereign-editor-textarea, .highlighting-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-sizing: border-box; resize: none; overflow: auto; font-family: var(--editor-font); font-size: 15px; line-height: 1.5; }
        #sovereign-editor-textarea { z-index: 1; background: transparent; color: transparent; caret-color: white; outline: none; margin: 0; padding: 10px; border: 0; white-space: pre; overflow-wrap: normal; }
        .highlighting-layer { z-index: 0; pointer-events: none; }
        #sovereign-highlighting-pre, #sovereign-highlighting-code { margin: 0; padding: 0; }
        #sovereign-highlighting-pre { padding: 10px; }
        .active-line { background-color: var(--line-highlight); display: block; margin: 0 -10px; padding: 0 10px; }
        /* Syntax Highlighting */
        .token-comment { color: var(--token-comment); } .token-keyword { color: var(--token-keyword); font-style: italic; } .token-string { color: var(--token-string); } .token-number { color: var(--token-number); } .token-punctuation { color: var(--token-punctuation); } .token-function { color: var(--token-function); } .token-tag { color: var(--token-tag); } .token-attr-name { color: var(--token-attr-name); } .token-attr-value { color: var(--token-attr-value); } .token-operator { color: var(--token-operator); } .token-class-name { color: var(--token-class-name); }
    `;
    document.head.appendChild(styleElement);

    const textarea = document.getElementById('sovereign-editor-textarea');
    const highlightingCode = document.getElementById('sovereign-highlighting-code');
    const lineNumbersDiv = document.getElementById('line-numbers');

    const fileExtension = file.name.split('.').pop();
    const highlighter = getHighlighter(fileExtension);
    
    let currentLine = -1;

    function updateEditor() {
        const text = textarea.value;
        highlightingCode.innerHTML = highlighter(text);
        updateLineNumbers(text);
        updateActiveLine();
    }

    function updateLineNumbers(text) {
        const lineCount = text.split('\n').length || 1;
        lineNumbersDiv.innerHTML = `<div>${Array.from({ length: lineCount }, (_, i) => `<span class="line-no" data-line="${i + 1}">${i + 1}</span>`).join('<br>')}</div>`;
    }
    
    function updateActiveLine() {
        const selectionStart = textarea.selectionStart;
        const textUpToCursor = textarea.value.substring(0, selectionStart);
        const newLine = textUpToCursor.split('\n').length;

        if (newLine !== currentLine) {
            // Remove previous highlights
            const prevActiveLine = highlightingCode.querySelector('.active-line');
            if (prevActiveLine) {
                prevActiveLine.replaceWith(...prevActiveLine.childNodes);
            }
            const prevActiveNo = lineNumbersDiv.querySelector('.current-line-no');
            if (prevActiveNo) prevActiveNo.classList.remove('current-line-no');
            
            // Highlight new line
            const allLines = highlightingCode.childNodes;
            let charCount = 0;
            let lineNodeToWrap = null;
            for(const node of allLines) {
                 if(node.nodeType === 3) { // Text node
                    const lines = node.textContent.split('\n');
                    if(charCount + node.textContent.length >= selectionStart) {
                        lineNodeToWrap = node;
                        break;
                    }
                    charCount += node.textContent.length;
                 } else { // Span node
                    charCount += node.textContent.length;
                 }
            }

            // This is a simplified approach; robust active line is very complex.
            // For now, we wrap the whole code block for visual effect.
            // A more advanced version would wrap only the specific line.
            
            const lineNoEl = lineNumbersDiv.querySelector(`[data-line="${newLine}"]`);
            if(lineNoEl) lineNoEl.classList.add('current-line-no');

            currentLine = newLine;
        }
    }
    
    function syncScroll() {
        const highlightingLayer = document.querySelector('.highlighting-layer');
        highlightingLayer.scrollTop = textarea.scrollTop;
        highlightingLayer.scrollLeft = textarea.scrollLeft;
        lineNumbersDiv.scrollTop = textarea.scrollTop;
    }
    
    textarea.addEventListener('input', updateEditor);
    textarea.addEventListener('scroll', syncScroll);
    textarea.addEventListener('keydown', function(e) {
        if (e.key == 'Tab') {
            e.preventDefault();
            const start = this.selectionStart, end = this.selectionEnd;
            this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
        }
        setTimeout(updateActiveLine, 0);
    });
    textarea.addEventListener('click', updateActiveLine);

    textarea.value = file.content || ``;
    updateEditor();

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

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getHighlighter(extension) {
    const rules = {
        js: [
            { type: 'comment', regex: /(\/\*[\s\S]*?\*\/|\/\/.*)/g },
            { type: 'string', regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g },
            { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|for|while|new|import|export|from|async|await|class|extends|super|true|false|null)\b/g },
            { type: 'function', regex: /\b([a-zA-Z_]\w*)(?=\s*\()/g },
            { type: 'class-name', regex: /\b([A-Z][a-zA-Z0-9_]*)\b/g },
            { type: 'number', regex: /\b(\d+)\b/g },
            { type: 'operator', regex: /([=+\-*/%&|<>!]=?)/g },
            { type: 'punctuation', regex: /([(){}[\].,;])/g }
        ],
        html: [
            { type: 'comment', regex: /(&lt;!--[\s\S]*?--&gt;)/g },
            { type: 'tag', regex: /(&lt;\/?)([\w-]+)/g, replace: '$1<span class="token-tag">$2</span>' },
            { type: 'attr-name', regex: /\b([\w-]+)(?==)/g },
            { type: 'attr-value', regex: /(".*?")/g }
        ]
    };

    const langRules = rules[extension] || [];

    return (text) => {
        let highlighted = escapeHtml(text);
        langRules.forEach(rule => {
            highlighted = highlighted.replace(rule.regex, rule.replace || `<span class="token-${rule.type}">$&</span>`);
        });
        return highlighted;
    };
}


