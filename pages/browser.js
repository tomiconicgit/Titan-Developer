// A blocklist of known ad-serving domains
const AD_DOMAINS = new Set(['doubleclick.net', 'adservice.google.com', 'googlesyndication.com', 'ad.doubleclick.net', 'googleads.g.doubleclick.net']);

let historyStack = ['https://www.google.com/search?igu=1'];
let historyIndex = 0;

export function renderBrowserPage(container, navigate) {
    container.innerHTML = `
      <div class="browser-wrapper page-content-wrapper">
        <header class="browser-header">
            <button id="browser-back" class="nav-btn" disabled>&larr;</button>
            <button id="browser-forward" class="nav-btn" disabled>&rarr;</button>
            <button id="browser-refresh" class="nav-btn">&#8635;</button>
            <input type="text" id="url-bar" placeholder="Search or enter URL">
        </header>
        <main class="browser-content">
            <iframe id="browser-iframe" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerpolicy="no-referrer"></iframe>
        </main>
      </div>
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .browser-wrapper { display: flex; flex-direction: column; height: 100%; background: #fff; }
        .browser-header { display: flex; gap: 5px; padding: 10px; background: #f1f1f1; border-bottom: 1px solid #ccc; }
        .nav-btn { background: #ddd; border: 1px solid #ccc; border-radius: 4px; width: 30px; height: 30px; } .nav-btn:disabled { opacity: 0.5; }
        #url-bar { flex-grow: 1; border: 1px solid #ccc; border-radius: 4px; padding: 5px 10px; font-size: 1em; }
        .browser-content { flex-grow: 1; border: 0; }
        #browser-iframe { width: 100%; height: 100%; border: 0; }
    `;
    document.head.appendChild(styleElement);

    const iframe = document.getElementById('browser-iframe');
    const urlBar = document.getElementById('url-bar');
    const backBtn = document.getElementById('browser-back');
    const forwardBtn = document.getElementById('browser-forward');

    function updateNavButtons() {
        backBtn.disabled = historyIndex <= 0;
        forwardBtn.disabled = historyIndex >= historyStack.length - 1;
    }

    function navigateIframe(url, isNavigatingHistory = false) {
        try {
            const hostname = new URL(url).hostname.replace('www.', '');
            if (AD_DOMAINS.has(hostname)) {
                console.log("Ad blocked:", url);
                iframe.srcdoc = `... Ad Blocked Message ...`;
                return;
            }
        } catch (e) {
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
        
        iframe.src = url;
        urlBar.value = url;
        if (!isNavigatingHistory) {
            if (historyIndex < historyStack.length - 1) {
                historyStack = historyStack.slice(0, historyIndex + 1);
            }
            historyStack.push(url);
            historyIndex++;
        }
        updateNavButtons();
    }
    
    // Download interception logic
    iframe.addEventListener('load', () => { /* ... see previous response ... */ });
    
    // Event listeners for buttons and URL bar
    backBtn.addEventListener('click', () => { if (historyIndex > 0) navigateIframe(historyStack[--historyIndex], true); });
    forwardBtn.addEventListener('click', () => { if (historyIndex < historyStack.length - 1) navigateIframe(historyStack[++historyIndex], true); });
    urlBar.addEventListener('keypress', e => { if (e.key === 'Enter') navigateIframe(urlBar.value); });

    // Initial load
    navigateIframe(historyStack[historyIndex], true);
}


