const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Load saved content
const savedContent = localStorage.getItem('markdownContent');
if (savedContent) {
    editor.value = savedContent;
}

async function updatePreview() {
    const markdown = editor.value;
    localStorage.setItem('markdownContent', markdown);
    
    try {
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdown: markdown })
        });
        const data = await response.json();
        preview.innerHTML = data.html;
    } catch (error) {
        console.error('Error converting markdown:', error);
    }
}

// Update preview on input with debouncing
let timeout;
editor.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(updatePreview, 300);
});

// Initial preview
updatePreview();