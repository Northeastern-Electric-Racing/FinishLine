const fs = require('fs');

const filePath = './src/backend/.env';
const requiredLines = [
    'DATABASE_URL="postgresql://postgres:docker@localhost:5433/nerpm?schema=public"',
    'ENCRYPTION_KEY="e4416f4086e08ec8974fb59f6ad3426d64ee5dac92f4b0c349552e21f7aa32a3"'
];

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split file contents into lines
    const lines = data.trim().split('\n');
    const linesToAdd = requiredLines.filter((line) => !lines.includes(line));

    // Check if there are lines to add
    if (linesToAdd.length > 0) {
        // Append the line if it's not already the last line
        fs.appendFile(filePath, `\n${linesToAdd.join('\n')}`, 'utf8', (err) => {
            if (err) {
                console.error('Error appending line to file:', err);
                return;
            }
        });
    }
});
