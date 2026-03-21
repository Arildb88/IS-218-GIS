const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const tonerLiteLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
    subdomains: 'abcd',
    minZoom: 1,
    maxZoom: 20
});

tonerLiteLayer.addTo(map);

const baseMaps = {
    "Watercolor": tonerLiteLayer
};

const overlays = {};

L.control.layers(baseMaps, overlays).addTo(map);

let layerVisible = true;

function toggleTonerLayer() {
    if (layerVisible) {
        map.removeLayer(tonerLiteLayer);
    } else {
        map.addLayer(tonerLiteLayer);
    }
    layerVisible = !layerVisible;
}