from flask import Flask, render_template, request, jsonify
import markdown
import re
import bleach

app = Flask(__name__)

# Allowed HTML tags for sanitization
ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span', 'input', 'del'
]

ALLOWED_ATTRIBUTES = {
    '*': ['class', 'id'],
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title'],
    'input': ['type', 'disabled', 'checked'],
    'code': ['class'],
    'pre': ['class'],
    'div': ['class']
}

def process_github_markdown(text):
    """Process markdown with GitHub-flavored features"""
    
    # Process task lists (before markdown conversion)
    text = re.sub(
        r'- \[([ xX])\]', 
        lambda m: f'- <input type="checkbox" disabled {"checked" if m.group(1).lower() == "x" else ""}>', 
        text
    )
    
    # Process strikethrough
    text = re.sub(r'~~(.+?)~~', r'<del>\1</del>', text)
    
    # Process emoji shortcodes
    emoji_map = {
        ':rocket:': '🚀', ':fire:': '🔥', ':star:': '⭐', ':heart:': '❤️',
        ':+1:': '👍', ':-1:': '👎', ':smile:': '😄', ':tada:': '🎉',
        ':thinking:': '🤔', ':eyes:': '👀', ':100:': '💯', ':white_check_mark:': '✅',
        ':x:': '❌', ':warning:': '⚠️', ':bulb:': '💡', ':book:': '📚',
        ':pencil:': '✏️', ':memo:': '📝', ':computer:': '💻', ':package:': '📦',
        ':zap:': '⚡', ':sparkles:': '✨', ':bug:': '🐛', ':hammer:': '🔨',
        ':construction:': '🚧', ':green_heart:': '💚', ':lock:': '🔒', ':key:': '🔑'
    }
    for code, emoji in emoji_map.items():
        text = text.replace(code, emoji)
    
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        
        if not data or 'markdown' not in data:
            return jsonify({'error': 'No markdown provided'}), 400
        
        markdown_text = data.get('markdown', '')
        
        # Process GitHub-flavored markdown
        markdown_text = process_github_markdown(markdown_text)
        
        # Convert markdown to HTML with extensions
        html = markdown.markdown(
            markdown_text,
            extensions=[
                'tables',
                'fenced_code',
                'codehilite',
                'nl2br',
                'sane_lists',
                'attr_list',  # For adding attributes to elements
                'def_list',   # For definition lists
                'abbr',       # For abbreviations
                'md_in_html'  # For markdown inside HTML blocks
            ],
            extension_configs={
                'codehilite': {
                    'css_class': 'highlight',
                    'linenums': False
                }
            }
        )
        
        # Sanitize HTML to prevent XSS attacks
        clean_html = bleach.clean(
            html,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            strip=True
        )
        
        return jsonify({'html': clean_html})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False)