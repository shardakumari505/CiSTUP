import React, { useState } from 'react';
import '../stylesheets/map.scss';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import TextField from '@mui/material/TextField';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Map() {
    const [origin, setOrigin] = useState([12.9716, 77.5946]); // Default origin
    const [destination, setDestination] = useState([12.9716, 77.6046]); // Default destination
    const [originLocation, setOriginLocation] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');
    const [route, setRoute] = useState([]);

    const handleOriginLocationChange = (e) => setOriginLocation(e.target.value);
    const handleDestinationLocationChange = (e) => setDestinationLocation(e.target.value);

    const geocodeLocation = async (locationName) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: locationName,
                    format: 'json',
                    addressdetails: 1,
                    limit: 1,
                },
            });
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return [parseFloat(lat), parseFloat(lon)];
            }
            return null;
        } catch (error) {
            console.error('Error geocoding location:', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const originCoords = await geocodeLocation(originLocation);
        if (originCoords) setOrigin(originCoords);
        else {
            alert('Origin location not found');
            return;
        }

        const destinationCoords = await geocodeLocation(destinationLocation);
        if (destinationCoords) setDestination(destinationCoords);
        else {
            alert('Destination location not found');
            return;
        }

        if (originCoords && destinationCoords) {
            try {
                const response = await axios.get('http://127.0.0.1:5000/get-route', {
                    params: {
                        origin_lat: originCoords[0],
                        origin_lon: originCoords[1],
                        destination_lat: destinationCoords[0],
                        destination_lon: destinationCoords[1],
                    },
                });
                console.log('Route data from backend:', response.data); // Debugging check
                setRoute(response.data); // Set the route data
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        }
    };

    const UpdateMapView = () => {
        const map = useMap();
        if (route.length > 0) {
            console.log('Updating map view to fit route:', route); // Debugging check
            map.fitBounds(route);
        } else {
            map.setView(origin, 13);
        }
        return null;
    };

    const finalRoute = route.length > 0 ? route : [];
    console.log('Final route:', finalRoute); // Debugging check

    return (
        <div id="map" className="map-container-page" style={{ height: '100vh', width: '100%' }}>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className='input-field'>
                        <LocationOnOutlinedIcon
                            sx={{
                                height: '100%',
                                transform: 'scale(1.3)',
                                margin: '0 8px 0 0',
                                color: 'gray'
                            }}
                        />
                        <TextField
                            id="outlined-basic"
                            label="Origin"
                            value={originLocation}
                            onChange={handleOriginLocationChange}
                            variant="outlined" />
                    </div>
                    <div className='input-field'>
                        <LocationOnOutlinedIcon
                            sx={{
                                height: '100%',
                                transform: 'scale(1.3)',
                                margin: '0 8px 0 0',
                                color: 'gray'
                            }}
                        />
                        <TextField
                            id="outlined-basic"
                            label="Destination"
                            value={destinationLocation}
                            onChange={handleDestinationLocationChange}
                            variant="outlined" />
                    </div>
                    <button className='get-route-button' type="submit">Get Route</button>
                </form>
            </div>

            <div className='map-container'>
                <MapContainer
                    key={route.length} // Force re-render when route changes
                    center={origin}
                    zoom={13}
                    style={{ height: '100%', width: '100%', borderRadius: '10px' }}
                    maxBounds={[[12.8, 77.5], [13.1, 77.8]]}
                    maxBoundsViscosity={1.0}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">'
                    />
                    <UpdateMapView />
                    <Marker position={origin}>
                        <Popup>Origin</Popup>
                    </Marker>
                    <Marker position={destination}>
                        <Popup>Destination</Popup>
                    </Marker>
                    {finalRoute.length > 0 && (
                        <Polyline positions={finalRoute} color="red" weight={5} />
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

export default Map;
