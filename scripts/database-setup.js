const fs = require('fs');

const filePath = './src/backend/.env';

// lines to add
const dbLine = 'DATABASE_URL="postgresql://postgres:docker@localhost:5432/nerpm?schema=public"';
const encryptionLine = 'ENCRYPTION_KEY="e4416f4086e08ec8974fb59f6ad3426d64ee5dac92f4b0c349552e21f7aa32a3"'

if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${dbLine}\n${encryptionLine}`, 'utf8');
    return;
}

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split file contents into lines
    const lines = data.trim().split('\n');
    const linesToAdd = [];

    // Check if the DATABASE_URL line is missing.
    if (!lines.some(line => line.startsWith('DATABASE_URL='))) {
        linesToAdd.push(dbLine);
    }
    
    // Check if the ENCRYPTION_KEY line is missing.
    if (!lines.some(line => line.startsWith('ENCRYPTION_KEY='))) {
        linesToAdd.push(encryptionLine);
    }

    // Appending any missing lines
    if (linesToAdd.length > 0) {
        fs.appendFile(filePath, `\n${linesToAdd.join('\n')}`, 'utf8', (err) => {
            if (err) {
                console.error('Error appending line to file:', err);
                return;
            }
        });
    }
});
