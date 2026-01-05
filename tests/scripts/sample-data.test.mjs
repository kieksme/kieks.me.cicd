#!/usr/bin/env node
/**
 * Tests for sample-data.mjs
 */

import { sampleContacts, getSampleContact, getSampleContactNames } from '../../scripts/sample-data.mjs';

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
    console.log('\nSample Data Module Tests\n');
    let passed = 0;
    let failed = 0;
    
    for (const { name, fn } of results) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        passed++;
      } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\nTests: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }
  
  return { test, run };
}

const { test, run } = await runTests();

test('should export sampleContacts array', () => {
  assert(Array.isArray(sampleContacts), 'sampleContacts should be an array');
  assert(sampleContacts.length > 0, 'sampleContacts should not be empty');
});

test('should have required fields in sample contacts', () => {
  sampleContacts.forEach(contact => {
    assert(contact.name, 'Contact should have name');
    assert(typeof contact.name === 'string', 'Name should be a string');
  });
});

test('getSampleContact should return contact by name', () => {
  const contact = getSampleContact('Anna Schmidt');
  assert(contact !== null, 'Should find Anna Schmidt');
  assert(contact.name === 'Anna Schmidt', 'Should return correct contact');
});

test('getSampleContact should return null for non-existent contact', () => {
  const contact = getSampleContact('Non Existent');
  assert(contact === null, 'Should return null for non-existent contact');
});

test('getSampleContactNames should return array of names', () => {
  const names = getSampleContactNames();
  assert(Array.isArray(names), 'Should return an array');
  assert(names.length === sampleContacts.length, 'Should return all names');
  assert(names.includes('Max Mustermann'), 'Should include Max Mustermann');
  assert(names.includes('Anna Schmidt'), 'Should include Anna Schmidt');
  assert(names.includes('Tom Weber'), 'Should include Tom Weber');
});

test('sample contacts should have valid email format', () => {
  sampleContacts.forEach(contact => {
    if (contact.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      assert(emailRegex.test(contact.email), `Invalid email: ${contact.email}`);
    }
  });
});

const success = await run();
process.exit(success ? 0 : 1);
