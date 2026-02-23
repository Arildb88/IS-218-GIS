import requests
import xml.etree.ElementTree as ET


def FetchBunkers(wfs_url: str):
    """
    Fetch WFS XML and convert Tilfluktsrom features to GeoJSON
    """

    try:
        resp = requests.get(wfs_url, timeout=15)
        resp.raise_for_status()
        xml_text = resp.text
    except Exception as e:
        print("Error fetching XML:", e)
        return None

    # Parse XML
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        print("XML parse error:", e)
        return None

    # Namespaces
    ns = {
        "app": "http://skjema.geonorge.no/SOSI/produktspesifikasjon/TilfluktsromOffentlige/20191001",
        "gml": "http://www.opengis.net/gml/3.2"
    }

    features = []

    # Find all Tilfluktsrom elements
    for member in root.findall(".//app:Tilfluktsrom", ns):

        pos_el = member.find(".//gml:pos", ns)
        if pos_el is None:
            continue

        coords = list(map(float, pos_el.text.strip().split()))
        lat, lon = coords[0], coords[1]

        def get_text(path):
            el = member.find(path, ns)
            return el.text if el is not None else ""

        properties = {
            "romnr": get_text("app:romnr"),
            "plasser": get_text("app:plasser"),
            "adresse": get_text("app:adresse")
        }

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]  # GeoJSON lon,lat
            },
            "properties": properties
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }
