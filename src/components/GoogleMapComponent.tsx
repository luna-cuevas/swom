'use client';
import { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

export default function GoogleMapComponent({ city }: { city: string }) {
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  useEffect(() => {
    if (isLoaded) {
      // Get the latitude and longitude of the city
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: city }, (results, status) => {
        if (status === 'OK' && results != null) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          console.log(lat, lng);
          setCenter({ lat, lng });
        }
      });
    }
  }, [isLoaded, city]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={10} // Adjust the initial zoom level as needed
      center={center}>
      <Marker position={center} />
    </GoogleMap>
  );
}
