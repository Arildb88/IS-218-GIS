function TriangulateLast() {
    for (let i=0;i<3;i++) {
        const bunker = b.GeoJson.features[i];

        const circle = L.circle([bunker.geometry.coordinates[1],bunker.geometry.coordinates[0]], {
            radius: Number(bunker.properties.calculatedDistance), // radius in meters
            color: 'red',       // stroke color
            fillColor: '#f03',  // fill color
            fillOpacity: 0.3
        }).addTo(map);
    }
}