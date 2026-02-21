class RouteManager {
    constructor(map) {
        this.map = map,
        this.geoJson = ""
    }
    // (start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    async FetchRoute(start_cords, end_cords) { 
        const url = `/api/groot?start_lat=${start_cords[0]}&start_lon=${start_cords[1]}&end_lat=${end_cords[0]}&end_lon=${end_cords[1]}`;
        console.log(url)
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        this.geoJson = data
        console.log(this.data)
        L.geoJson(data).addTo(this.map)
    }
}