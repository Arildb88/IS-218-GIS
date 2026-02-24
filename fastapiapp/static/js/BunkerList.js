class BunkerList {
    constructor() {
        this.userLat;
        this.userLon;

        this.CurrentPositionMarker = L.marker([58,10]).addTo(map);
    }

    setMarkerPos() {
        if (this.CurrentPositionMarker != null) {
            this.CurrentPositionMarker = L.marker([this.userLat,this.userLon]).addTo(map);
            
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
        //console.log(pants)
        try {
            const position = await this.getPosition();
            this.userLat = position.coords.latitude;
            this.userLon = position.coords.longitude;
        } catch {
            this.userLat = 58.1475638;
            this.userLon = 7.9968452;
        }

        console.log("[BunkerList.js] User Coords fetched");

        b.SortBunkersByDistance(this.userLat, this.userLon);
        b.ClosestBunker(this.userLat, this.userLon);
        this.FillBunkerList();
        this.setMarkerPos();

        if (pants) {
            map.panTo([this.userLat, this.userLon]);
        }
    }
    // {romnr: '776', plasser: '400', adresse: 'Trimv. 09 - Borre Idrettspark (off)', id: 0}
    FillBunkerList(){
        let html = "<h2>Bunkers</h2>"
        b.GeoJson.features.forEach((f) => {
            const props = f.properties;
            html += `<div class="bunker-card">
                        <p>${props.adresse}</p>
                        <p>Distance: ${props.calculatedDistance} m</p>
                        <p>
                            <button onclick="BL.RTB(${props.id})">Show Route</button>
                        </p>
                    </div>`
        })
        document.getElementById('bunker-list').innerHTML = html;
    }
    async RTB(bid) {
        b.ClosestBunker(this.userLat,this.userLon);
        b.SortBunkersByDistance(this.userLat,this.userLon);
        let bunker = b.GetBunkerById(bid);
        //console.log(bunker);
        let end_cords = [bunker.geometry.coordinates[1],bunker.geometry.coordinates[0]];
        
        let start_cords = [this.userLat,this.userLon];
        //console.log(start_cords)
        let RM = new RouteManager(map);
        

        await RM.FetchRoute(start_cords,end_cords);
        
        bunker.properties.ActualDistance = RM.geoJson.features[0].properties[1]
        _Routes.push(RM);
    }
    
}
