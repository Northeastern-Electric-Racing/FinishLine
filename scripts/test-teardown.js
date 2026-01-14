import fs from 'fs/promises';

const filePath = './src/backend/.env';
const lineToMatch = 'DATABASE_URL="postgresql://postgres:docker@localhost:5433/nerpm?schema=public"';

async function teardownTest() {
  const data = await fs.readFile(filePath, 'utf8');
  const lines = data.trim().split('\n');

  // Check if the last line matches the lineToMatch
  if (lines[lines.length - 1] === lineToMatch) {
    // Remove the last line
    lines.pop();

    // Write modified contents back to the file
    await fs.writeFile(filePath, lines.join('\n'), 'utf8');
    console.log('Removed test DATABASE_URL from .env file');
  } else {
    console.log('Test DATABASE_URL not found as last line in .env file');
  }
}

await teardownTest();
