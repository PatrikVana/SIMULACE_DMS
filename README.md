Simulace DMS systému pro služební cesty
Tato aplikace slouží jako simulace DMS systému (Document Management System) pro správu žádostí o služební cesty. Uživatelé mohou prostřednictvím webového formuláře odeslat žádost, která se následně uloží ve formátu XML. Odpovědná osoba (schvalovatel) může žádost zobrazit a buď ji schválit, nebo zamítnout.

Funkce aplikace
Uživatel
Vyplní jednoduchý formulář s informacemi o služební cestě (jméno, oddělení, destinace, termíny atd.).

Po odeslání je žádost převedena na XML soubor, který je uložen na server.

Zároveň se metadata žádosti uloží do jednoduché databáze (db.json).

Schvalovatel
Má přístup na stránku se seznamem všech dosud neschválených žádostí.

Může si každou žádost rozkliknout a zobrazit detailní informace.

Pomocí tlačítek může žádost schválit nebo zamítnout.

Na základě rozhodnutí se XML soubor přesune do složky approved nebo rejected a zároveň se upraví i záznam v databázi.

Použité technologie
Frontend: React + Material UI

Backend: Node.js + Express

GraphQL: Apollo Server (pro čtení dat)

Datové formáty: JSON (metadata), XML (žádosti)

Ukládání souborů: lokální složky (data/, approved/, rejected/)
