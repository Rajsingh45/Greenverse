import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import './Maps.css'; // Ensure this is imported

const MapsPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [markers, setMarkers] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const AnyReactComponent = ({ text }) => <div>{text}</div>;

  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 11
  };

  const handleLoadMap = () => {
    if (!apiKey) {
      window.alert('Please enter a valid API key.');
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.initMap = () => {
      try {
        const map = new window.google.maps.Map(document.getElementById('map'), {
          center: mapCenter,
          zoom: 13,
        });
        setMapCenter({ lat: 19.076, lng: 72.8777 }); // Mumbai coordinates

        markers.forEach((marker) => {
          new window.google.maps.Marker({
            position: marker.position,
            map: map,
            title: marker.message,
          });
        });
      } catch (error) {
        window.alert('Error initializing map. Check console for details.');
        console.error('Map initialization error:', error);
      }
    };

    script.onerror = () => {
      window.alert('Invalid API key. Please check and try again.');
    };

    script.onload = () => {
      if (!window.google || !window.google.maps) {
        window.alert('Failed to load Google Maps API. Please check your API key.');
      } else {
        setMapLoaded(true);
      }
    };
  };

  const addMarkers = () => {
    setMarkers([
      { position: { lat: 19.076, lng: 72.8777 }, message: 'Mumbai' },
      { position: { lat: 28.6139, lng: 77.2090 }, message: 'Delhi' }
    ]);
  };

  return (
    <div className="map-container">
      {!mapLoaded ? (
        <div className="input-container">
          <input
            className="api-key-input"
            type="text"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            className="load-map-button"
            onClick={handleLoadMap}
          >
            Load Map
          </button>
        </div>
      ) : (
        <div id="map" className="map"></div>
      )}
    </div>
  );
};

export default MapsPage;
