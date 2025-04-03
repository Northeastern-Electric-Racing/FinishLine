const fs = require('fs');

const filePath = './src/backend/.env';
const linesToRemove = [
    'DATABASE_URL="postgresql://postgres:docker@localhost:5433/nerpm?schema=public"',
    'ENCRYPTION_KEY="e4416f4086e08ec8974fb59f6ad3426d64ee5dac92f4b0c349552e21f7aa32a3"'
];

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Remove any lines that match the test-specific ones
    let lines = data.trim().split('\n');
    lines = lines.filter((line) => !linesToRemove.includes(line));

    // Write the updated contents back to the file
    fs.writeFile(filePath, lines.join('\n'), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
    });
});
