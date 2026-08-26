import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    icon_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align:-3px; opacity: 0.8;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    
    def replacer(match):
        prefix = match.group(1)
        return f'<a href="{prefix}dashboard.html" style="display:flex; align-items:center; padding: 12px 16px; font-weight: 500;">{icon_svg}Customer Dashboard</a>'
        
    html = re.sub(r'<a href="([^"]*)dashboard\.html">Admin Dashboard</a>', replacer, html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

directory = r'd:\Project_31\pages'
for filename in os.listdir(directory):
    if filename.endswith('.html'):
        process_file(os.path.join(directory, filename))

process_file(r'd:\Project_31\index.html')
