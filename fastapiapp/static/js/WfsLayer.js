class WfsLayer {
	constructor(map, wfsLink) {
		this.wfsLink = wfsLink;
		this.map = map;
		this.LayerInstance = null;
		this.state = false;
	}

	async load() {
		const res = await fetch(this.wfsLink);
		const geojson = await res.json();

		this.LayerInstance = L.geoJSON(geojson, {
			onEachFeature: (feature, layer) => {
				if (feature.properties) {
					let content = "";
					for (const key in feature.properties) {
						content += `<strong>${key}</strong>: ${feature.properties[key]}<br>`;
					}
					layer.bindPopup(content);
				}
			}
		});
	}

	async Toggle(bool = null) {
		if (!this.LayerInstance) {
			await this.load();
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
