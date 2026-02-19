import osmnx as ox
import networkx as nx
import geopandas as gpd
from shapely.geometry import LineString


def get_road_graph(lon: float, lat: float, radius_m=5000):
    return ox.graph_from_point(
        (lat, lon),
        dist=radius_m,
        network_type="drive",
        simplify=True
    )


def closest_bunker_route(G, user_lon, user_lat, bunker_geojson):
    user_node = ox.nearest_nodes(G, user_lon, user_lat)

    best_feature = None
    best_len = float("inf")
    best_route = None
    best_bunker_node = None

    for feature in bunker_geojson.get("features", []):
        try:
            lon, lat = feature["geometry"]["coordinates"]
        except (KeyError, TypeError, ValueError):
            continue

        try:
            bunker_node = ox.nearest_nodes(G, lon, lat)
  
            length = nx.shortest_path_length(
                G,
                user_node,
                bunker_node,
                weight="length"
            )

            if length < best_len:
                best_len = length
                best_feature = feature
                best_bunker_node = bunker_node
                best_route = nx.shortest_path(
                    G,
                    user_node,
                    bunker_node,
                    weight="length"
                )

        except nx.NetworkXNoPath:
            continue

    if best_route is None:
        return None

    return {
        "bunker": best_feature,
        "distance_m": best_len,
        "route": best_route,
        "user_node": user_node,
        "bunker_node": best_bunker_node
    }



def route_to_geojson(G, res):
    if not res or "route" not in res:
        return None

    route = res["route"]
    coords = []

    for u, v in zip(route[:-1], route[1:]):
        edge_data = G.get_edge_data(u, v)
        if not edge_data:
            continue
        edge = edge_data[next(iter(edge_data))]

        if "geometry" in edge:
            # remove duplicate points
            coords.extend([c for i, c in enumerate(edge["geometry"].coords) if i == 0 or c != edge["geometry"].coords[i-1]])
        else:
            u_coord = (G.nodes[u]["x"], G.nodes[u]["y"])
            v_coord = (G.nodes[v]["x"], G.nodes[v]["y"])
            if not coords or coords[-1] != u_coord:
                coords.append(u_coord)
            coords.append(v_coord)

    if not coords:
        return None

    # Leaflet prefers coordinates as [lat, lon]
    latlon_coords = [[x, y] for x, y in coords]

    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": latlon_coords
                }
            }
        ]
    }

    return geojson  


