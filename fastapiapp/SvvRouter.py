from tacticalConverters import *
import re 
import requests

__headers = { ## Trikse SVV api til aa tenke at det er menneske request og ikke slange
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/115.0.0.0 Safari/537.36"
}

def _GenReqLink(start_coords, end_coords, area=100):
    """
    start_coords, end_coords: [lon, lat]
    """
    base = "https://nvdbapiles.atlas.vegvesen.no/vegnett/api/v4/beta/vegnett/rute?maks_avstand=1000&"

    start_utm = wgs84_to_utm33(start_coords)
    end_utm = wgs84_to_utm33(end_coords)

    return (
        f"{base}"
        f"omkrets={area}"
        f"&start={start_utm[0]},{start_utm[1]}"
        f"&slutt={end_utm[0]},{end_utm[1]}"
    )

_feilkoder = ['IKKE_FUNNET_SLUTTPUNKT', 'IKKE_FUNNET_STARTPUNKT']

def FetchRoute(start_coords, end_coords): #returnerer linestrings # FORVENtER LAV TALL FØRST OGSÅ STOR TALL ex 8.93292, 58.34932
    segmenter = []
    radius = 500;
    maxradius = 10000+1
    status_tekst = ""
    length = 0
    while (len(segmenter) == 0 and radius < maxradius):
        print(radius)
        print(_GenReqLink(start_coords,end_coords, area=radius));
        radius += 500
        response = requests.get(_GenReqLink(start_coords,end_coords, area=radius), headers=__headers)
        
        data = response.json()
        #print(data)
        segmenter = data["vegnettsrutesegmenter"]
        status_tekst = data["metadata"]["status_tekst"]
        length = data["metadata"]["lengde"]
        if status_tekst in _feilkoder:
            return {"success":False, "ec": status_tekst.replace("_", " ").lower()}

    if status_tekst != "KOMPLETT" or len(segmenter) == 0:
        return {"success":False, "ec": "Kan ikke finne rute"}
    
    linestrings = [e["geometri"]["wkt"] for e in segmenter]
    props = {"length", length}
    geojson_lines = linestringz_utm33_to_geojson(linestrings, properties=props)
    return geojson_lines
    
    

def linestringz_utm33_to_geojson(linestrings, properties=None):
    """
    linestrings: list[str] of WKT LINESTRING Z (UTM33)
    properties: optional dict or list[dict] for GeoJSON features

    returns: GeoJSON FeatureCollection (dict)
    """

    features = []
    TRANSFORMER_UTM33_TO_WGS84 = Transformer.from_crs(
        "EPSG:25833", "EPSG:4326", always_xy=True
    )
    for i, wkt in enumerate(linestrings):
        # Extract coordinates inside ()
        coords_text = re.search(r"\((.*)\)", wkt).group(1)

        line_coords = []
        for part in coords_text.split(","):
            easting, northing, *_ = map(float, part.strip().split())
            lon, lat = TRANSFORMER_UTM33_TO_WGS84.transform(easting, northing)
            line_coords.append([lon, lat])  # GeoJSON order

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": line_coords
            },
            "properties": {}
        }

        if properties:
            if isinstance(properties, list):
                feature["properties"] = properties[i]
            else:
                feature["properties"] = properties

        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }

#rrr = FetchRoute([8.6472121, 58.4988501],[8.6527676, 58.506736])
#print(rrr)