#!/usr/bin/env python3
import os
import re
from pathlib import Path

project_root = Path(__file__).parent.parent

# Navigation template for fundamentals pages
def get_navigation(active_page):
    """Generate navigation HTML with proper active state"""
    nav_items = {
        'logos': '<a href="logos.html" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-body">Logos</a>',
        'colors': '<a href="colors.html" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-body">Colors</a>',
        'fonts': '<a href="fonts.html" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-body">Fonts</a>',
    }
    
    # Desktop navigation
    desktop_nav = f'''                <div class="hidden md:flex items-center space-x-6">
                    <a href="../index.html" class="nav-link font-body">Home</a>
                    <div class="relative group">
                        <a href="index.html" class="nav-link {"active" if active_page in ["logos", "colors", "fonts"] else ""} font-body flex items-center">
                            Fundamentals
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </a>
                        <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-2">
                                {nav_items.get('logos', '')}
                                {nav_items.get('colors', '')}
                                {nav_items.get('fonts', '')}
                            </div>
                        </div>
                    </div>
                    <div class="relative group">
                        <a href="../implementations/index.html" class="nav-link font-body flex items-center">
                            Implementations
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </a>
                        <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-2">
                                <a href="../implementations/business-cards.html" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-body">Business Cards</a>
                            </div>
                        </div>
                    </div>
                    <a href="../impressum.html" class="nav-link font-body">Impressum</a>
                </div>'''
    
    # Mobile navigation
    mobile_nav = f'''            <div class="nav-menu md:hidden" id="mobile-menu">
                <a href="../index.html" class="nav-link font-body block py-2">Home</a>
                <a href="index.html" class="nav-link font-body block py-2">Fundamentals</a>
                <a href="logos.html" class="nav-link {"active" if active_page == "logos" else ""} font-body block py-2 pl-4">→ Logos</a>
                <a href="colors.html" class="nav-link {"active" if active_page == "colors" else ""} font-body block py-2 pl-4">→ Colors</a>
                <a href="fonts.html" class="nav-link {"active" if active_page == "fonts" else ""} font-body block py-2 pl-4">→ Fonts</a>
                <a href="../implementations/index.html" class="nav-link font-body block py-2">Implementations</a>
                <a href="../implementations/business-cards.html" class="nav-link font-body block py-2 pl-4">→ Business Cards</a>
                <a href="../impressum.html" class="nav-link font-body block py-2">Impressum</a>
            </div>'''
    
    return desktop_nav, mobile_nav

# Files to process
files_to_create = [
    {
        'src': 'app/colors.html',
        'dst': 'app/fundamentals/colors.html',
        'active': 'colors',
        'url_path': 'fundamentals/colors.html'
    },
    {
        'src': 'app/fonts.html',
        'dst': 'app/fundamentals/fonts.html',
        'active': 'fonts',
        'url_path': 'fundamentals/fonts.html'
    }
]

for file_info in files_to_create:
    src_path = project_root / file_info['src']
    dst_path = project_root / file_info['dst']
    active_page = file_info['active']
    url_path = file_info['url_path']
    
    # Read source file
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update relative paths
    content = content.replace('href="favicon.svg"', 'href="../favicon.svg"')
    content = content.replace('href="manifest.json"', 'href="../manifest.json"')
    content = content.replace('href="styles.css"', 'href="../styles.css"')
    content = content.replace('href="impressum.html"', 'href="../impressum.html"')
    content = content.replace('href="index.html"', 'href="../index.html"')
    
    # Update OpenGraph URLs
    old_url = f'https://kieksme.github.io/kieks.me.cicd/{active_page}.html'
    new_url = f'https://kieksme.github.io/kieks.me.cicd/{url_path}'
    content = content.replace(old_url, new_url)
    
    # Update canonical URL
    content = re.sub(
        r'<link rel="canonical" href="https://kieksme\.github\.io/kieks\.me\.cicd/[^"]+\.html">',
        f'<link rel="canonical" href="https://kieksme.github.io/kieks.me.cicd/{url_path}">',
        content
    )
    
    # Update JSON-LD structured data URL
    content = re.sub(
        r'"url": "https://kieksme\.github\.io/kieks\.me\.cicd/[^"]+\.html"',
        f'"url": "https://kieksme.github.io/kieks.me.cicd/{url_path}"',
        content
    )
    
    # Get navigation HTML
    desktop_nav, mobile_nav = get_navigation(active_page)
    
    # Replace navigation sections
    # Desktop navigation
    content = re.sub(
        r'<div class="hidden md:flex items-center space-x-6">.*?</div>',
        desktop_nav,
        content,
        flags=re.DOTALL
    )
    
    # Mobile navigation
    content = re.sub(
        r'<div class="nav-menu md:hidden" id="mobile-menu">.*?</div>',
        mobile_nav,
        content,
        flags=re.DOTALL
    )
    
    # Update logo link in nav
    content = content.replace(
        '<a href="index.html">',
        '<a href="../index.html">'
    )
    
    # Write updated file
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Created {dst_path}")

print("Done!")
