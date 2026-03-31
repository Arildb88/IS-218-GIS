function Le_Icón(file_name, IconSize = 40) {
    return L.icon({
        iconUrl: `../static/icons/${file_name}`,
        iconSize: [IconSize, IconSize],
        iconAnchor: [IconSize/2, IconSize],
        popupAnchor: [0, -IconSize/2]
    });
}

