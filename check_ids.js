const fs = require('fs');
const path = require('path');

const dir = 'src/data/knowledge/new_livret/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (data.questions && data.questions.length > 0) {
        console.log(`File: ${file}, first 3 IDs: ${data.questions.map(q => q.id).slice(0, 3).join(', ')}`);
    }
}

