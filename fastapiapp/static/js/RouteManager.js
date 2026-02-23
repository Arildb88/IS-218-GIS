class RouteManager {
    constructor(map) {
        this.map = map,
        this.geoJson = ""
        this.layer;
    }
    // (start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    async FetchRoute(start_cords, end_cords) { 
        const url = `/api/groot?start_lat=${start_cords[0]}&start_lon=${start_cords[1]}&end_lat=${end_cords[0]}&end_lon=${end_cords[1]}`;
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        this.geoJson = data
        try {
            this.layer = L.geoJson(data).addTo(this.map)
            console.log('[RouteManager.js] Loaded route')
        } catch {
            alert(data.ec)
            console.log(`[RouteManager.js] Route failed: ${data.ec}`)
        }
        
        
    }
}

function ClearMap() {
    _Routes.forEach((r) => {try {r.layer.removeFrom(map)} catch(_){}});
    _Clickies.forEach((r) => {try {r.removeFrom(map)} catch(_){}});
}