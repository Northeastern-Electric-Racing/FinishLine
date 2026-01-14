import fs from 'fs/promises';

const filePath = './src/backend/.env';
const lineToAdd = 'DATABASE_URL="postgresql://postgres:docker@localhost:5433/nerpm?schema=public"';

async function setupTest() {
  const data = await fs.readFile(filePath, 'utf8');
  const lines = data.trim().split('\n');

  // Check if the last line matches the lineToAdd
  if (lines[lines.length - 1] !== lineToAdd) {
    // Append the line if it's not already the last line
    await fs.appendFile(filePath, `\n${lineToAdd}`, 'utf8');
    console.log('Added test DATABASE_URL to .env file');
  } else {
    console.log('Test DATABASE_URL already present in .env file');
  }
}

await setupTest();
