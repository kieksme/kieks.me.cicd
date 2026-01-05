import { generateBusinessCardWithPdfLib } from './scripts/business-card-generator-pdflib.mjs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '.');

const testData = {
  name: 'Test User',
  position: 'Developer',
  email: 'test@kieks.me',
  phone: '+49 123 456789',
  mobile: '+49 123 4567890',
  website: 'www.kieks.me',
};

const outputDir = join(projectRoot, 'output');

console.log('Starting PDF generation...');
try {
  const result = await generateBusinessCardWithPdfLib(testData, outputDir);
  console.log('✅ Success!');
  console.log('Front:', result.front);
  console.log('Back:', result.back);
  console.log('JSON:', result.json);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
