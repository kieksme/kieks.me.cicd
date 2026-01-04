# Fonts

This directory contains typography assets including font files and type-related resources.

## Directory Contents

- **Font files**: `.woff`, `.woff2`, `.ttf`, `.otf` formats
- **License files**: Font licenses and usage rights
- **Specimen sheets**: Visual examples of typeface usage

## Font Formats

### Web Fonts
- **WOFF2**: Modern, compressed format (preferred for web)
- **WOFF**: Web Open Font Format (fallback for older browsers)

### Desktop Fonts
- **TTF**: TrueType Font (cross-platform)
- **OTF**: OpenType Font (advanced features)

## Installation

### For Web Projects
Include fonts in your CSS:
```css
@font-face {
  font-family: 'BrandFont';
  src: url('path/to/font.woff2') format('woff2'),
       url('path/to/font.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### For Desktop Use
1. Download the `.ttf` or `.otf` file
2. Double-click the font file
3. Click "Install Font"
4. Restart your applications

## Typography Guidelines

For complete typography specifications including:
- Font families and weights
- Type scale and sizes
- Line heights and spacing
- Usage guidelines

See the [Typography Guidelines](../../guidelines/TYPOGRAPHY.md).

## Font Licensing

⚠️ **Important**: Always review the font license before using:
- Check if fonts can be embedded in documents/websites
- Verify if fonts can be shared with clients or vendors
- Ensure compliance with commercial use restrictions
- Keep license files with font files

## Adding New Fonts

When adding new fonts:
1. Include all necessary weights and styles
2. Add license documentation
3. Generate web font formats (WOFF2, WOFF)
4. Update the Typography Guidelines
5. Create a specimen sheet for reference

---

*For detailed typography guidelines, see [TYPOGRAPHY.md](../../guidelines/TYPOGRAPHY.md)*
