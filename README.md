# MarkFlow (or your chosen name)

A beautiful GitHub-styled markdown editor with live preview.

## Features
- 📝 Live markdown preview
- 🎨 GitHub-flavored markdown support
- 🌓 Dark/light theme toggle
- 💾 Auto-save to localStorage
- ✅ Task lists, tables, code blocks, emojis

## Setup
1. Clone the repository
2. Create virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run: `python app.py`
6. Open: `http://localhost:5000`

## Tech Stack
- Flask
- Python Markdown
- GitHub Markdown CSS
```

4. **LICENSE** - Choose one (MIT is popular for open source)

**Your final structure:**
```
markflow/
├── .gitignore
├── README.md
├── requirements.txt
├── LICENSE
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js