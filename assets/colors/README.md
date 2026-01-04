# Colors

This directory contains color palette definitions and color-related assets.

## Available Files

- **Color swatches**: `.ase` files for Adobe Creative Suite
- **CSS/SCSS variables**: `.css` or `.scss` files with color definitions
- **JSON**: `.json` files for developers and applications
- **Palette images**: Visual reference images of the color palette

## Usage

### For Designers
Import the `.ase` (Adobe Swatch Exchange) file into your Adobe Creative Cloud applications (Photoshop, Illustrator, InDesign) to access the brand color palette.

### For Developers
Use the CSS/SCSS variables or JSON file in your web projects:

**CSS Example**:
```css
@import 'colors.css';

.button {
  background-color: var(--primary-color);
}
```

**SCSS Example**:
```scss
@import 'colors';

.button {
  background-color: $primary-color;
}
```

**JavaScript Example**:
```javascript
import colors from './colors.json';

const primaryColor = colors.primary;
```

## Color Palette

For complete color specifications including HEX, RGB, and CMYK values, refer to the [Color Palette Guidelines](../../guidelines/COLOR_PALETTE.md).

## Adding New Colors

When adding new colors to the palette:
1. Update the color definition files (ASE, CSS, JSON)
2. Ensure the color meets accessibility contrast requirements
3. Update the Color Palette Guidelines documentation
4. Generate new palette reference images if needed

---

*For detailed color usage guidelines, see [COLOR_PALETTE.md](../../guidelines/COLOR_PALETTE.md)*
