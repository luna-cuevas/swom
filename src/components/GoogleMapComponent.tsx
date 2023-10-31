import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import Autocomplete from 'react-google-autocomplete';

type Props = {
  setWhereIsIt?: React.Dispatch<React.SetStateAction<string>>;
  city?: string;
};

export default function GoogleMapComponent(props: Props) {
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [city, setCity] = useState<string>(''); // e.g. 'New York, NY, USA'
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: ['places'],
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  useEffect(() => {
    if (isLoaded && city) {
      // Get the latitude and longitude of the city
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: city }, (results, status) => {
        if (status === 'OK' && results != null) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setCenter({ lat, lng });
        }
      });
      if (props.setWhereIsIt) {
        console.log('city', city);
        props.setWhereIsIt(city);
      }
    }
  }, [isLoaded, city]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Autocomplete
        className="w-full rounded-xl p-2 outline-none mb-2"
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
        onPlaceSelected={(place) => {
          setCity(place.formatted_address ?? '');
        }}
      />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10} // Adjust the initial zoom level as needed
        center={center}>
        <Marker position={center} />
      </GoogleMap>
    </>
  );
}
