import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  InfoWindow,
  Autocomplete,
  MarkerF,
} from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '../utils/sanityClient';
import { urlForImage } from '../../sanity/lib/image';

type Props = {
  setWhereIsIt?: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number }>
  >;
  whereIsIt?: { lat: number; lng: number };
  noSearch?: boolean;
  exactAddress?: { lat: number; lng: number };
  radius?: number;
  hideMap?: boolean;
  listings?: Array<{
    _id: string;
    userInfo: { email: string };
    homeInfo: {
      address: {
        lat: number;
        lng: number;
      };
      description: string;
      title: string;
      locatedIn: string;
      listingImages: { src: string }[];
    };
  }>;
};

export default function GoogleMapComponent(props: Props) {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: ['places', 'geometry'],
  });

  const [addressString, setAddressString] = useState<string>('');
  const [listingsLocations, setListingsLocations] = useState<any>([]);
  const [activeMarker, setActiveMarker] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [map, setMap] = useState<any>(null);
  const mapContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };

  const zoomThreshold = 15;

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && isLoaded) {
        setCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        props.setWhereIsIt &&
          props.setWhereIsIt({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        // convert lat and lng to string for the input value using google maps geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          {
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          },
          (results, status) => {
            if (status === 'OK' && results != null) {
              setAddressString(results[0].formatted_address);
            }
          }
        );
      }
    }
  };

  // Directly set center from exactAddress or geocode city
  useEffect(() => {
    if (props.exactAddress && isLoaded) {
      setCenter(props.exactAddress);
      // convert lat and lng to string for the input value using google maps geocoding
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        {
          location: {
            lat: props.exactAddress.lat,
            lng: props.exactAddress.lng,
          },
        },
        (results, status) => {
          if (status === 'OK' && results != null) {
            setAddressString(results[0].formatted_address);
          }
        }
      );
    }

    if (props.listings && props.listings.length > 0) {
      props.listings.forEach((listing) => {
        // If address already contains lat and lng, use them directly
        const lat = listing.homeInfo.address?.lat;
        const lng = listing.homeInfo.address?.lng;
        if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
          setListingsLocations((listingsLocations: any) => [
            ...listingsLocations,
            {
              lat,
              lng,
              _id: listing._id,
              homeInfo: {
                address: listing.homeInfo.address,
                description: listing.homeInfo.description,
                title: listing.homeInfo.title,
                listingImages: listing.homeInfo.listingImages,
                locatedIn: listing.homeInfo.locatedIn,
              },
              userInfo: {
                email: listing.userInfo.email,
              },
            },
          ]);
        } else {
          console.log('No listings found');
        }
      });
    }
  }, [props.exactAddress, isLoaded, props.listings]);

  useEffect(() => { 
    if (props.whereIsIt) {
      setCenter(props.whereIsIt);
    }
  }, [props.whereIsIt]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!props.noSearch && (
        <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
          <input
            className="w-full rounded-xl p-2 outline-none mb-2"
            placeholder="Search for a location"
            value={addressString}
            onChange={(e) => setAddressString(e.target.value)}
            onBlur={() => {
              if (addressString === '') {
                props.setWhereIsIt && props.setWhereIsIt({ lat: 0, lng: 0 });
              }
            }}
          />
        </Autocomplete>
      )}
      <div
        className={`${
          props.hideMap ? 'hidden' : 'flex'
        } flex-grow w-full h-[40vh] rounded-xl`}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={center}
          onLoad={(map) => {
            setCenter(
              ((map?.getCenter() ?? {}) as google.maps.LatLng).toJSON()
            );
            setMap(map);
          }}
          onZoomChanged={() => {
            if (map) {
              setZoomLevel(map.getZoom());
            }
          }}>
          {/* Marker for exact location */}
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
          ) : props.exactAddress ? (
            <Marker position={center} zIndex={50000} />
          ) : null}

          {listingsLocations.map((location: any, index: number) => (
            <div key={index}>
              {zoomLevel < zoomThreshold && (
                <MarkerF
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => setActiveMarker(location)}
                  zIndex={50000}></MarkerF>
              )}
              <Circle
                center={{ lat: location.lat, lng: location.lng }}
                onClick={() => setActiveMarker(location)}
                radius={100}
                options={{
                  fillColor: 'red',
                  fillOpacity: 0.05,
                  strokeColor: 'red',
                  strokeOpacity: 1,
                  strokeWeight: 1,
                }}
              />
            </div>
          ))}
          {activeMarker && (
            <InfoWindow
              position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
              onCloseClick={() => setActiveMarker(null)}>
              <div className="flex  w-[200px] h-full  flex-col">
                <Link href={`/listings/${activeMarker._id}`}>
                  <div className="w-full h-[100px] relative">
                    <Image
                      src={urlForImage(
                        activeMarker.homeInfo.listingImages[0].asset
                      )}
                      alt="listing image"
                      fill
                      objectFit="cover"
                      className="rounded-t-xl"
                    />
                  </div>
                </Link>
                <p className="text-lg text-center my-1">
                  {activeMarker.homeInfo.title}
                </p>
                <p className="text-sm">
                  {activeMarker.homeInfo.description
                    ? activeMarker.homeInfo.description.slice(0, 2000)
                    : 'No description available'}
                </p>
                <button className="px-2 py-1 rounded-xl font-bold w-fit mx-auto text-white bg-[#F28A38] mt-2">
                  <Link href={`/listings/${activeMarker._id}`}>
                    View Listing
                  </Link>
                </button>
              </div>
            </InfoWindow>
          )}

          {/* Other functionalities like showing listings could also be added here */}
        </GoogleMap>
      </div>
    </>
  );
}
