#!/usr/bin/env node
/**
 * Avatar Generator
 * Generates square avatar images from cut-out portraits with brand color backgrounds
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve, extname, basename } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import sharp from 'sharp';
import {
  header,
  success,
  error,
  info,
  warn,
} from './misc-cli-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Brand colors from colors.json
const BRAND_COLORS = {
  aqua: '#00FFDC',
  navy: '#1E2A45',
  fuchsia: '#FF008F',
};

/**
 * Load brand colors from colors.json
 * @returns {Object} Brand colors object
 */
function loadBrandColors() {
  try {
    const colorsPath = join(projectRoot, 'assets', 'colors', 'colors.json');
    const colorsData = JSON.parse(readFileSync(colorsPath, 'utf-8'));
    return {
      aqua: colorsData.selection.aqua.hex,
      navy: colorsData.selection.navy.hex,
      fuchsia: colorsData.selection.fuchsia.hex,
    };
  } catch (err) {
    warn(`Could not load colors.json, using defaults: ${err.message}`);
    return BRAND_COLORS;
  }
}

/**
 * Parse hex color to RGB
 * @param {string} hex - Hex color string (e.g., "#00FFDC")
 * @returns {Object} RGB object with r, g, b values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generate square avatar with brand color background
 * @param {string} portraitPath - Path to cut-out portrait image (PNG with transparency)
 * @param {string} colorName - Brand color name (aqua, navy, fuchsia)
 * @param {number} size - Output size in pixels (square)
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
async function generateAvatar(portraitPath, colorName, size, outputPath) {
  try {
    // Validate inputs
    if (!existsSync(portraitPath)) {
      throw new Error(`Portrait image not found: ${portraitPath}`);
    }

    const colors = loadBrandColors();
    const colorHex = colors[colorName.toLowerCase()];
    if (!colorHex) {
      throw new Error(
        `Invalid color: ${colorName}. Must be one of: aqua, navy, fuchsia`
      );
    }

    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error(`Invalid size: ${size}. Must be a positive integer`);
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    info(`Generating ${size}x${size}px avatar with ${colorName} background...`);

    // Get portrait image metadata
    const portraitMetadata = await sharp(portraitPath).metadata();
    const portraitWidth = portraitMetadata.width;
    const portraitHeight = portraitMetadata.height;

    // Calculate portrait size to fill the square (with some padding if needed)
    // Portrait will fill the square, centered, with cropping if needed
    const targetSize = size;
    
    // Resize portrait to fill the square (cover strategy)
    // This will maintain aspect ratio and crop if needed
    const resizedPortrait = await sharp(portraitPath)
      .resize(targetSize, targetSize, {
        fit: 'cover', // Fill the square, cropping if needed
        position: 'center', // Center the crop
      })
      .toBuffer();

    // Create colored background
    const rgb = hexToRgb(colorHex);
    if (!rgb) {
      throw new Error(`Invalid color hex: ${colorHex}`);
    }

    // Create square background with brand color
    const background = sharp({
      create: {
        width: size,
        height: size,
        channels: 4, // RGBA
        background: { r: rgb.r, g: rgb.g, b: rgb.b, alpha: 1 },
      },
    });

    // Composite portrait on top of background
    const avatar = await background
      .composite([
        {
          input: resizedPortrait,
          blend: 'over', // Standard alpha blending
        },
      ])
      .png()
      .toBuffer();

    // Write output file
    writeFileSync(outputPath, avatar);

    success(`Avatar generated successfully: ${outputPath}`);
    info(`Size: ${size}x${size}px`);
    info(`Color: ${colorName} (${colorHex})`);
  } catch (err) {
    error(`Failed to generate avatar: ${err.message}`);
    throw err;
  }
}

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    portrait: null,
    color: null,
    size: 512,
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--portrait' && i + 1 < args.length) {
      parsed.portrait = args[++i];
    } else if (arg === '--color' && i + 1 < args.length) {
      parsed.color = args[++i].toLowerCase();
    } else if (arg === '--size' && i + 1 < args.length) {
      parsed.size = parseInt(args[++i], 10);
    } else if (arg === '--output' && i + 1 < args.length) {
      parsed.output = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      return { help: true };
    }
  }

  return parsed;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${header('Avatar Generator')}

Usage:
  node scripts/avatar-generator.mjs --portrait <path> --color <color> [options]

Options:
  --portrait <path>    Path to cut-out portrait image (PNG with transparency) [required]
  --color <color>      Brand color: aqua, navy, or fuchsia [required]
  --size <pixels>      Output size in pixels (square, default: 512)
  --output <path>      Output file path [required]
  --help, -h           Show this help message

Examples:
  # Generate 512x512px avatar with aqua background
  node scripts/avatar-generator.mjs \\
    --portrait path/to/portrait.png \\
    --color aqua \\
    --size 512 \\
    --output output/avatar-aqua-512.png

  # Generate 256x256px avatar with navy background
  node scripts/avatar-generator.mjs \\
    --portrait path/to/portrait.png \\
    --color navy \\
    --size 256 \\
    --output output/avatar-navy-256.png

Brand Colors:
  - aqua:    #00FFDC
  - navy:    #1E2A45
  - fuchsia: #FF008F
`);
}

/**
 * Main function
 */
async function main() {
  try {
    const args = parseArgs();

    if (args.help) {
      showHelp();
      process.exit(0);
    }

    // Validate required arguments
    if (!args.portrait) {
      error('Missing required argument: --portrait');
      showHelp();
      process.exit(1);
    }

    if (!args.color) {
      error('Missing required argument: --color');
      showHelp();
      process.exit(1);
    }

    if (!args.output) {
      error('Missing required argument: --output');
      showHelp();
      process.exit(1);
    }

    // Validate color
    const validColors = ['aqua', 'navy', 'fuchsia'];
    if (!validColors.includes(args.color)) {
      error(`Invalid color: ${args.color}. Must be one of: ${validColors.join(', ')}`);
      process.exit(1);
    }

    // Generate avatar
    await generateAvatar(args.portrait, args.color, args.size, args.output);

    success('Avatar generation completed!');
  } catch (err) {
    error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateAvatar, loadBrandColors, hexToRgb };
