const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️ Light Mode';
}

// Load saved content
const savedContent = localStorage.getItem('markdownContent');
if (savedContent) {
    editor.value = savedContent;
}

function toggleTheme() {
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    }
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