class RouteInformation {
    constructor(shelterCoords, shelterAddress, cords, length, segments, time, _HTMLELEMENT = document.getElementById('route-information')) {
        this.shelterCoords = shelterCoords;
        this.shelterAddress = shelterAddress;
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
        const header = "<h3>Ruteinformasjon</h3>";

        this.container.innerHTML = header;
        

        const rows = [
            ["Tilfluktsrom-koordinater: ", this.shelterCoords],
            ["Navn på tilfluktsrom: ", this.shelterAddress],
            ["Koordinater: ", this.cords],
            ["Lengde: ", this.length],
            ["Segmenter: ", this.segments],
            ["Rutetid (s): ", this.time]
        ];

        rows.forEach(([label, value]) => {
            this.container.appendChild(this.createRow(label, value));
        });
    }
}
