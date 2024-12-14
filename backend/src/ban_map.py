import osmnx as ox
import pickle

# Define the city
city_name = "Bangalore, India"

# Download the graph for Bangalore (for all street types)
G = ox.graph_from_place(city_name, network_type='all')

# Save the graph to a file using pickle
with open('bangalore_graph.pkl', 'wb') as f:
    pickle.dump(G, f)

print("Graph saved to bangalore_graph.pkl")
