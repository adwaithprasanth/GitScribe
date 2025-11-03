# app.py
from flask import Flask, render_template, request, jsonify
import markdown
import re

app = Flask(__name__)

def process_github_markdown(text):
    """Process markdown with GitHub-flavored features"""
    
    # Process task lists
    text = re.sub(r'- \[([ x])\]', lambda m: f'- <input type="checkbox" disabled {"checked" if m.group(1) == "x" else ""}>', text)
    
    # Process emoji shortcodes (basic ones)
    emoji_map = {
        ':rocket:': '🚀', ':fire:': '🔥', ':star:': '⭐', ':heart:': '❤️',
        ':+1:': '👍', ':-1:': '👎', ':smile:': '😄', ':tada:': '🎉',
        ':thinking:': '🤔', ':eyes:': '👀', ':100:': '💯', ':white_check_mark:': '✅',
        ':x:': '❌', ':warning:': '⚠️', ':bulb:': '💡', ':book:': '📚',
        ':pencil:': '✏️', ':memo:': '📝', ':computer:': '💻', ':package:': '📦'
    }
    for code, emoji in emoji_map.items():
        text = text.replace(code, emoji)
    
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    data = request.get_json()
    markdown_text = data.get('markdown', '')
    
    # Process GitHub-flavored markdown
    markdown_text = process_github_markdown(markdown_text)
    
    # Convert to HTML
    html = markdown.markdown(
        markdown_text,
        extensions=[
            'tables',
            'fenced_code',
            'codehilite',
            'nl2br',
            'sane_lists'
        ]
    )
    
    return jsonify({'html': html})

if __name__ == '__main__':
    app.run(debug=False)

app = app