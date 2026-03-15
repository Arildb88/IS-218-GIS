class Communism {
    constructor(map) {
        this.Cummunists = [];
        this.Dictators = [];
        this.map = map;
    }

    async FetchAndAddCommunistToMap(MapClickEvent) {
        const lat = MapClickEvent.latlng.lat;
        const lng = MapClickEvent.latlng.lng;

        const res = await fetch(`/kommune-geojson?lat=${lat}&lon=${lng}`);
        const Stalin = await res.json();

        if (!Stalin[0]) return; // safety check

        const Lenin = Stalin[0];
        const geoj = Lenin.geom_geojson;

        this.Dictators.push(Lenin);

        // Function to pick color based on people_per_shelter_place
        const getColor = (pps) => {
            if (pps === null || pps >= 100) return "red"; // treat NULL or 100+ as worst
            const min = 1;   // best (green)
            const max = 99;  // scale up to just below 100
            const val = Math.min(Math.max(pps, min), max);
            const ratio = (val - min) / (max - min);
            const r = Math.floor(255 * ratio);
            const g = Math.floor(255 * (1 - ratio));
            return `rgb(${r},${g},0)`;
        };

        const CommunistGeoJsonFC = L.geoJson(geoj, {
            style: () => ({
                color: "black",
                weight: 1,
                fillColor: getColor(Lenin.people_per_shelter_place),
                fillOpacity: 0.6
            })
        });

        CommunistGeoJsonFC.bindTooltip(
            `${Lenin.kommunenavn}: ${
                Lenin.people_per_shelter_place !== null
                    ? Lenin.people_per_shelter_place.toFixed(2)
                    : "N/A"
            } ppl per shelter`,
            { permanent: false, direction: "top" }
        );

        this.Cummunists.push(CommunistGeoJsonFC);
        CommunistGeoJsonFC.addTo(this.map);
    }
    clear() {
        this.Cummunists.forEach((commie) => {commie.removeFrom(this.map)})
    }
}
class CommunistLayer {
    constructor(map, endpoint = "/alle-kommunister-local") {
        this.map = map;
        this.LayerInstance = L.geoJson();
        this.state = false;
        this.endpoint = endpoint;
        this.fetched = false;   
    }

    async fetchData() {
        
        bpk.disabled = true;

        if (this.fetched) return; 
        try {
            const res = await fetch(this.endpoint);
            const dataList = await res.json(); // array of 300+ municipalities

            const getColor = (pps) => {
                const min = 1;
                const max = 99;
                if (pps === null) pps = max; // treat null as worst
                const val = Math.min(Math.max(pps, min), max);
                const ratio = (val - min) / (max - min);
                const r = Math.floor(255 * ratio);
                const g = Math.floor(255 * (1 - ratio));
                return `rgb(${r},${g},0)`;
            };

            // Build a proper GeoJSON FeatureCollection
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

            // Add feature collection to Leaflet
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
                        `${name}: ${pps !== null ? pps.toFixed(2) : "N/A"} ppl per shelter`,
                        { permanent: false, direction: "top" }
                    );
                }
            });

            this.fetched = true;
            bpk.disabled = false;
        } catch (err) {
            console.error("Failed to fetch CommunistLayer data:", err);
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