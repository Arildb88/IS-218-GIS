const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

async function loadData() {
  const res = await fetch("/api/objects");
  const geojson = await res.json();

  const layer = L.geoJSON(geojson, {
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      layer.bindPopup(`
        <strong>${props.name}</strong><br/>
        ${props.description}
      `);
    },
  }).addTo(map);

  map.fitBounds(layer.getBounds());
}

loadData();
