class RouteInformation {
    constructor( bunkerCords, bunkerName, cords, length, segments, time, _HTMLELEMENT = document.getElementById('route-information')) {
        this.bunkerCords = bunkerCords;
        this.bunkerName = bunkerName;
        this.cords = cords;
        this.length = length;
        this.segments = segments;
        this.time = time;
        
        this.UpdateInformation();
    }

    UpdateInformation() {
        let nodes = Array.from(document.getElementById('route-information').children).map(e => e.children[0])
        nodes[1].innerHTML = this.bunkerCords;
        nodes[2].innerHTML = this.bunkerName;
        nodes[3].innerHTML = this.cords;
        nodes[4].innerHTML = this.length;
        nodes[5].innerHTML = this.segments;
        nodes[6].innerHTML = this.time;
        
    }
}