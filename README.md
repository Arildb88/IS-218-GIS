# IS-218-GIS

**Målet med oppgaven:**

Etablere et fungerende system for et webkart som kombinerer statiske filer, eksterne API-tjenester og en romlig database (Spatial SQL). Du skal vise forståelse for koordinatsystemer, datatransformasjon og hvordan geografiske data presenteres interaktivt i en nettleser.


**Oppgavetekst:**

Leveranse (README.md) 
Oppgaven leveres i GitHub-repo med dokumentasjon som README.md. Den skal inneholde: 

	• Prosjektnavn & TLDR: Hva løser dette kartet? (Maks 3 setninger). 
	
	• Demo av system: Video / gif som demonstrerer systemet 
	
	• Teknisk Stack: Liste over biblioteker og versjoner. 
	
	• Datakatalog: En tabell som beskriver: | Datasett | Kilde | Format | Bearbeiding  
	
	• Arkitekturskisse: En enkel oversikt over hvordan data flyter fra kilde til kart. 
	
Refleksjon: Diskuter kort forbedringspunkter ved din nåværende løsning (4-5 setninger / punkter)

**Tekniske Krav:**

Tekniske krav (minimum) 
For å bestå oppgaven må følgende krav være møtt: 
	• Kartbibliotek: Applikasjonen skal bygges med enten Leaflet eller MapLibre GL JS. 
	• Datakilder: Kartet skal visualisere data fra minst disse kildene: 
	• GeoJSON-fil: Et datasett du har hentet ut (f.eks. via QGIS eller Overture) og lagret som fil som lastes inn i webkartet 
	• Eksternt (OGC) API: Data hentet direkte via et API (f.eks. Tjenester fra GeoNorge eller Kartverket). 
	• (Valgfritt) Supabase (PostGIS): Dynamisk laste data fra din egen Supabase-instans ved bruk av SQL-spørringer 
	• Interaktivitet: 
	• Klikkbare objekter (Popups) som viser informasjon fra attributtabellen. 
	• Bruke datadrevet styling 
	• En funksjon for å skru datalag av/på (Layer Control). 
Minst én romlig filtrering eller spørring (f.eks. "Vis kun objekter innenfor en viss avstand" eller "Søk i database").


