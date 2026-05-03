const fs = require('fs');
const path = require('path');

const dataPaths = {
    livret: 'src/data/knowledge/new_livret/principes_valeurs.json',
    formation: 'src/data/knowledge/formation/principes_et_valeurs.json',
    test: 'src/data/test_civic/principes_et_valeurs.json'
};

function analyzeFile(filePath, type) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\n--- Analysis of ${type} (${filePath}) ---`);
    
    if (type === 'livret') {
        console.log(`Array length: ${data.length}`);
        if (data.length > 0) {
            console.log(`Sample item keys: ${Object.keys(data[0]).join(', ')}`);
            console.log(`Sample item:`, JSON.stringify(data[0], null, 2).substring(0, 300) + '...');
        }
    } else {
        console.log(`ID: ${data.id || data.themeId}`);
        console.log(`Title: ${data.title || data.themeTitle}`);
        console.log(`Number of questions: ${data.questions ? data.questions.length : 0}`);
        if (data.questions && data.questions.length > 0) {
            console.log(`Sample question keys: ${Object.keys(data.questions[0]).join(', ')}`);
            console.log(`Sample question:`, JSON.stringify(data.questions[0], null, 2).substring(0, 300) + '...');
        }
    }
}

for (const [type, filePath] of Object.entries(dataPaths)) {
    analyzeFile(filePath, type);
}
