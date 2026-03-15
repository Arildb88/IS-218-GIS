class RoutePicker {
    constructor(lat,lon) {
        this._Routes = [];
        this.lat = lat;
        this.lon = lon;
    }

    async fetchRoutes() {
        b.ClosestBunker(this.lat, this.lon);
        b.SortBunkersByDistance(this.lat, this.lon);
        let feet = b.GeoJson.features;
        const top3 = feet.slice(0,3);

        //console.log(top3);

        const res = await Promise.all(top3.map(bunk => BL.RTB(bunk.properties.id)))

        const top3Routes = _Routes.slice(_Routes.length-3,_Routes.length);

        console.log(top3Routes);

        const top3RoutesSorted = top3Routes.sort((a, b) => a.getLength() - b.getLength());
        
        
        
        console.log(top3RoutesSorted);
    }
}