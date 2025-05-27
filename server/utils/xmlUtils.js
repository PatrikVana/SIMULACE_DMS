// načtení knihovny pro převod js objektu na XML 
const js2xmlparser = require("js2xmlparser");
// funkce pro převod js objektu na XML
function generateXML(jsonData) {
  return js2xmlparser.parse("TravelRequest", jsonData);
}
// exportování funkce
module.exports = { generateXML };