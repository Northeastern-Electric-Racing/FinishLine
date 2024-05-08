const fs = require('fs');

const filePath = './src/backend/.env';
const lineToAdd = 'DATABASE_URL="postgresql://postgres:docker@localhost:5433/nerpm?schema=public"';

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split file contents into lines
    const lines = data.trim().split('\n');

    // Check if the last line matches the lineToAdd
    if (lines[lines.length - 1] !== lineToAdd) {
        // Append the line if it's not already the last line
        fs.appendFile(filePath, `\n${lineToAdd}`, 'utf8', (err) => {
            if (err) {
                console.error('Error appending line to file:', err);
                return;
            }
        });
    }
});
