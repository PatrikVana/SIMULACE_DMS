// express knihovna pro vytvoření serveru
const express = require("express");
// cors knihovna pro přístup z jiného portu
const cors = require("cors");
// knihovny pro práci se soubory a cestami
const fs = require("fs");
const path = require("path");
// rozšíření express knihovny o GraphQL endpointy
const { ApolloServer, gql } = require("apollo-server-express");
// import funkce pro převod json souboru na xml
const { generateXML } = require("./utils/xmlUtils");

const { saveXmlToFile, saveMetadata } = require("./utils/fileUtils");
// knihovn pro vygenerování unikátního id pro každou odeslanou žádost
const { v4: uuidv4 } = require("uuid");
// konverze XML na js objekt
const xml2js = require("xml2js");

// vytvoření instance serveru a nastavení portu
const app = express();
const PORT = 5000;

/*uložení cest ke složkám do proměných, 
přístup k metadatům v souboru db.json,
přístup do složky data(uložení xml souboru při odeslání žádosti),
přístup do složky approved (přesunutí upraveného xml souboru po schválení žádosti),
přístup do složky rejected (přesunutí upraveného xml souboru po zamítnutí žádosti)
 */
const DB_PATH = path.join(__dirname, "db.json");
const DATA_DIR = path.join(__dirname, "data");
const APPROVED_DIR = path.join(__dirname, "approved");
const REJECTED_DIR = path.join(__dirname, "rejected");

// povolení volání z frontendu z jiného portu
app.use(cors());
// zpracuje app/json tělo requestu
app.use(express.json());

// GraphQL schema pro apollo server, definování datových typů v requestu a request pro načtení dat z db.json
const typeDefs = gql`
  type Request {
    id: ID!
    firstName: String!
    lastName: String!
    department: String!
    destination: String!
    approved: Boolean
    timestamp: String!
  }

  type Query {
    requests: [Request]
  }
`;

/* zavolání query, a načtení dat z db.json pomocí nastavené cesty a vrácení dat,
chybí validace dat, kontrola role případně filtrování 
*/
const resolvers = {
  Query: {
    requests: () => {
      const raw = fs.readFileSync(DB_PATH);
      return JSON.parse(raw);
    },
  },
};

// Apollo server - vytvoření serveru a jeho puštění s vloženým schématem + připojení k expresu na /graphql
async function startApolloServer() {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  /*zaslání requestu pomocí formuláře =
  - načtení dat z těla requvestu,
  - vygenerování id,
  - vytvoření filename primárně z id a stringu,
  - vygenerování xml souboru pomocí načtené funkce(soubor xmlUtils) z dat z těla requestu,
  - uložení xml do složky data pomocí načtené funkce, jako property vkládám název souboru a vygenerovaný xml souboru,
  - vytvoření metadat, načtení id, název souboru, data z těla requestu, status approved nastavený na null, a vytvoření záznamu času vytvoření,
  - uložení metadat do db.json pomocí načtené funkce,
  - vrácení odpovědi, v případě úspěchu vracím json zprávu o uložení a id, v případě neúspěchu vracím error zprávu,
  - 
  */
  app.post("/submit-form", (req, res) => {
    try {
      const data = req.body;
      const id = uuidv4();
      const filename = `request-${id}.xml`;
      const xml = generateXML(data);
      saveXmlToFile(filename, xml);

      const metadata = {
        id,
        filename,
        ...data,
        approved: null,
        timestamp: new Date().toISOString(),
      };
      saveMetadata(metadata);

      res.status(201).json({ message: "Žádost byla uložena.", id });
    } catch (error) {
      console.error("Chyba při uložení žádosti:", error);
      res.status(500).json({ error: "Chyba při ukládání žádosti." });
    }
  });

  /*Správa souboru xml a doplnění metadat na základě schválení nebo zamítnutí žádosti =
  - načtení id a rozhodnutí zda byla žádost schválena (true/false),
  - dotažení dat z db.json jako json,
  - filtrování a načtení záznamu podle id z requestu,
  - kontrola zda záznam existuje,
  - nastavení hodnoty approved na hodnotu z requestu,
  - zapsání upraveného objektu zpátky do db.json,
  - načtení cesty k původnímu xml dokumentu,
  - načtení obsahu tohoto xml souboru jako string,
  - převod xml ve stringu do js objektu pomocí knihovny xml2js,
  - přidání nebo aktualizace hodnoty approved do objektu,
  - převod objektu zpět na XML,
  - Vytvoření nového XML stringu, který obsahuje aktualizovanou hodnotu approved.
  - rozhodnutí do jaké složky se má XML uložit,
  - sestavení kompletní cesty pro uložení,
  - zápis XML do cílové složky,
  - odstranění původního XML souboru ze složky data,
  - vrácení odpovědi, v případě úspěchu vracím json zprávu o zpracování žádosti, v případě neúspěchu vracím error zprávu,
*/
  app.post("/decision", async (req, res) => {
    const { id, approve } = req.body;
    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH));
      const record = db.find(r => r.id === id);
      if (!record) return res.status(404).json({ error: "Záznam nenalezen" });

      record.approved = approve;
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

      const xmlPath = path.join(DATA_DIR, record.filename);
      const xml = fs.readFileSync(xmlPath, "utf-8");
      const parsed = await xml2js.parseStringPromise(xml);
      parsed.TravelRequest.approved = [approve.toString()];

      const builder = new xml2js.Builder();
      const updatedXml = builder.buildObject(parsed);

      const targetDir = approve ? APPROVED_DIR : REJECTED_DIR;
      const targetPath = path.join(targetDir, record.filename);
      fs.writeFileSync(targetPath, updatedXml);
      fs.unlinkSync(xmlPath);

      res.json({ message: "Rozhodnutí zpracováno." });
    } catch (error) {
      console.error("Chyba při rozhodnutí:", error);
      res.status(500).json({ error: "Chyba při rozhodnutí." });
    }
  });

  // Spuštění HTTP serverů
  app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
    console.log(`GraphQL na http://localhost:${PORT}/graphql`);
  });
}

startApolloServer();
