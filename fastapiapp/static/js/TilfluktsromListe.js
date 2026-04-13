class TilfluktsromListe {
    constructor() {
        this.userLat;
        this.userLon;

        this.CurrentPositionMarker = null;
    }

    setMarkerPos() {
        if (this.CurrentPositionMarker == null) {
            this.CurrentPositionMarker = L.marker([this.userLat,this.userLon],{ icon: Le_Icón("cat.png") }).addTo(map);
            
        } else {
            this.CurrentPositionMarker.setLatLng([this.userLat,this.userLon]);
        }
        
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    async getUserPosition(pants = false) {
        try {
            const position = await this.getPosition();
            this.userLat = position.coords.latitude;
            this.userLon = position.coords.longitude;
        } catch {
            this.userLat = 58.1475638;
            this.userLon = 7.9968452;
        }

        console.log("[TilfluktsromListe.js] User Coords fetched");

        b.SortBunkersByDistance(this.userLat, this.userLon);
        b.ClosestBunker(this.userLat, this.userLon);
        this.fillTilfluktsromList();
        this.setMarkerPos();

        if (pants) {
            map.panTo([this.userLat, this.userLon]);
        }
    }
    fillTilfluktsromList(){
        let html = "<h2>Tilfluktsrom</h2>"
        b.GeoJson.features.forEach((f) => {
            const props = f.properties;
            html += `<div class="tilfluktsrom-kort">
                        <p>${props.adresse}</p>
                        <p>Distance: ${props.calculatedDistance} m</p>
                        <p>
                            <button onclick="BL.RTB(${props.id})">Show Route</button>
                        </p>
                    </div>`
        })
        document.getElementById('tilfluktsrom-liste').innerHTML = html;
    }
    async RTB(bid) {
        b.ClosestBunker(this.userLat,this.userLon);
        b.SortBunkersByDistance(this.userLat,this.userLon);
        let bunker = b.GetBunkerById(bid);
        let end_cords = [bunker.geometry.coordinates[1],bunker.geometry.coordinates[0]];
        
        let start_cords = [this.userLat,this.userLon];
        let RM = new RouteManager(map);
        

        await RM.FetchRoute(start_cords,end_cords);
        
        bunker.properties.ActualDistance = RM.geoJson.features[0].properties[1]
        _Routes.push(RM);
    }
    
}
