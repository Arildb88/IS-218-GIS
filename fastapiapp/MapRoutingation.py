import osmnx as ox
import networkx as nx

def get_road_graph(lon: float, lat: float, radius_m=5000):
    G = ox.graph_from_point(
        (lat, lon),
        dist=radius_m,
        network_type="drive",  # or "walk"
        simplify=True
    )
    return G



def closest_bunker_route(G, user_lon, user_lat, bunkers):
    user_node = ox.nearest_nodes(G, user_lon, user_lat)

    best = None
    best_len = float("inf")
    best_route = None

    for bunker in bunkers:
        bunker_node = ox.nearest_nodes(
            G,
            bunker["lon"],
            bunker["lat"]
        )

        try:
            length = nx.shortest_path_length(
                G,
                user_node,
                bunker_node,
                weight="length"
            )

            if length < best_len:
                best_len = length
                best = bunker
                best_route = nx.shortest_path(
                    G,
                    user_node,
                    bunker_node,
                    weight="length"
                )

        except nx.NetworkXNoPath:
            continue

    return best, best_route

def route_to_geojson(G, route):
    gdf = ox.utils_graph.route_to_gdf(G, route)
    return gdf.to_json()