from flask import Flask, request, jsonify
import pickle
import osmnx as ox
import networkx as nx
from flask_cors import CORS
from geopy.distance import geodesic

app = Flask(__name__)
CORS(app)

# Load the pre-stored graph of Bangalore from the pickle file
try:
    with open('bangalore_graph.pkl', 'rb') as f:
        G = pickle.load(f)
    print("Graph loaded successfully.")
except Exception as e:
    print(f"Error loading graph: {e}")
    G = None

# Function to compute the shortest path using OSMnx and Networkx
def get_shortest_path(origin_coords, destination_coords):
    """
    Compute the shortest path between two coordinates.
    """
    try:
        if G is None:
            raise ValueError("Graph is not loaded.")
        
        print(f"Computing shortest path...")
        print(f"Origin: {origin_coords}")
        print(f"Destination: {destination_coords}")

        # Calculate the distance between origin and destination
        distance_km = geodesic(origin_coords, destination_coords).km
        print(f"Distance between points: {distance_km:.2f} km")

        # Convert origin and destination coordinates to nodes in the graph
        origin_node = ox.distance.nearest_nodes(G, origin_coords[1], origin_coords[0])
        destination_node = ox.distance.nearest_nodes(G, destination_coords[1], destination_coords[0])
        print(f"Origin Node: {origin_node}, Destination Node: {destination_node}")

        # Compute the shortest path between origin and destination
        shortest_path = nx.shortest_path(G, origin_node, destination_node, weight='length')
        print(f"Shortest path found with {len(shortest_path)} nodes")

        # Get the coordinates of the shortest path
        route = [(G.nodes[node]['y'], G.nodes[node]['x']) for node in shortest_path]
        print(f"Route generated with {len(route)} coordinates")
        return route

    except Exception as e:
        print(f"Error in get_shortest_path: {e}")
        return None

# API endpoint to get the route
@app.route('/get-route', methods=['GET'])
def get_route():
    try:
        # Extract origin and destination from query parameters
        origin_lat = float(request.args.get('origin_lat'))
        origin_lon = float(request.args.get('origin_lon'))
        destination_lat = float(request.args.get('destination_lat'))
        destination_lon = float(request.args.get('destination_lon'))

        print(f"API request received: Origin({origin_lat}, {origin_lon}), Destination({destination_lat}, {destination_lon})")

        # Compute the shortest path
        origin_coords = (origin_lat, origin_lon)
        destination_coords = (destination_lat, destination_lon)
        route = get_shortest_path(origin_coords, destination_coords)

        if route:
            print(f"API response: Route with {len(route)} points")
            return jsonify(route)
        else:
            return jsonify({"error": "Route could not be generated."}), 500

    except Exception as e:
        print(f"Error in get_route: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "Flask is working!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
