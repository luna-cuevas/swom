import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
} from '@react-google-maps/api';

type Props = {
  setWhereIsIt?: React.Dispatch<React.SetStateAction<string>>;
  city?: string;
  noSearch?: boolean;
  exactAddress?: string; // Prop for the exact address
  radius?: number; // Radius in meters
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
    if (isLoaded) {
      if (props.exactAddress) {
        // Use geocoding for the exact address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: props.exactAddress }, (results, status) => {
          if (status === 'OK' && results != null) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            setCenter({ lat, lng });
          }
        });
        if (props.setWhereIsIt) {
          props.setWhereIsIt(props.exactAddress);
        }
      } else if (city || props.city) {
        // Get the latitude and longitude of the city
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: city || props.city }, (results, status) => {
          if (status === 'OK' && results != null) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            setCenter({ lat, lng });
          }
        });
        if (props.setWhereIsIt) {
          props.setWhereIsIt(city);
        }
      }
    }
  }, [city, props.city, props.exactAddress, isLoaded, props.setWhereIsIt]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {props.noSearch ? null : (
        <input
          className="w-full rounded-xl p-2 outline-none mb-2"
          value={props.exactAddress || city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={
            props.exactAddress ? props.exactAddress : 'Search for a city'
          }
        />
      )}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}>
        {props.radius ? (
          <Circle
            center={center}
            radius={props.radius}
            options={{
              fillColor: 'red',
              fillOpacity: 0.35,
              strokeColor: 'red',
              strokeOpacity: 1,
              strokeWeight: 1,
            }}
          />
        ) : (
          <Marker position={center} />
        )}
      </GoogleMap>
    </>
  );
}
