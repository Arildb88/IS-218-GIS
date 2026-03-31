# IS-218-GIS

# Oppgave 1
## TLDR: System
Systemet viser korteste rute til en tilfluktsrom fra brukerens posisjon, samt klikket posisjon. Lister opp nærmeste tilfluktsrom sortert etter distanse (luftlinje). Kan vise både varmekart over høyde og bruk av areal på kartet.

## API Kart

<img src="fastapiapp/static/api_ark1.png" alt="Api Map" width="500px">

## Video of the application
https://github.com/user-attachments/assets/ffff3346-065e-40ad-a9b8-c8621c3541c3

## Dependencies

- **Python:** `3.14`
- **Pip packages:** listed in `requirements.txt`

## Setup & Run

From the fastapiapp directory, run:

```bash
pip install -r requirements.txt --force-reinstall --no-deps

python main.py

/
py -m pip install -r requirements.txt --force-reinstall --no-deps

py main.py

```



## 🧱 Teknisk Stack

### Backend
- Python 3.14
- FastAPI

### Frontend
- HTML5
- JavaScript (ES6)
- Leaflet
- CSS3

### Datakilder & tjenester
- GeoNorge WFS
- GeoNorge / Kartverket WMS
- NVDB API (Statens vegvesen)
- GeoJSON


## 🗺️ Arkitektur

## 📂 Datakatalog

| Datasett | Kilde | Format | Bearbeiding |
|--------|------|--------|-------------|
| Tilfluktsrom Liste | WFS Geonorge | XML features | XML gjort om til GeoJson med WGS84 (EPSG:4326) koordinater |
| WMS lag | GeoNorge / Kartverket | WMS PNG | Hentes direkte med WMS |
| Vegnett (NVDB) | NVDB API (Statens vegvesen) | JSON (WKT / UTM33) | Parsing av JSON, konvertering fra WKT til GeoJSON og reprojisering til WGS84, Blir lagret som GeoJson |


## 🧠 Koordinatsystemer & Datatransformasjon

- NVDB-data leveres i UTM sone 33 (EPSG:5973)
- WFS-data leveres i WGS84 (EPSG:4326)
- All geometri reprojiseres til EPSG:4326 før visualisering
- WKT-geometri konverteres til GeoJSON i backend


## 🔄 Interaktivitet

- Klikkbare objekter med popups
- Layer control (skru lag av/på)
- Datadrevet styling
- Dynamisk lasting av data fra API
- Romlig filtrering før visning


## 🔧 Videre forbedringer / Refleksjon

- Implementere PostGIS for mer avanserte romlige spørringer
- Cache API-responser for bedre ytelse
- Forbedre frontend med kartlegende og bedre UX
- Oppdatere liste med nærmesste tilfluktsrom fra klikket posisjon
- Legge til Layer for Nødaggregat
- Legge til Layer for Nærmeste Sykehus, Politi, Brann

# Oppgave 2

## Utvidelse
### Dekkingsanalyse per kommune
Romlig analyse av tilfluktsromsdekning per kommune <br>
Konvertering til GeoJSON for kartvisning

### Individuell bunkerbelastning
Analyse av hvor mange personer hver bunker kan håndtere <br>
Kapasitetsanalyse basert på befolkningsdekning

### Kontekstanalyse 
Romlig kontekst for hver tilflukstsrom

### Forbedret datamodell
Flere JavaScript-moduler for bedre funksjonsorganisering <br>
Triangulator.js - mulig Delaunay-triangulering for dekkingsoptimalisering <br>
RouteManager.js - forbedret ruteadministrasjon <br>
BunkerLoader.js - dynamisk lastning av bunkere

## Video of the application
https://github.com/user-attachments/assets/3513ac36-6ad8-47c1-9ffd-15a8a180edb5

## SQL-snippet

<details>
  <summary>dekning_per_kommune</summary>
  
```sql
CREATE MATERIALIZED VIEW municipality_population_shelter AS
WITH pop_stats AS (
    SELECT
        k.id AS kommune_id,
        k.kommunenavn,
        k.geom,  -- include geometry
        COUNT(b.ssbid250m) AS grid_count,
        SUM(b.poptot) AS total_population
    FROM kommune k
    LEFT JOIN befolkningparuter250m b
      ON ST_Contains(k.geom, b.omrade)
    GROUP BY k.id, k.kommunenavn, k.geom
),
shelter_stats AS (
    SELECT
        k.id AS kommune_id,
        COUNT(t.id) AS shelter_count,
        COALESCE(SUM(t.plasser),0) AS total_shelter_capacity
    FROM kommune k
    LEFT JOIN tilfluktsrom t
      ON ST_Contains(k.geom, t.geom)
    GROUP BY k.id
)
SELECT
    p.kommune_id,
    p.kommunenavn,
    p.geom,  -- geometry included in final view
    p.total_population,
    p.grid_count,
    ROUND(CAST(p.total_population AS numeric)/NULLIF(p.grid_count,0),2) AS avg_population_per_grid,
    s.shelter_count,
    s.total_shelter_capacity,
    ROUND(CAST(p.total_population AS numeric)/NULLIF(s.total_shelter_capacity,0),2) AS people_per_shelter_place
FROM pop_stats p
LEFT JOIN shelter_stats s
  ON p.kommune_id = s.kommune_id
ORDER BY p.kommune_id;
```
</details>  

<details>
  <summary>dekning_per_kommune_geojson</summary>
  
```sql
CREATE OR REPLACE FUNCTION get_all_municipalities()
RETURNS TABLE (
    kommune_id bigint,
    kommunenavn text,
    total_population bigint,
    grid_count bigint,
    avg_population_per_grid numeric,
    shelter_count bigint,
    total_shelter_capacity bigint,
    people_per_shelter_place numeric,
    geom_geojson json
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        m.kommune_id::bigint,
        m.kommunenavn,
        m.total_population::bigint,
        m.grid_count::bigint,
        m.avg_population_per_grid,
        m.shelter_count::bigint,
        m.total_shelter_capacity::bigint,
        m.people_per_shelter_place,
        ST_AsGeoJSON(k.geom)::json AS geom_geojson
    FROM municipality_population_shelter m
    JOIN kommune k ON m.kommune_id = k.id
    ORDER BY m.kommune_id;
END;
$$ LANGUAGE plpgsql STABLE;
```
</details> 

## JupyterNotebook 
Bilder som viser JupyterNotebook hvor all kode er kjørt.

[Detaljert dokumentasjon for JupyterNotebook finner du her →](./JupyterNotebook/README.md)

For å kunne kjøre JupyterNotebook filen, gjør følgende:
- Installer eller åpne Anaconda Prompt
- Naviger til /JupyterNotebook
Kjør kommandoen for å lage miljø med de nødvendige tilleggs programmene installert.
```bash
conda env create -f environment.yml
```
Kjør kommandoen for å aktivere/gå inn i miljøet du lagde
```bash
conda activate geo_env
```
Kjør kommandoen og finn IS218_Notebookfile.ipynb
```bash
jupyter lab
```
I JupyterNotebook filen:
Kolonne 7: Husk å endre PATH til der du har lastet ned repo og til JupyterNotebook mappen

[Link til notebook →](./JupyterNotebook/IS218_Notebookfile.ipynb)

## 🔧 Videre forbedringer / Refleksjon
- Forbedre frontend med kartlegende og bedre UX
- Legge til watchme funksjon som oppdaterer din posisjon og beregner rute på ny
