class BunkerLoader {
  constructor(map, link) {
    this.map = map;
    this.link = link;
    this.GeoJson = null;
  }

  
  async LoadFromServer() {
    this.GeoJson = await fetch("/api/bunkers")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch bunkers");
      return res.json();
    });
    
    L.geoJSON(this.GeoJson, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          `Romnr: ${feature.properties.romnr}<br>` +
          `Plasser: ${feature.properties.plasser}<br>` +
          `Adresse: ${feature.properties.adresse}<br>` + 
          `Cords: ${feature.geometry.coordinates.join(',')}`
        );
      },
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 6, color: 'red' })
    }).addTo(this.map);

  }

  async RouteToNearestBunker(lat, lon) {
    try {
      const response = await fetch(`/api/getroute?lat=${lat}&lon=${lon}`);
      if (!response.ok) throw new Error("Failed to fetch bunkers");

      const geojson = await response.json(); // already a JS object
      console.log("GeoJSON:", geojson);

      // Add to map
      L.geoJson(geojson).addTo(this.map);

    } catch (error) {
      console.error("Error fetching or rendering bunker route:", error);
    }
  }
}
