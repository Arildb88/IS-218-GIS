class BunkerLoader {
  constructor(map, link) {
    this.map = map;
    this.link = link;
    this.GeoJson = null;
  }

  // Fetch WFS XML
  async FetchXML() {
    try {
      const response = await fetch(this.link);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const xmlText = await response.text();
      return xmlText;
    } catch (err) {
      console.error("Error fetching XML:", err);
      return null;
    }
  }

  // Parse GML/WFS XML to GeoJSON
  ParseToGeoJSON(xmlText) {
    if (!xmlText) return null;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Namespace for app:Tilfluktsrom
    const nsApp = "http://skjema.geonorge.no/SOSI/produktspesifikasjon/TilfluktsromOffentlige/20191001";
    const nsGML = "http://www.opengis.net/gml/3.2";

    const members = xmlDoc.getElementsByTagNameNS(nsApp, "Tilfluktsrom");
    const features = [];

    Array.from(members).forEach(member => {
      // Extract coordinates
      const posEl = member.getElementsByTagNameNS(nsGML, "pos")[0];
      if (!posEl) return; // skip if no geometry

      const coords = posEl.textContent.trim().split(/\s+/).map(Number);

      // Extract properties
      const romnr = member.getElementsByTagNameNS(nsApp, "romnr")[0]?.textContent || "";
      const plasser = member.getElementsByTagNameNS(nsApp, "plasser")[0]?.textContent || "";
      const adresse = member.getElementsByTagNameNS(nsApp, "adresse")[0]?.textContent || "";

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coords[1], coords[0]] // GeoJSON uses [lon, lat]
        },
        properties: { romnr, plasser, adresse }
      });
    });

    return {
      type: "FeatureCollection",
      features: features
    };
  }

  // Fetch + parse and optionally add to map
  async LoadToMap(addToMap = true) {
    const xmlText = await this.FetchXML();
	this.GeoJson = this.ParseToGeoJSON(xmlText);
    const geojson = this.GeoJson;

    if (!geojson) {
      console.warn("No features parsed");
      return null;
    }

    if (addToMap) {
      L.geoJSON(geojson, {
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

    return geojson;
  }
}
