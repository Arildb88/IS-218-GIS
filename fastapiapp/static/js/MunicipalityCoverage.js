class MunicipalityCoverage {
    constructor(map, detailContainer = document.getElementById("route-information")) {
        this.municipalityLayers = [];
        this.municipalityRecords = [];
        this.map = map;
        this.detailContainer = detailContainer;
    }

    async fetchAndAddMunicipalityCoverage(clickEvent) {
        const lat = clickEvent.latlng.lat;
        const lng = clickEvent.latlng.lng;

        const res = await fetch(`/kommune-geojson?lat=${lat}&lon=${lng}`);
        const rows = await res.json();

        if (!rows[0]) return;

        const municipality = rows[0];
        const geoj = municipality.geom_geojson;

        this.municipalityRecords.push(municipality);

        const getColor = (pps) => {
            if (pps === null || pps >= 100) return "red";
            const min = 1;
            const max = 99;
            const val = Math.min(Math.max(pps, min), max);
            const ratio = (val - min) / (max - min);
            const r = Math.floor(255 * ratio);
            const g = Math.floor(255 * (1 - ratio));
            return `rgb(${r},${g},0)`;
        };

        const municipalityGeoJsonLayer = L.geoJson(geoj, {
            style: () => ({
                color: "black",
                weight: 1,
                fillColor: getColor(municipality.people_per_shelter_place),
                fillOpacity: 0.6
            })
        });

        municipalityGeoJsonLayer.bindTooltip(
            `${municipality.kommunenavn}: ${
                municipality.people_per_shelter_place !== null
                    ? municipality.people_per_shelter_place.toFixed(2)
                    : "–"
            } pers./plass`,
            { permanent: false, direction: "top" }
        );

        municipalityGeoJsonLayer.on("click", () => {
            this.showDetails(municipality);
        });

        this.municipalityLayers.push(municipalityGeoJsonLayer);
        municipalityGeoJsonLayer.addTo(this.map);

        this.showDetails(municipality);
    }

    showDetails(municipality) {
        if (!this.detailContainer) return;

        this.detailContainer.innerHTML = `
            <h3>${municipality.kommunenavn}</h3>
            
            <span>Personer per plass i tilfluktsrom: ${municipality.people_per_shelter_place !== null ? municipality.people_per_shelter_place.toFixed(2) : "–"}</span><br>
            <span>Befolkning totalt: ${municipality.total_population}</span><br>
            <span>Antall tilfluktsrom: ${municipality.shelter_count}</span><br>
            <span>Samlet kapasitet (plasser): ${municipality.total_shelter_capacity}</span><br>
            <span>Gjennomsnittlig befolkning per rutenettcelle: ${municipality.avg_population_per_grid}</span>
            
        `;
    }

    clear() {
        this.municipalityLayers.forEach((layer) => layer.removeFrom(this.map));
        this.municipalityLayers = [];
        this.municipalityRecords = [];
        if (this.detailContainer) this.detailContainer.innerHTML = "";
    }
}

class MunicipalityCoverageLayer {
    constructor(map, endpoint = "/api/kommunedekning/lokal") {
        this.map = map;
        this.LayerInstance = L.geoJson();
        this.state = false;
        this.endpoint = endpoint;
        this.fetched = false;
    }

    async fetchData() {
        tilfluktsromPerKommuneBtn.disabled = true;

        if (this.fetched) return;
        try {
            const res = await fetch(this.endpoint);
            const dataList = await res.json();

            const getColor = (pps) => {
                const min = 1;
                const max = 99;
                if (pps === null) pps = max;
                const val = Math.min(Math.max(pps, min), max);
                const ratio = (val - min) / (max - min);
                const r = Math.floor(255 * ratio);
                const g = Math.floor(255 * (1 - ratio));
                return `rgb(${r},${g},0)`;
            };

            const featureCollection = {
                type: "FeatureCollection",
                features: dataList.map(item => ({
                    type: "Feature",
                    properties: {
                        kommunenavn: item.kommunenavn,
                        people_per_shelter_place: item.people_per_shelter_place,
                        total_population: item.total_population,
                        grid_count: item.grid_count,
                        shelter_count: item.shelter_count,
                        total_shelter_capacity: item.total_shelter_capacity,
                        avg_population_per_grid: item.avg_population_per_grid
                    },
                    geometry: item.geom_geojson
                }))
            };

            this.LayerInstance = L.geoJson(featureCollection, {
                style: (feature) => ({
                    color: "black",
                    weight: 1,
                    fillColor: getColor(feature.properties.people_per_shelter_place),
                    fillOpacity: 0.6
                }),
                onEachFeature: (feature, layer) => {
                    const pps = feature.properties.people_per_shelter_place;
                    const name = feature.properties.kommunenavn;
                    layer.bindTooltip(
                        `${name}: ${pps !== null ? pps.toFixed(2) : "–"} pers./plass`,
                        { permanent: false, direction: "top" }
                    );
                }
            });

            this.fetched = true;
            tilfluktsromPerKommuneBtn.disabled = false;
        } catch (err) {
            console.error("Failed to fetch MunicipalityCoverageLayer data:", err);
        }
    }

    async Toggle(bool = null) {
        if (!this.fetched) {
            await this.fetchData();
        }

        if (bool == null) {
            this.state = !this.state;
            bool = this.state;
        }

        if (bool) {
            this.state = true;
            this.LayerInstance.addTo(this.map);
        } else {
            this.state = false;
            this.LayerInstance.removeFrom(this.map);
        }
    }
}
