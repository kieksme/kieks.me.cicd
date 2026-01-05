#!/usr/bin/env node
/**
 * Test Puppeteer installation
 */

import puppeteer from 'puppeteer';

async function testPuppeteer() {
  console.log('Testing Puppeteer...');
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log('✓ Browser launched successfully');
    
    const page = await browser.newPage();
    await page.setContent('<html><body><h1>Test</h1></body></html>');
    
    console.log('✓ Page created successfully');
    
    await browser.close();
    console.log('✓ Browser closed successfully');
    console.log('✅ Puppeteer is working!');
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Puppeteer test failed:', err.message);
    process.exit(1);
  }
}

testPuppeteer();
