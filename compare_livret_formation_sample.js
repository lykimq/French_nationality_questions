const fs = require('fs');

const livret = JSON.parse(fs.readFileSync('src/data/knowledge/new_livret/principes_valeurs.json', 'utf8')).questions;
const formation = JSON.parse(fs.readFileSync('src/data/knowledge/formation/principes_et_valeurs.json', 'utf8')).questions;

console.log("--- LIVRET SAMPLE ---");
for(let i=0; i<3; i++) console.log(livret[i].question);

console.log("\n--- FORMATION SAMPLE ---");
for(let i=0; i<3; i++) console.log(formation[i].question);

