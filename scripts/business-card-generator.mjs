#!/usr/bin/env node
/**
 * Business Card Generator
 * Generates PDF business cards from templates with QR code containing vCard data
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import inquirer from 'inquirer';
import {
  header,
  success,
  error,
  info,
  cardProgress,
  validateContactData,
  normalizeUrl,
  endGroup,
} from './misc-cli-utils.mjs';

/**
 * Convert SVG file to data URI (URL-encoded for better compatibility)
 * @param {string} filePath - Path to SVG file
 * @returns {string} Data URI
 */
function svgToDataUri(filePath) {
  try {
    const svgContent = readFileSync(filePath, 'utf-8');
    // URL-encode SVG content (more reliable than base64 for SVG)
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  } catch (err) {
    throw new Error(`Logo konnte nicht geladen werden: ${err.message}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

/**
 * Generate vCard string from contact data
 * @param {Object} data - Contact data
 * @returns {string} vCard formatted string
 */
function generateVCard(data) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];

  if (data.name) {
    lines.push(`FN:${data.name}`);
    // Split name into parts if possible
    const nameParts = data.name.split(' ');
    if (nameParts.length >= 2) {
      lines.push(`N:${nameParts.slice(-1)[0]};${nameParts.slice(0, -1).join(' ')};;;`);
    } else {
      lines.push(`N:${data.name};;;;`);
    }
  }

  if (data.position) {
    lines.push(`TITLE:${data.position}`);
  }

  lines.push('ORG:kieks.me GbR');

  if (data.email) {
    lines.push(`EMAIL;TYPE=WORK,INTERNET:${data.email}`);
  }

  if (data.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${data.phone}`);
  }

  if (data.mobile) {
    lines.push(`TEL;TYPE=CELL:${data.mobile}`);
  }

  if (data.address || data.city || data.postalCode) {
    const addressParts = [
      '', // Post office box
      '', // Extended address
      data.address || '', // Street address
      data.city || '', // City
      '', // State
      data.postalCode || '', // Postal code
      data.country || 'Deutschland', // Country
    ];
    lines.push(`ADR;TYPE=WORK:${addressParts.join(';')}`);
  }

  if (data.website) {
    const url = normalizeUrl(data.website);
    lines.push(`URL:${url}`);
  }

  if (data.socialMedia) {
    // Add social media as note or URL
    lines.push(`NOTE:Social Media: ${data.socialMedia}`);
  }

  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Generate QR code as data URI
 * @param {string} vCardData - vCard formatted string
 * @returns {Promise<string>} Data URI of QR code image
 */
async function generateQRCode(vCardData) {
  try {
    const qrDataUri = await QRCode.toDataURL(vCardData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1,
    });
    return qrDataUri;
  } catch (err) {
    throw new Error(`QR-Code-Generierung fehlgeschlagen: ${err.message}`);
  }
}

/**
 * Simple template engine - replaces {{variable}} placeholders
 * Also supports {{#if variable}} …{{/if}} conditionals
 * @param {string} template - Template string
 * @param {Object} data - Data object
 * @returns {string} Rendered template
 */
function renderTemplate(template, data) {
  let result = template;

  // Handle conditionals {{#if variable}} …{{/if}}
  const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(conditionalRegex, (match, variable, content) => {
    if (data[variable] && data[variable].toString().trim() !== '') {
      return content;
    }
    return '';
  });

  // Replace simple placeholders {{variable}}
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  result = result.replace(placeholderRegex, (match, variable) => {
    return data[variable] || '';
  });

  return result;
}

/**
 * Load and render HTML template
 * @param {string} templatePath - Path to template file
 * @param {Object} data - Data to inject
 * @returns {string} Rendered HTML
 */
function loadTemplate(templatePath, data) {
  try {
    const template = readFileSync(templatePath, 'utf-8');
    return renderTemplate(template, data);
  } catch (err) {
    throw new Error(`Template konnte nicht geladen werden: ${err.message}`);
  }
}

/**
 * Generate PDF from HTML
 * @param {string} html - HTML content
 * @param {string} outputPath - Output PDF path
 * @returns {Promise<void>}
 */
async function generatePDF(html, outputPath) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
      ],
      timeout: 60000,
    });

    const page = await browser.newPage();
    
    // Set viewport - larger to accommodate crop marks
    await page.setViewport({
      width: 359, // 91mm at 100 DPI
      height: 241, // 61mm at 100 DPI
      deviceScaleFactor: 1,
    });
    
    // Set timeouts
    page.setDefaultNavigationTimeout(20000);
    page.setDefaultTimeout(20000);
    
    // Set content - use networkidle0 but with shorter timeout
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    }).catch(() => {
      // Fallback: if networkidle0 fails, try with load
      return page.setContent(html, {
        waitUntil: 'load',
        timeout: 10000,
      });
    });

    // Wait for rendering (waitForTimeout was removed in newer Puppeteer versions)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF with business card dimensions
    await page.pdf({
      path: outputPath,
      width: '85mm',
      height: '55mm',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      timeout: 30000,
    });
  } catch (err) {
    throw new Error(`PDF-Generierung fehlgeschlagen: ${err.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        // Ignore close errors
      }
    }
  }
}

/**
 * Prompt user for contact data
 * @returns {Promise<Object>} Contact data object
 */
async function promptContactData() {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Name (erforderlich):',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Name ist erforderlich';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'position',
      message: 'Position/Titel:',
    },
    {
      type: 'input',
      name: 'email',
      message: 'E-Mail-Adresse:',
      validate: (input) => {
        if (!input) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Ungültige E-Mail-Adresse';
      },
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Telefonnummer:',
    },
    {
      type: 'input',
      name: 'mobile',
      message: 'Mobilnummer:',
    },
    {
      type: 'input',
      name: 'address',
      message: 'Straße und Hausnummer:',
    },
    {
      type: 'input',
      name: 'postalCode',
      message: 'Postleitzahl:',
    },
    {
      type: 'input',
      name: 'city',
      message: 'Stadt:',
    },
    {
      type: 'input',
      name: 'country',
      message: 'Land:',
      default: 'Deutschland',
    },
    {
      type: 'input',
      name: 'website',
      message: 'Website (mit oder ohne https://):',
    },
    {
      type: 'input',
      name: 'socialMedia',
      message: 'Social Media (z.B. LinkedIn, Twitter):',
    },
  ];

  return await inquirer.prompt(questions);
}

/**
 * Generate business card PDFs
 * @param {Object} contactData - Contact data
 * @param {string} outputDir - Output directory
 * @returns {Promise<void>}
 */
async function generateBusinessCard(contactData, outputDir) {
  // Validate data
  const validation = validateContactData(contactData);
  if (!validation.isValid) {
    error('Validierungsfehler:');
    validation.errors.forEach((err) => error(`  - ${err}`));
    throw new Error('Kontaktdaten sind ungültig');
  }

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Generate vCard
  cardProgress('Generiere vCard-Daten …', 'generating');
  const vCardData = generateVCard(contactData);
  cardProgress('vCard-Daten generiert', 'done');

  // Generate QR code
  cardProgress('Generiere QR-Code …', 'generating');
  const qrCodeDataUri = await generateQRCode(vCardData);
  cardProgress('QR-Code generiert', 'done');

  // Load logo as SVG content
  const logoPath = join(projectRoot, 'assets', 'logos', 'kieks.me-single-circle.svg');
  cardProgress('Lade Logo …', 'generating');
  const logoSvgContent = readFileSync(logoPath, 'utf-8');
  const logoDataUri = svgToDataUri(logoPath);
  cardProgress('Logo geladen', 'done');

  // Prepare template data
  const templateData = {
     ...contactData,
    qrCodeDataUri,
    logoPath: logoDataUri,
    logoSvgContent: logoSvgContent, // Also provide raw SVG for inline embedding
  };

  // Normalize website URL
  if (templateData.website) {
    templateData.website = normalizeUrl(templateData.website);
  }

  // Generate front side
  cardProgress('Generiere Vorderseite …', 'generating');
  const frontTemplatePath = join(projectRoot, 'assets', 'templates', 'business-card-front.html');
  const frontHtml = loadTemplate(frontTemplatePath, templateData);
  
  // Inject CSS
  const cssPath = join(projectRoot, 'assets', 'templates', 'business-card-styles.css');
  const css = readFileSync(cssPath, 'utf-8');
  const frontHtmlFinal = frontHtml.replace(
    '<link rel="stylesheet" href="business-card-styles.css">',
    `<style>${css}</style>`
  );

  const frontOutputPath = join(outputDir, `${contactData.name.replace(/\s+/g, '-')}-front.pdf`);
  try {
    await generatePDF(frontHtmlFinal, frontOutputPath);
    cardProgress(`Vorderseite gespeichert: ${frontOutputPath}`, 'done');
  } catch (err) {
    cardProgress(`Fehler bei Vorderseite: ${err.message}`, 'error');
    throw err;
  }

  // Generate back side
  cardProgress('Generiere Rückseite …', 'generating');
  const backTemplatePath = join(projectRoot, 'assets', 'templates', 'business-card-back.html');
  const backHtml = loadTemplate(backTemplatePath, templateData);
  
  // Inject CSS
  const backHtmlFinal = backHtml.replace(
    '<link rel="stylesheet" href="business-card-styles.css">',
    `<style>${css}</style>`
  );

  const backOutputPath = join(outputDir, `${contactData.name.replace(/\s+/g, '-')}-back.pdf`);
  try {
    await generatePDF(backHtmlFinal, backOutputPath);
    cardProgress(`Rückseite gespeichert: ${backOutputPath}`, 'done');
  } catch (err) {
    cardProgress(`Fehler bei Rückseite: ${err.message}`, 'error');
    throw err;
  }

  return {
    front: frontOutputPath,
    back: backOutputPath,
  };
}

/**
 * Main function
 */
async function main() {
  try {
    header('Business Card Generator', 'Generiere Visitenkarten mit QR-Code', 'bgCyan');

    // Prompt for contact data
    info('Bitte geben Sie die Kontaktdaten ein:');
    const contactData = await promptContactData();

    // Determine output directory
    const outputDir = join(projectRoot, 'output');
    
    // Generate business cards
    const result = await generateBusinessCard(contactData, outputDir);

    endGroup();
    success('Visitenkarten erfolgreich generiert!');
    info(`Vorderseite: ${result.front}`);
    info(`Rückseite: ${result.back}`);
  } catch (err) {
    endGroup();
    error(`Fehler: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly (check if this file is being executed, not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]);
if (isMainModule) {
  main();
}

export {
  generateBusinessCard,
  generateVCard,
  generateQRCode,
  promptContactData,
};
