const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const saveIndicator = document.getElementById('saveIndicator');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

// Load saved content from localStorage
const savedContent = localStorage.getItem('markdownContent');
if (savedContent) {
    editor.value = savedContent;
}

// Save indicator management
function showSaveIndicator(text = 'Saved ✓', isSaving = false) {
    saveIndicator.textContent = text;
    saveIndicator.classList.remove('saving');
    if (isSaving) {
        saveIndicator.classList.add('saving');
    }
    saveIndicator.classList.add('show');
    
    setTimeout(() => {
        saveIndicator.classList.remove('show');
    }, 2000);
}

// Update preview function with error handling
async function updatePreview() {
    const markdown = editor.value;
    
    // Show saving indicator
    showSaveIndicator('Saving...', true);
    
    // Save to localStorage
    try {
        localStorage.setItem('markdownContent', markdown);
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
    
    // Convert markdown to HTML
    try {
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdown: markdown })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        preview.innerHTML = data.html;
        
        // Add copy buttons to code blocks
        addCopyButtons();
        
        // Show saved indicator
        showSaveIndicator('Saved ✓', false);
        
    } catch (error) {
        console.error('Error converting markdown:', error);
        preview.innerHTML = `
            <div style="color: #f85149; padding: 16px; border: 1px solid #da3633; border-radius: 6px;">
                <strong>Error:</strong> Failed to convert markdown. ${error.message}
            </div>
        `;
        showSaveIndicator('Error ✗', false);
    }
}

// Debounced input handler
let timeout;
editor.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(updatePreview, 300);
});

// Add copy buttons to code blocks
function addCopyButtons() {
    const codeBlocks = preview.querySelectorAll('pre');
    
    codeBlocks.forEach(block => {
        // Remove existing copy button if any
        const existingBtn = block.querySelector('.copy-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.title = 'Copy code to clipboard';
        
        copyBtn.addEventListener('click', async () => {
            const code = block.querySelector('code');
            const text = code ? code.textContent : block.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                copyBtn.textContent = 'Failed';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }
        });
        
        block.style.position = 'relative';
        block.appendChild(copyBtn);
    });
}

// Download markdown as file
downloadBtn.addEventListener('click', () => {
    const markdown = editor.value;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitscribe-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSaveIndicator('Downloaded ✓', false);
});

// Clear editor content
clearBtn.addEventListener('click', () => {
    if (editor.value.trim() === '') {
        return;
    }
    
    const confirmed = confirm('Are you sure you want to clear all content? This cannot be undone.');
    if (confirmed) {
        editor.value = '';
        localStorage.removeItem('markdownContent');
        updatePreview();
        showSaveIndicator('Cleared ✓', false);
    }
});

// Keyboard shortcuts
editor.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save (just show indicator since auto-save is active)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showSaveIndicator('Saved ✓', false);
    }
    
    // Tab key handling for indentation
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        
        if (e.shiftKey) {
            // Shift+Tab: Remove indentation
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const line = value.substring(lineStart, end);
            if (line.startsWith('  ')) {
                editor.value = value.substring(0, lineStart) + 
                             value.substring(lineStart + 2, value.length);
                editor.selectionStart = editor.selectionEnd = start - 2;
            }
        } else {
            // Tab: Add indentation
            editor.value = value.substring(0, start) + '  ' + value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 2;
        }
        
        editor.dispatchEvent(new Event('input'));
    }
});

// Sync scrolling between editor and preview (optional feature)
let isEditorScrolling = false;
let isPreviewScrolling = false;

editor.addEventListener('scroll', () => {
    if (isPreviewScrolling) return;
    isEditorScrolling = true;
    
    const editorScrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    const previewPane = document.querySelector('.preview-pane');
    previewPane.scrollTop = editorScrollPercent * (previewPane.scrollHeight - previewPane.clientHeight);
    
    setTimeout(() => { isEditorScrolling = false; }, 100);
});

document.querySelector('.preview-pane').addEventListener('scroll', function() {
    if (isEditorScrolling) return;
    isPreviewScrolling = true;
    
    const previewScrollPercent = this.scrollTop / (this.scrollHeight - this.clientHeight);
    editor.scrollTop = previewScrollPercent * (editor.scrollHeight - editor.clientHeight);
    
    setTimeout(() => { isPreviewScrolling = false; }, 100);
});

// Initial preview render
updatePreview();