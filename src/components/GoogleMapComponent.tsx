import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  Marker,
  MarkerF,
  Circle,
  useLoadScript,
  InfoWindow,
  Rectangle,
  OverlayView,
  OverlayViewF,
  Autocomplete,
} from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';
import ImageUrlBuilder from '@sanity/image-url';
import { sanityClient } from '../utils/sanityClient';

type Props = {
  setWhereIsIt?: React.Dispatch<React.SetStateAction<object>>;
  setIsSearching?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsIdle?: React.Dispatch<React.SetStateAction<boolean>>;
  newLocation?: (location: string) => void;
  city?: string;
  noSearch?: boolean;
  exactAddress?: string | { lat: number; lng: number };
  radius?: number; // Radius in meters
  hideMap?: boolean;
  listings?: Array<{
    user_id: string;
    userInfo: {
      email: string;
    };
    homeInfo: {
      address: string;
      description: string;
      title: string;
      locatedIn: string;
      listingImages: {
        src: string;
      }[];
    };
  }>;
};

export default function GoogleMapComponent(props: Props) {
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [location, setLocation] = useState<string>(''); // e.g. 'New York, NY, USA'
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: ['places', 'geometry'],
  });
  const [listingsLocations, setListingsLocations] = useState<any>([]);
  const [activeMarker, setActiveMarker] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [map, setMap] = useState<any>(null);
  const [inputValue, setInputValue] = useState<any>(props.exactAddress || '');
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const builder = ImageUrlBuilder(sanityClient);

  function urlFor(source: any) {
    return builder.image(source);
  }
  const mapContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };

  const zoomThreshold = 15;

  const [autocomplete, setAutocomplete] = useState<any>(null);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      const address = place.formatted_address;
      setCenter({
        lat: location?.lat() ?? 0,
        lng: location?.lng() ?? 0,
      });
      setInputValue(address ?? '');
      props.setWhereIsIt &&
        props.setWhereIsIt({
          lat: location?.lat() ?? 0,
          lng: location?.lng() ?? 0,
        });
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const handleMarkerClick = (markerInfo: any) => {
    setActiveMarker(markerInfo);
  };

  useEffect(() => {
    if (isLoaded) {
      const geocoder = new window.google.maps.Geocoder();

      if (props.listings && props.listings.length > 0) {
        props.listings.forEach((listing) => {
          geocoder.geocode(
            { address: listing?.homeInfo?.address },
            (results, status) => {
              if (status === 'OK' && results != null) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                setListingsLocations((listingsLocations: any) => [
                  ...listingsLocations,
                  {
                    lat,
                    lng,
                    homeInfo: {
                      id: listing.user_id,
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
                console.error(
                  'Geocode was not successful for the following reason:',
                  status
                );
              }
            }
          );
        });
      }

      if (
        props.exactAddress &&
        !inputValue &&
        typeof props.exactAddress == 'string'
      ) {
        // Use geocoding for the exact address
        console.log('props.exactAddress && !inputValue');
        geocoder.geocode({ address: props.exactAddress }, (results, status) => {
          if (status === 'OK' && results != null) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            setCenter({ lat, lng });
          }
        });
        if (props.setWhereIsIt) {
          props.setWhereIsIt({ lat: center.lat, lng: center.lng });
        }
      } else if ((location || props.city) && !inputValue) {
        console.log('(location || props.city) && !inputValue');

        console.log('location', location);
        console.log('props.city', props.city);
        console.log('inputValue', inputValue);
        // Get the latitude and longitude of the city
        geocoder.geocode(
          { address: location || props.city },
          (results, status) => {
            if (status === 'OK' && results != null) {
              const location = results[0].geometry.location;
              const lat = location.lat();
              const lng = location.lng();
              setCenter({ lat, lng });
            }
          }
        );
        if (props.setWhereIsIt) {
          props.setWhereIsIt({ lat: center.lat, lng: center.lng });
        }
      } else if (inputValue) {
        // Get the latitude and longitude of the exact address
        console.log('inputValue', inputValue);

        if (typeof inputValue == 'string') {
          geocoder.geocode({ address: inputValue }, (results, status) => {
            if (status === 'OK' && results != null) {
              const location = results[0].geometry.location;
              const lat = location.lat();
              const lng = location.lng();
              setCenter({ lat, lng });
            }
          });
        } else if (typeof inputValue == 'object') {
          setCenter({ lat: inputValue.lat, lng: inputValue.lng });
        }
      }
    }
  }, [
    location,
    props.city,
    props.exactAddress,
    isLoaded,
    props.setWhereIsIt,
    inputValue,
  ]);

  useEffect(() => {
    // Update the local input state when the exactAddress prop changes

    // convert lat and lng to string for the input value using google maps geocoding
    if (typeof props.exactAddress == 'object') {
      if (!isLoaded) return;
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
            setInputValue(results[0].formatted_address);
          }
        }
      );
    } else {
      setInputValue(props.city);
    }
  }, [props.exactAddress, props.city]);

  // Debounce function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: any;
    return function (...args: any[]) {
      clearTimeout(timer as any);
      timer = setTimeout(() => {
        // @ts-ignore
        func.apply(this, args);
      }, delay);
    };
  };

  // Use useCallback to memorize the debounced function
  const debouncedInputChange = useCallback(
    debounce((value) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: value }, (results, status) => {
        if (status === 'OK' && results != null) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setDebouncedValue({ lat, lng });
        }
      });
    }, 0.1),
    []
  );

  // Effect to handle the debounced input value change
  useEffect(() => {
    if (props.setWhereIsIt) {
      props.setWhereIsIt(debouncedValue);
    }
    console.log('debouncedValue', debouncedValue);
  }, [debouncedValue]);

  if (!isLoaded) {
    return (
      <div
        role="status"
        className=" h-fit w-fit my-auto mx-auto px-3 py-2 text-white rounded-xl">
        <svg
          aria-hidden="true"
          className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-[#7F8119]"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#fff"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* {props.noSearch ? null : (
        <input
          className="w-full rounded-xl p-2 outline-none mb-2"
          value={inputValue}
          onChange={(e) => {
            debouncedInputChange(e.target.value);
            setInputValue(e.target.value);
            if (props.setIsSearching) {
              props.setIsSearching(true);
            }
          }}
          onBlur={() => {
            if (props.setIsSearching) {
              props.setIsSearching(false);
            }
          }}
          placeholder={
            typeof props.exactAddress == 'string'
              ? props.exactAddress
              : 'Search for a city'
          }
        />
      )} */}
      {props.noSearch ? null : (
        <Autocomplete
          onLoad={(autocomplete) => setAutocomplete(autocomplete)}
          onPlaceChanged={onPlaceChanged}>
          <input
            className="w-full rounded-xl p-2 outline-none mb-2"
            value={inputValue}
            onChange={(e) => {
              debouncedInputChange(e.target.value);
              setInputValue(e.target.value);
              if (props.setIsSearching) {
                props.setIsSearching(true);
              }
            }}
            onBlur={() => {
              if (props.setIsSearching) {
                props.setIsSearching(false);
              }
            }}
            placeholder={
              typeof props.exactAddress == 'string'
                ? props.exactAddress
                : 'Search for a city'
            }
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
          onLoad={(map) => {
            setMap(map);
          }}
          onIdle={() => {
            setTimeout(() => {
              if (props.setIsIdle) {
                console.log('idle');
                props.setIsIdle(true);
              }
            }, 3000);
          }}
          onZoomChanged={() => {
            if (map) {
              setZoomLevel(map.getZoom());
            }
          }}
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
          ) : props.city || props.exactAddress ? (
            <Marker position={center} zIndex={50000} />
          ) : null}

          {listingsLocations.map((location: any, index: number) => (
            <div key={index}>
              {zoomLevel < zoomThreshold && (
                <MarkerF
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleMarkerClick(location)}
                  zIndex={50000}></MarkerF>
              )}
              <Circle
                center={{ lat: location.lat, lng: location.lng }}
                onClick={() => handleMarkerClick(location)}
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
              <div className="flex text-center w-full h-full px-4 flex-col">
                <div className="w-full h-[50px] relative">
                  <Image
                    src={urlFor(activeMarker.homeInfo.listingImages[0]).url()}
                    alt="listing image"
                    fill
                    objectFit="cover"
                    className="rounded-t-xl"
                  />
                </div>
                <p className="text-lg">{activeMarker.homeInfo.title}</p>
                <p className="text-sm">{activeMarker.homeInfo.description}</p>
                <button className="px-2 py-1 rounded-xl font-bold w-fit mx-auto text-white bg-[#F28A38] mt-2">
                  <Link href={`/listings/${activeMarker.userInfo.email}`}>
                    View Listing
                  </Link>
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </>
  );
}
