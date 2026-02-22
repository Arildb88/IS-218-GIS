class WmsLayerUniversal {
	constructor(map, wmsLink) {
		this.wmsLink = wmsLink.split("?")[0];
        this.wmsLinkCapabilities = wmsLink;
		this.map = map;
        this.layers = [];
		this.LayerInstance = '';
		this.state = false;
		
        this._init();
	}

    // https://kart.ssb.no/api/mapserver/v1/wms/befolkning_paa_rutenett?service=WMS&version=1.3.0&request=GetCapabilities

    async _init() {
        fetch(this.wmsLinkCapabilities)
        .then(res => res.text())
        .then(xmlText => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            const layers = xmlDoc.querySelectorAll('Layer[queryable="1"]');

            layers.forEach((layer) => {
                this.layers.push(layer.children.item("Name").textContent);
            })
            
        })
        .catch(err => console.error(err));
    }
    
    LoadLayer(layer) {
        this.Toggle(false);
        this.LayerInstance = L.tileLayer.wms(
		  this.wmsLink,
		  {
			layers: layer,
			format: "image/png",
			transparent: true,
			attribution: "© GeoNorge"
		  }
		);
        this.Toggle(true);
    }

	Toggle(bool = null) {
        try {
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
        } catch (_){}
		
	}
	
}

// const a = new WmsLayerUniversal(map, "https://wms.geonorge.no/skwms1/wms.arealbruk")
// a.LoadLayer(this.layers[n]); // kan legges p