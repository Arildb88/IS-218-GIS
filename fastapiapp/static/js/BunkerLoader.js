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

  ClosestBunker(lat, lon) { // O(n) linear time complexity
    if (!this.GeoJson || !this.GeoJson.features || this.GeoJson.features.length === 0) return null;

    let closest = null;
    let minDist = Infinity;

    this.GeoJson.features.forEach(feature => {
      const [bLon, bLat] = feature.geometry.coordinates; // GeoJSON: [lon, lat]

      // Simple Euclidean distance on degrees (not perfect on globe, but fine for small areas)
      const dLat = lat - bLat;
      const dLon = lon - bLon;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);

      if (dist < minDist) {
        minDist = dist;
        closest = feature;
      }
    });

    return closest; // Returns the GeoJSON feature of the closest bunker
  }
}
