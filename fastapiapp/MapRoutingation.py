import osmnx as ox
import networkx as nx
import geopandas as gpd
from shapely.geometry import LineString

def get_road_graph(lon: float, lat: float, radius_m=5000):
    G = ox.graph_from_point(
        (lat, lon),
        dist=radius_m,
        network_type="drive",  # or "walk"
        simplify=True
    )
    return G



def closest_bunker_route(G, user_lon, user_lat, bunker_geojson):
    user_node = ox.nearest_nodes(G, user_lon, user_lat)

    best_feature = None
    best_len = float("inf")
    best_route = None

    for feature in bunker_geojson["features"]:
        try:
            lon, lat = feature["geometry"]["coordinates"]
        except (KeyError, TypeError):
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
                best_route = nx.shortest_path(
                    G,
                    user_node,
                    bunker_node,
                    weight="length"
                )

        except nx.NetworkXNoPath:
            continue
    res = {
        "bunker": best_feature,
        "distance_m": best_len,
        "route": best_route
    }
    print("user_node:", user_node)
    print("bunker_node:", bunker_node)
    print(res)
    return res

def route_to_geojson(G, route):
    from shapely.geometry import LineString
    import geopandas as gpd

    edges = ox.graph_to_gdfs(G, nodes=False)
    edge_geoms = []

    for u, v in zip(route[:-1], route[1:]):
        data = G.get_edge_data(u, v)
        if data is None:
            continue
        # pick the first edge (most routes will be key=0 if no parallel edges)
        edge_geom = data[list(data.keys())[0]]["geometry"]
        edge_geoms.append(edge_geom)

    # Merge all segments into one LineString
    merged_coords = [pt for geom in edge_geoms for pt in geom.coords]
    route_line = LineString(merged_coords)

    gdf = gpd.GeoDataFrame([{"geometry": route_line}], crs="EPSG:4326")
    return gdf.to_json()