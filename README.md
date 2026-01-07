Ovaj projekat je web aplikacija napravljena za studente koja omogućava praćenje ličnih navika, spavanja i produktivnu zabavu. Ovo je personalizovani dashboard gdje svaki korisnik može organizovati svoj dan na jednostavan i vizuelno privlačan način.

Aplikacija se sastoji od glavne stranice, gdje korisnik moze da vidi kurseve, rasporede, i kontakt formu, kao i login formu. Nakon login forme ima Dashboard na kojem se nalaze widgeti kao Sleep tracker, Habit tracker i student fun zone.

Student Fun Zone uključuje Bingo Challenge za druženje, Quiz Master za brzo testiranje znanja, Kanban Board za organizaciju zadataka, Vision Board za postavljanje ciljeva i Whiteboard za digitalno crtanje i bilješke.

Aplikacija ima potpuni sistem za registraciju i prijavu korisnika putem Firebase autentifikacije. Nakon prijave, korisnici mogu personalizovati svoj dashboard prema vlastitim potrebama. Dostupno je pet različitih tema boja koje se mogu mijenjati po želji, a sve postavke se automatski pamte.

Projekt je razvijen koristeći Angular 17 framework sa TypeScript-om za frontend dio. Angular je odabran zbog svoje robusne strukture i mogućnosti brzog razvoja. Za backend se koristi Firebase platforma koja pruža gotova rješenja za autentifikaciju, bazu podataka i hosting. Angular Material biblioteka se koristi za UI komponente, dok Angular CDK omogućava drag and drop funkcionalnost za preuređivanje widgeta. Stilizacija je urađena sa SCSS.

Za pokretanje aplikacije lokalno, potrebno je prvo instalirati Node.js i Angular CLI. Nakon kloniranja repozitorijuma, pokrenuti npm install da se instaliraju sve zavisnosti. Aplikacija se pokreće komandom ng serve, a zatim se otvara u browseru na adresi http://localhost:4200. Za produkcijski deploy koristi se Firebase hosting.
