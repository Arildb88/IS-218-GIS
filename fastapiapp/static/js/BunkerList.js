class BunkerList {
    constructor() {
        this.userLat;
        this.userLon;

        this.CurrentPositionMarker = L.marker([58,10]).addTo(map);
    }

    async getUserPosition() {
        // krs sentrum 58.147563894821886 7.996845245361329
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLat = position.coords.latitude;
                    this.userLon = position.coords.longitude;
                    console.log("[BunkerList.js] REAL User Coords fetched")
                    b.SortBunkersByDistance(BL.userLat,BL.userLon)
                    b.ClosestBunker(BL.userLat,BL.userLon)
                    this.FillBunkerList();
                },
                (error) => {
                    this.userLat = 58.1475638;
                    this.userLon = 7.9968452;
                }
            );
        } else {
            this.userLat = 58.1475638;
            this.userLon = 7.9968452;
        }
        console.log("[BunkerList.js] User Coords fetched")
        //this.CurrentPositionMarker.setLatLng([this.userLat,this.userLon]);
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
        _Routes.push(RM);
    }
    
}
