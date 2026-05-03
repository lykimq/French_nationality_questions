const fs = require('fs');

const livret = JSON.parse(fs.readFileSync('src/data/knowledge/new_livret/principes_valeurs.json', 'utf8')).questions;
const formation = JSON.parse(fs.readFileSync('src/data/knowledge/formation/principes_et_valeurs.json', 'utf8')).questions;

const livretQs = livret.map(q => q.question.trim());
const formationQs = formation.map(q => q.question.trim());

let exactMatches = 0;
formationQs.forEach(fq => {
    if (livretQs.includes(fq)) {
        exactMatches++;
    }
});

console.log(`Livret questions: ${livret.length}`);
console.log(`Formation questions: ${formation.length}`);
console.log(`Exact question text matches between Livret and Formation: ${exactMatches}`);

