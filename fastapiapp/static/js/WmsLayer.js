class WmsLayer {
	constructor(map, wmsLink) {
		this.wmsLink = wmsLink;
		this.map = map;
		this.LayerInstance = L.tileLayer.wms(
		  wmsLink, // "https://wms.geonorge.no/skwms1/wms.arealbruk" //
		  {
			layers: "Arealbruk",   // ← must match GetCapabilities // 
			format: "image/png",
			transparent: true,
			attribution: "© GeoNorge"
		  }
		)
		this.state = false;
		
	}
	Toggle(bool = null) {
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

// const a = new WmsLayer(map, "https://wms.geonorge.no/skwms1/wms.arealbruk")
// a.toggle(); // kan legges paa true elr false i funksjonen