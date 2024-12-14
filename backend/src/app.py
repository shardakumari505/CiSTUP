from flask import Flask, request, jsonify
import osmnx as ox
import networkx as nx
from shapely.geometry import Point
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Function to compute the shortest path using OSMnx and Networkx
def get_shortest_path(origin_coords, destination_coords):
    # Get the graph for the area
    G = ox.graph_from_point(origin_coords, dist=5000, network_type='all')

    # Convert origin and destination coordinates to nodes in the graph
    origin_node = ox.distance.nearest_nodes(G, origin_coords[1], origin_coords[0])
    destination_node = ox.distance.nearest_nodes(G, destination_coords[1], destination_coords[0])

    # Compute the shortest path between origin and destination
    shortest_path = nx.shortest_path(G, origin_node, destination_node, weight='length')

    # Get the coordinates of the shortest path
    route = [(G.nodes[node]['y'], G.nodes[node]['x']) for node in shortest_path]
    return route

# API endpoint to get the route
@app.route('/get-route', methods=['GET'])
def get_route():
    try:
        origin_lat = float(request.args.get('origin_lat'))
        origin_lon = float(request.args.get('origin_lon'))
        destination_lat = float(request.args.get('destination_lat'))
        destination_lon = float(request.args.get('destination_lon'))

        origin_coords = (origin_lat, origin_lon)
        destination_coords = (destination_lat, destination_lon)

        route = get_shortest_path(origin_coords, destination_coords)
        return jsonify(route)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Something went wrong!"}), 500

@app.route('/')
def home():
    return "Flask is working!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
