# Business Card Templates

This directory contains HTML/CSS templates for generating business cards.

## Files

- `business-card-front.html` - Front side template with contact information
- `business-card-back.html` - Back side template with QR code
- `business-card-styles.css` - Stylesheet for business cards

## Template Syntax

The templates use a simple template engine with the following syntax:

### Variables

Replace `{{variableName}}` with actual values:

```html
<div class="name">{{name}}</div>
```

### Conditionals

Use `{{#if variable}}...{{/if}}` to conditionally render content:

```html
{{#if email}}
<div class="contact-item">{{email}}</div>
{{/if}}
```

## Available Variables

- `name` - Full name (required)
- `position` - Job title/position
- `email` - Email address
- `phone` - Phone number
- `mobile` - Mobile number
- `address` - Street address
- `postalCode` - Postal code
- `city` - City
- `country` - Country
- `website` - Website URL
- `socialMedia` - Social media information
- `logoPath` - Logo image (base64 data URI)
- `qrCodeDataUri` - QR code image (base64 data URI)

## Card Dimensions

Standard business card size: **85mm x 55mm** (336px x 212px at 100 DPI)

## Brand Guidelines

The templates follow kieks.me brand guidelines:
- Colors from `assets/colors/colors.json`
- Typography: Hanken Grotesk (headings), Source Sans 3 (body)
- Logo: kieks.me horizontal aqua dark variant

## Usage

Templates are used by the business card generator (`scripts/business-card-generator.mjs`). Do not edit templates directly unless you understand the template engine implementation.
