const fs = require('fs');

const filePath = './src/backend/.env';
const lineToAdd = 'DATABASE_URL="postgresql://postgres:docker@localhost:5432/nerpm?schema=public"';

if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, lineToAdd, 'utf8');
    return;
}

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split file contents into lines
    const lines = data.trim().split('\n');

    for (const line of lines) {
        //db url already exists, no need to add it
        if (line.startsWith("DATABASE_URL=")) return;
    }

    fs.appendFile(filePath, `\n${lineToAdd}`, 'utf8', (err) => {
        if (err) {
            console.error('Error appending line to file:', err);
            return;
        }
    });
});
