/**
 * Renders an advanced, sovereign, custom-built code editor page.
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
                    <div id="sovereign-linter-overlay" class="linter-overlay"></div>
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
            --line-height: 1.5;
            --error-color: #ff5555;
        }
        .sovereign-editor-wrapper { display: flex; flex-direction: column; height: 100vh; background-color: var(--editor-bg); color: var(--text-color); }
        .sovereign-editor-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background-color: var(--header-bg); border-bottom: 1px solid var(--border-color); flex-shrink: 0; user-select: none; }
        .sovereign-header-btn { background: none; border: none; color: #B0BEC5; cursor: pointer; display: flex; align-items: center; font-size: 16px; padding: 8px 12px; border-radius: 8px; transition: background-color 0.2s; }
        .sovereign-header-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
        .sovereign-header-btn.primary { background-color: #007AFF; color: white; }
        .sovereign-header-btn.primary:hover { background-color: #0056b3; }
        .sovereign-header-btn svg { margin-right: 5px; }
        .sovereign-editor-main { flex-grow: 1; display: flex; overflow: hidden; }
        .line-numbers { padding: 10px 5px 10px 10px; font-family: var(--font-family); font-size: var(--font-size); line-height: var(--line-height); color: var(--line-number-color); background-color: var(--header-bg); text-align: right; user-select: none; position: relative; }
        .editor-content-wrapper { position: relative; flex-grow: 1; height: 100%; }
        #sovereign-editor-textarea, #sovereign-highlighting-pre, .linter-overlay {
            margin: 0; padding: 10px; border: 0; font-family: var(--font-family); font-size: var(--font-size); line-height: var(--line-height); white-space: pre; overflow-wrap: normal; position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-sizing: border-box; resize: none; overflow: auto;
        }
        #sovereign-editor-textarea { z-index: 1; background: transparent; color: transparent; caret-color: white; outline: none; }
        #sovereign-highlighting-pre, .linter-overlay { z-index: 0; pointer-events: none; }
        .linter-overlay { z-index: 2; }
        /* Linter UI */
        .lint-marker { position: absolute; right: 5px; width: 5px; height: 5px; background-color: var(--error-color); border-radius: 50%; cursor: pointer; pointer-events: all; }
        .lint-marker:hover .lint-message { display: block; }
        .lint-message { display: none; position: absolute; bottom: 10px; right: 10px; background-color: #333; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; white-space: nowrap; z-index: 100; }
        .error-underline { background-image: linear-gradient(to right, var(--error-color) 50%, transparent 50%); background-repeat: repeat-x; background-size: 6px 2px; background-position: 0 95%; }
        /* Syntax Highlighting Colors */
        .token-comment { color: #6a9955; } .token-keyword { color: #569cd6; } .token-string { color: #ce9178; } .token-number { color: #b5cea8; } .token-punctuation { color: #d4d4d4; } .token-function { color: #dcdcaa; } .token-tag { color: #569cd6; } .token-attr-name { color: #9cdcfe; } .token-attr-value { color: #ce9178; } .token-property { color: #9cdcfe; } .token-selector { color: #d7ba7d; }
    `;
    document.head.appendChild(styleElement);

    // --- Editor Core Logic ---
    const textarea = document.getElementById('sovereign-editor-textarea');
    const highlightingCode = document.getElementById('sovereign-highlighting-code');
    const lineNumbersDiv = document.getElementById('line-numbers');
    const linterOverlay = document.getElementById('sovereign-linter-overlay');

    const fileExtension = file.name.split('.').pop();
    const languageService = LanguageService.get(fileExtension);
    
    function updateEditor() {
        const text = textarea.value;
        const { highlightedText, tokens } = languageService.tokenize(text);
        highlightingCode.innerHTML = highlightedText;
        
        const errors = languageService.lint(text, tokens);
        renderLinterUI(errors, text);
        
        updateLineNumbers(text);
    }

    function updateLineNumbers(text) {
        const lineCount = text.split('\n').length || 1;
        lineNumbersDiv.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    }

    function renderLinterUI(errors, text) {
        linterOverlay.innerHTML = '';
        lineNumbersDiv.querySelectorAll('.lint-marker').forEach(m => m.remove());
        
        if (errors.length === 0) return;

        errors.forEach(error => {
            const marker = document.createElement('div');
            marker.className = 'lint-marker';
            marker.style.top = `calc(${error.lineNumber * 1.5}em + 2px)`; // Approx. line height calc
            
            const message = document.createElement('span');
            message.className = 'lint-message';
            message.textContent = error.message;
            marker.appendChild(message);

            lineNumbersDiv.appendChild(marker);
        });

        // Add underlines to the highlighting view
        const lines = highlightingCode.innerHTML.split('\n');
        errors.forEach(error => {
            const lineIndex = error.lineNumber - 1;
            if (lines[lineIndex]) {
                lines[lineIndex] = `<span class="error-underline">${lines[lineIndex]}</span>`;
            }
        });
        highlightingCode.innerHTML = lines.join('\n');
    }

    function syncScroll() {
        const scrollTop = textarea.scrollTop;
        const scrollLeft = textarea.scrollLeft;
        highlightingCode.parentElement.scrollTop = scrollTop;
        highlightingCode.parentElement.scrollLeft = scrollLeft;
        linterOverlay.scrollTop = scrollTop;
        linterOverlay.scrollLeft = scrollLeft;
        lineNumbersDiv.scrollTop = scrollTop;
    }
    
    textarea.addEventListener('input', updateEditor);
    textarea.addEventListener('scroll', syncScroll);
    
    textarea.addEventListener('keydown', function(e) {
        // Handle Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            this.value = this.value.substring(0, start) + "  " + this.value.substring(this.selectionEnd);
            this.selectionStart = this.selectionEnd = start + 2;
        }
        // Handle auto-indent on Enter
        if (e.key === 'Enter') {
            const cursorPos = this.selectionStart;
            const textBefore = this.value.substring(0, cursorPos);
            const currentLine = textBefore.split('\n').pop();
            const indentMatch = currentLine.match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';
            
            // If the line ends with an opening bracket, add more indentation
            if (/[{([]\s*$/.test(currentLine)) {
                e.preventDefault();
                const newIndent = indent + '  ';
                this.value = textBefore + '\n' + newIndent + this.value.substring(cursorPos);
                this.selectionStart = this.selectionEnd = cursorPos + 1 + newIndent.length;
            }
        }
    });

    // Initial load
    textarea.value = file.content || `// Welcome to ${file.name}\n`;
    updateEditor();
    syncScroll(); // Initial sync

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

// --- SOVEREIGN LANGUAGE SERVICE ---

const LanguageService = {
    languages: {},
    register(lang) {
        lang.extensions.forEach(ext => this.languages[ext] = lang);
    },
    get(extension) {
        return this.languages[extension] || this.languages['default'];
    }
};

// --- Language Definitions ---

// Default (Plain Text)
LanguageService.register({
    name: 'PlainText',
    extensions: ['txt', 'default'],
    tokenize(text) {
        const highlightedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return { highlightedText, tokens: [] };
    },
    lint(text, tokens) {
        return [];
    }
});

// JavaScript
LanguageService.register({
    name: 'JavaScript',
    extensions: ['js'],
    tokenize(text) {
        let highlightedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // This regex is more advanced and uses capturing groups for targeted replacement.
        highlightedText = highlightedText.replace(
            /(?<comment>\/\*[\s\S]*?\*\/|\/\/.*)|(?<string>['"`])(?:(?=(\\?))\2.)*?\1|(?<keyword>\b(const|let|var|function|return|if|else|for|while|new|import|export|from|async|await|class|extends)\b)|(?<function>\b[a-zA-Z_]\w*(?=\s*\())|(?<number>\b\d+\b)|(?<punctuation>[(){}[\]=.,;])/g,
            (...args) => {
                const groups = args.pop();
                for (const tokenType in groups) {
                    if (groups[tokenType]) {
                        return `<span class="token-${tokenType}">${groups[tokenType]}</span>`;
                    }
                }
            }
        );
        return { highlightedText, tokens: [] }; // For simplicity, we're not passing detailed tokens yet.
    },
    lint(text, tokens) {
        const errors = [];
        const lines = text.split('\n');
        
        // Bracket balancing check
        const stack = [];
        const bracketMap = { '(': ')', '{': '}', '[': ']' };
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (bracketMap[char]) {
                stack.push({ char, line: text.substring(0, i).split('\n').length });
            } else if (Object.values(bracketMap).includes(char)) {
                if (stack.length === 0 || bracketMap[stack.pop().char] !== char) {
                    errors.push({ lineNumber: text.substring(0, i).split('\n').length, message: `Unmatched closing bracket '${char}'` });
                }
            }
        }
        if (stack.length > 0) {
            const unclosed = stack.pop();
            errors.push({ lineNumber: unclosed.line, message: `Unclosed opening bracket '${unclosed.char}'` });
        }

        return errors;
    }
});

// JSON
LanguageService.register({
    name: 'JSON',
    extensions: ['json'],
    tokenize(text) {
        // JSON highlighting is simpler: strings and numbers.
        let highlightedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        highlightedText = highlightedText.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="token-string">$1</span>');
        highlightedText = highlightedText.replace(/\b(\d+|true|false|null)\b/g, '<span class="token-number">$1</span>');
        return { highlightedText, tokens: [] };
    },
    lint(text) {
        if (!text.trim()) return []; // Ignore empty files
        try {
            JSON.parse(text);
            return [];
        } catch (e) {
            // Try to find the line number of the error
            const match = e.message.match(/position (\d+)/);
            let lineNumber = 1;
            if (match) {
                const position = parseInt(match[1], 10);
                lineNumber = text.substring(0, position).split('\n').length;
            }
            return [{ lineNumber, message: "Invalid JSON format: " + e.message }];
        }
    }
});


// HTML & SVG
LanguageService.register({
    name: 'HTML',
    extensions: ['html', 'svg'],
    tokenize(text) {
        let highlightedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        highlightedText = highlightedText
            .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>')
            .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="token-tag">$2</span>')
            .replace(/\b([\w-]+)=/g, '<span class="token-attr-name">$1</span>=')
            .replace(/(".*?")/g, '<span class="token-attr-value">$1</span>');
        return { highlightedText, tokens: [] };
    },
    lint(text) { return []; } // Linter to be implemented
});

// CSS
LanguageService.register({
    name: 'CSS',
    extensions: ['css'],
    tokenize(text) {
         let highlightedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
         highlightedText = highlightedText
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>') // Comments
            .replace(/([^{}]+)(?=\s*{)/g, '<span class="token-selector">$1</span>') // Selectors
            .replace(/([\w-]+)\s*:/g, '<span class="token-property">$1</span>:') // Properties
            .replace(/:\s*([^;"]+|"[^"]*");/g, ': <span class="token-attr-value">$1</span>;'); // Values
        return { highlightedText, tokens: [] };
    },
    lint(text) { return []; }
});


