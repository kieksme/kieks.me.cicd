#!/usr/bin/env node
/**
 * Tests for business-card-generator.mjs
 */

import { generateBusinessCard, generateVCard, validateContactData } from '../../scripts/business-card-generator.mjs';
import { getSampleContact } from '../../scripts/sample-data.mjs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTests() {
  const results = [];
  
  function test(name, fn) {
    results.push({ name, fn });
  }
  
  async function run() {
    console.log('\nBusiness Card Generator (HTML) Tests\n');
    let passed = 0;
    let failed = 0;
    
    for (const { name, fn } of results) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        passed++;
      } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        if (error.stack) {
          console.error(error.stack.split('\n').slice(0, 3).join('\n'));
        }
        failed++;
      }
    }
    
    console.log(`\nTests: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }
  
  return { test, run };
}

const { test, run } = await runTests();

test('should generate vCard string', () => {
  const contact = getSampleContact('Anna Schmidt');
  const vCard = generateVCard(contact);
  
  assert(vCard.includes('BEGIN:VCARD'), 'vCard should start with BEGIN:VCARD');
  assert(vCard.includes('END:VCARD'), 'vCard should end with END:VCARD');
  assert(vCard.includes(contact.name), 'vCard should contain name');
  assert(vCard.includes(contact.email), 'vCard should contain email');
});

test('should validate contact data', () => {
  const validContact = getSampleContact('Max Mustermann');
  const validation = validateContactData(validContact);
  
  assert(validation.isValid === true, 'Valid contact should pass validation');
  assert(validation.errors.length === 0, 'Valid contact should have no errors');
});

test('should reject invalid contact data', () => {
  const invalidContact = { name: '' };
  const validation = validateContactData(invalidContact);
  
  assert(validation.isValid === false, 'Invalid contact should fail validation');
  assert(validation.errors.length > 0, 'Invalid contact should have errors');
});

const success = await run();
process.exit(success ? 0 : 1);
