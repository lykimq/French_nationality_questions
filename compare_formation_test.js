const fs = require('fs');

const formation = JSON.parse(fs.readFileSync('src/data/knowledge/formation/principes_et_valeurs.json', 'utf8')).questions;
const test = JSON.parse(fs.readFileSync('src/data/test_civic/principes_et_valeurs.json', 'utf8')).questions;

console.log("\n--- TEST SAMPLE ---");
for(let i=0; i<3; i++) console.log(test[i].question);

