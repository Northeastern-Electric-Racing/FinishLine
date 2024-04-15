const fs = require('fs');

const filePath = './src/backend/.env';
const lineToMatch = 'DATABASE_URL="postgresql://postgres:docker@localhost:5433/nerpm?schema=public"';

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split file contents into lines
    const lines = data.trim().split('\n');

    // Check if the last line matches the lineToMatch
    if (lines[lines.length - 1] === lineToMatch) {
        // Remove the last line
        lines.pop();

        // Write modified contents back to the file
        fs.writeFile(filePath, lines.join('\n'), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
        });
    } 
});
