import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Remove Book Now from nav-links
    html = re.sub(r'<li>\s*<a href="[^"]*booking\.html">Book Now</a>\s*</li>', '', html)

    # 2. Change Login to a dropdown and append Book Now
    login_btn_pattern = r'<a href="([^"]*login\.html)"([^>]*)>Login</a>'
    
    def login_replacer(match):
        href = match.group(1)
        attrs = match.group(2)
        # Determine path level based on href
        prefix = '../' if href.startswith('../') else ''
        return f'''<div class="nav-dropdown" style="display:inline-block; margin-right: 10px;">
        <a href="{href}"{attrs}>Login</a>
        <div class="dropdown-panel">
          <a href="{prefix}dashboard.html">Admin Dashboard</a>
        </div>
      </div>
      <a href="{prefix}booking.html" class="btn btn-primary btn-sm">Book Now</a>'''

    # Only replace if not already replaced
    if 'Admin Dashboard' not in html:
        html = re.sub(login_btn_pattern, login_replacer, html)

    # 3. Contact page: remove hero section completely
    if filepath.endswith('contact.html'):
        html = re.sub(r'<!-- ============ PAGE HERO ============ -->\s*<section class="page-hero">.*?</section>', '', html, flags=re.DOTALL)
        html = re.sub(r'<section class="page-hero">\s*<img src="\.\./assets/images/decorations/royal\.jpg"[^>]*>.*?<h1>Contact Us</h1>.*?</section>', '', html, flags=re.DOTALL)

    # 4. All other pages: remove first line navigation text
    html = re.sub(r'<span class="eyebrow">.*?</span>', '', html, flags=re.DOTALL)
    html = re.sub(r'<div class="breadcrumb">.*?</div>', '', html, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

directory = r'd:\Project_31\pages'
for filename in os.listdir(directory):
    if filename.endswith('.html'):
        print(f"Processing {filename}...")
        process_file(os.path.join(directory, filename))

# Also process root index.html
process_file(r'd:\Project_31\index.html')
