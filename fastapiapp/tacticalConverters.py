from pyproj import Transformer

_TRANSFORMER_utm33_to_wgs84 = Transformer.from_crs(
    "EPSG:25833", "EPSG:4326", always_xy=True
)

_TRANSFORMER_wgs84_to_utm33 = Transformer.from_crs(
    "EPSG:4326", "EPSG:25833", always_xy=True
)
# LON: 8.3094
# LAT: 60.9340
def utm33_to_wgs84(coords):
    """
    coords: [easting, northing] in meters (UTM zone 33N)
    returns: [lon, lat] in degrees
    """
    lon, lat = _TRANSFORMER_utm33_to_wgs84.transform(coords[0], coords[1])
    return [lon, lat]


def wgs84_to_utm33(coords):
    """
    coords: [lon, lat] in degrees
    returns: [easting, northing] in meters (UTM zone 33N)
    """
    easting, northing = _TRANSFORMER_wgs84_to_utm33.transform(coords[0], coords[1])
    return [round(easting,4), round(northing,4)]

#print(utm33_to_wgs84([277295.5795,6651972.0803]))