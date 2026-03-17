class RouteInformation {
    constructor(bunkerCords, bunkerName, cords, length, segments, time, _HTMLELEMENT = document.getElementById('route-information')) {
        this.bunkerCords = bunkerCords;
        this.bunkerName = bunkerName;
        this.cords = cords;
        this.length = length;
        this.segments = segments;
        this.time = time;

        this.container = _HTMLELEMENT;

        this.UpdateInformation();
    }

    createRow(label, value) {
        const row = document.createElement("div");

        const labelNode = document.createElement("span");
        labelNode.innerHTML = label;

        const valueNode = document.createElement("span");
        valueNode.innerHTML = value;

        row.appendChild(labelNode);
        row.appendChild(valueNode);

        return row;
    }

    UpdateInformation() {
        const header = "<h3>Route information</h3>";

        // Remove everything except header
        this.container.innerHTML = header;
        

        const rows = [
            ["Bunker Cords: ", this.bunkerCords],
            ["Bunker Name: ", this.bunkerName],
            ["Cords: ", this.cords],
            ["Length: ", this.length],
            ["Segments: ", this.segments],
            ["Routing Time: ", this.time]
        ];

        rows.forEach(([label, value]) => {
            this.container.appendChild(this.createRow(label, value));
        });
    }
}