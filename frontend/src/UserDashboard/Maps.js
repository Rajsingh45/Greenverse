import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import './Maps.css';

const MapsPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [markers, setMarkers] = useState([]);

  const AnyReactComponent = ({ text }) => <div>{text}</div>;

  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 11
  };

  const handleLoadMap = () => {
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

  const addMarkers = () => {
    setMarkers([
      { position: { lat: 19.076, lng: 72.8777 }, message: 'Mumbai' },
      { position: { lat: 28.6139, lng: 77.2090 }, message: 'Delhi' }
    ]);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: apiKey }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onGoogleApiLoaded={({ map, maps }) => {
          addMarkers();
        }}
      >
        {markers.map((marker, index) => (
          <AnyReactComponent
            key={index}
            lat={marker.position.lat}
            lng={marker.position.lng}
            text={marker.message}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
};

export default MapsPage;
