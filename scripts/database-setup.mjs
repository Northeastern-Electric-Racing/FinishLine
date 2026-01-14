import fs from 'fs/promises';

const filePath = './src/backend/.env';
const lineToAdd = 'DATABASE_URL="postgresql://postgres:docker@localhost:5432/nerpm?schema=public"';

async function setupDatabase() {
  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    // File doesn't exist, create it with the DATABASE_URL
    await fs.writeFile(filePath, lineToAdd, 'utf8');
    console.log('Created .env file with DATABASE_URL');
    return;
  }

  // File exists, read its contents
  const data = await fs.readFile(filePath, 'utf8');
  const lines = data.trim().split('\n');

  // Check if DATABASE_URL already exists
  for (const line of lines) {
    if (line.startsWith('DATABASE_URL=')) {
      console.log('DATABASE_URL already exists in .env file');
      return;
    }
  }

  // DATABASE_URL doesn't exist, append it
  await fs.appendFile(filePath, `\n${lineToAdd}`, 'utf8');
  console.log('Added DATABASE_URL to existing .env file');
}

await setupDatabase();
