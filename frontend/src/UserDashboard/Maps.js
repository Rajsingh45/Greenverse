import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Maps.css';

const MapsPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [markers, setMarkers] = useState([]);
  const navigate = useNavigate();

  const handleLoadMap = () => {
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      document.head.removeChild(existingScript);
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
      }
    };
  };

  return (
    <div className="maps-page">
      <h1 className="maps-title">Maps Page</h1>
      <div className="maps-inputs">
        <input
          type="text"
          className="maps-input"
          placeholder="Enter API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button className="maps-button" onClick={handleLoadMap}>Load Map</button>
      </div>
      <div id="map" className="maps-container"></div>
    </div>
  );
};

export default MapsPage;
