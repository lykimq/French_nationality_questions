const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/knowledge/new_livret/principes_valeurs.json', 'utf8'));
console.log(`Keys in root object: ${Object.keys(data).join(', ')}`);
if (data.questions) {
    console.log(`Number of questions: ${data.questions.length}`);
    console.log(`Sample question keys: ${Object.keys(data.questions[0]).join(', ')}`);
} else {
    console.log(`Sample data: ${JSON.stringify(data).substring(0, 200)}`);
}
