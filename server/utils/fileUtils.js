// načtení funkcí pro správu souborů
const fs = require("fs");
//  načtení funkcé pro průchod složkami v operačním systému
const path = require("path");
// definice cest k souboru db.json a ke složce data kam se ukládá první xml soubor při vytvoření žádosti
const DB_PATH = path.join(__dirname, "..", "db.json");
const DATA_DIR = path.join(__dirname, "..", "data");
// funkce pro uložení xmlobsahu do složky data, vkládám jako property název souboru a xml obsah
function saveXmlToFile(filename, xmlContent) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, xmlContent);
}
// funkce pro uložení metadat do db.json souboru
function saveMetadata(entry) {
  const raw = fs.readFileSync(DB_PATH);
  const db = JSON.parse(raw);
  db.push(entry);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
// exportování funkcí
module.exports = { saveXmlToFile, saveMetadata };