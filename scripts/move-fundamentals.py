#!/usr/bin/env python3
import os
import re
from pathlib import Path

project_root = Path(__file__).parent.parent

# Create directories
os.makedirs(project_root / 'app' / 'fundamentals', exist_ok=True)
os.makedirs(project_root / 'app' / 'implementations', exist_ok=True)

files_to_move = [
    {
        'src': 'app/logos.html',
        'dst': 'app/fundamentals/logos.html',
        'url_path': 'fundamentals/logos.html',
        'active': 'logos'
    },
    {
        'src': 'app/colors.html',
        'dst': 'app/fundamentals/colors.html',
        'url_path': 'fundamentals/colors.html',
        'active': 'colors'
    },
    {
        'src': 'app/fonts.html',
        'dst': 'app/fundamentals/fonts.html',
        'url_path': 'fundamentals/fonts.html',
        'active': 'fonts'
    },
]

for file_info in files_to_move:
    src_path = project_root / file_info['src']
    dst_path = project_root / file_info['dst']
    url_path = file_info['url_path']
    active = file_info['active']
    
    content = src_path.read_text(encoding='utf-8')
    
    # Update relative paths
    content = content.replace('href="favicon.svg"', 'href="../favicon.svg"')
    content = content.replace('href="manifest.json"', 'href="../manifest.json"')
    content = content.replace('href="styles.css"', 'href="../styles.css"')
    content = content.replace('href="impressum.html"', 'href="../impressum.html"')
    content = content.replace('href="index.html"', 'href="../index.html"')
    
    # Update OpenGraph URLs
    old_path = file_info['src'].replace('app/', '').replace('.html', '')
    content = re.sub(
        rf'https://kieksme\.github\.io/kieks\.me\.cicd/{old_path}\.html',
        f'https://kieksme.github.io/kieks.me.cicd/{url_path}',
        content
    )
    
    # Update JSON-LD URLs
    content = re.sub(
        rf'"url":\s*"https://kieksme\.github\.io/kieks\.me\.cicd/{old_path}\.html"',
        f'"url": "https://kieksme.github.io/kieks.me.cicd/{url_path}"',
        content
    )
    
    # Update navigation - desktop
    desktop_nav = f'''<div class="hidden md:flex items-center space-x-6">
                    <a href="../index.html" class="nav-link font-body">Home</a>
                    <div class="relative group">
                        <a href="index.html" class="nav-link font-body">Fundamentals</a>
                        <div class="absolute left-0 mt-2 w-48 bg-navy rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-2">
                                <a href="index.html" class="block px-4 py-2 text-sm hover:bg-navy-medium">Overview</a>
                                <a href="logos.html" class="block px-4 py-2 text-sm hover:bg-navy-medium{' text-aqua' if active == 'logos' else ''}">Logos</a>
                                <a href="colors.html" class="block px-4 py-2 text-sm hover:bg-navy-medium{' text-aqua' if active == 'colors' else ''}">Colors</a>
                                <a href="fonts.html" class="block px-4 py-2 text-sm hover:bg-navy-medium{' text-aqua' if active == 'fonts' else ''}">Fonts</a>
                            </div>
                        </div>
                    </div>
                    <div class="relative group">
                        <a href="../implementations/index.html" class="nav-link font-body">Implementations</a>
                        <div class="absolute left-0 mt-2 w-48 bg-navy rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-2">
                                <a href="../implementations/index.html" class="block px-4 py-2 text-sm hover:bg-navy-medium">Overview</a>
                                <a href="../implementations/business-cards.html" class="block px-4 py-2 text-sm hover:bg-navy-medium">Business Cards</a>
                            </div>
                        </div>
                    </div>
                    <a href="../impressum.html" class="nav-link font-body">Impressum</a>
                </div>'''
    
    content = re.sub(
        r'<div class="hidden md:flex items-center space-x-6">.*?</div>',
        desktop_nav,
        content,
        flags=re.DOTALL
    )
    
    # Update navigation - mobile
    mobile_nav = f'''<div class="nav-menu md:hidden" id="mobile-menu">
                <a href="../index.html" class="nav-link font-body block py-2">Home</a>
                <div class="pl-4">
                    <div class="font-body font-semibold text-aqua py-2">Fundamentals</div>
                    <a href="index.html" class="nav-link font-body block py-2 pl-4">Overview</a>
                    <a href="logos.html" class="nav-link {'active' if active == 'logos' else ''} font-body block py-2 pl-4">Logos</a>
                    <a href="colors.html" class="nav-link {'active' if active == 'colors' else ''} font-body block py-2 pl-4">Colors</a>
                    <a href="fonts.html" class="nav-link {'active' if active == 'fonts' else ''} font-body block py-2 pl-4">Fonts</a>
                </div>
                <div class="pl-4">
                    <div class="font-body font-semibold text-aqua py-2">Implementations</div>
                    <a href="../implementations/index.html" class="nav-link font-body block py-2 pl-4">Overview</a>
                    <a href="../implementations/business-cards.html" class="nav-link font-body block py-2 pl-4">Business Cards</a>
                </div>
                <a href="../impressum.html" class="nav-link font-body block py-2">Impressum</a>
            </div>'''
    
    content = re.sub(
        r'<div class="nav-menu md:hidden" id="mobile-menu">.*?</div>',
        mobile_nav,
        content,
        flags=re.DOTALL
    )
    
    dst_path.write_text(content, encoding='utf-8')
    print(f"Created {dst_path}")

print("All files moved and updated!")
