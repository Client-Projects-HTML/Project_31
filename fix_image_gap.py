import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove style="height:350px;" from arch-frame divs
    html = re.sub(r'<div class="arch-frame" style="height:350px;">', r'<div class="arch-frame">', html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

directory = r'd:\Project_31\pages'
for filename in os.listdir(directory):
    if filename.endswith('.html'):
        process_file(os.path.join(directory, filename))

process_file(r'd:\Project_31\index.html')
