"use client";
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  InfoWindow,
  Autocomplete,
  MarkerF,
} from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";

type Props = {
  setWhereIsIt?: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number; query: string }>
  >;
  latLng?: { lat: number; lng: number };
  whereIsIt?: { lat: number; lng: number; query: string };
  noSearch?: boolean;
  exactAddress?: { lat: number; lng: number };
  radius?: number;
  hideMap?: boolean;
  onCityChange?: (city: string) => void;
  listings?: Array<{
    id: string;
    user_info: { email: string };
    home_info: {
      address: {
        lat: number;
        lng: number;
      };
      description: string;
      title: string;
      located_in: string;
      listing_images: string[];
    };
  }>;
  marker?: boolean;
};

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function GoogleMapComponent(props: Props) {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [currentCity, setCurrentCity] = useState<string>("");
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [addressString, setAddressString] = useState<string>("");
  const [listingsLocations, setListingsLocations] = useState<any>([]);
  const [activeMarker, setActiveMarker] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [map, setMap] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const mapContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: "16px",
  };

  const zoomThreshold = 14;

  const mapOptions = {
    styles: [
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }, { lightness: 17 }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }, { lightness: 18 }],
      },
      {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }, { lightness: 16 }],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }, { lightness: 21 }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#dedede" }, { lightness: 21 }],
      },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }],
      },
    ],
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
  };

  const onPlaceChanged = () => {
    if (!autocomplete || !isMounted) return;

    const place = autocomplete.getPlace();
    if (!place || !place.geometry) return;

    setCenter({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });

    if (props.setWhereIsIt) {
      props.setWhereIsIt({
        query: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }

    setAddressString(place.formatted_address);
  };

  useEffect(() => {
    if (!isLoaded || !isMounted) return;

    if (props.exactAddress) {
      setCenter(props.exactAddress);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: props.exactAddress,
        },
        (results, status) => {
          if (status === "OK" && results?.[0]) {
            setAddressString(results[0].formatted_address);
          }
        }
      );
    }

    if (props.listings?.length) {
      const newLocations = props.listings
        .filter((listing) => {
          if (!listing?.home_info?.address) return false;
          const { lat, lng } = listing.home_info.address;
          return typeof lat === "number" && typeof lng === "number";
        })
        .map((listing) => ({
          lat: listing.home_info.address.lat,
          lng: listing.home_info.address.lng,
          id: listing.id,
          homeInfo: {
            address: listing.home_info.address,
            description: listing.home_info.description,
            title: listing.home_info.title,
            listingImages: listing.home_info.listing_images,
            locatedIn: listing.home_info.located_in,
          },
          userInfo: {
            email: listing.user_info.email,
          },
        }));

      setListingsLocations(newLocations);
    }
  }, [props.exactAddress, isLoaded, props.listings, isMounted]);

  useEffect(() => {
    if (!isLoaded || !isMounted) return;

    if (props.whereIsIt) {
      setCenter(props.whereIsIt);
      setAddressString(props.whereIsIt.query);
    }
  }, [props.whereIsIt, isLoaded, isMounted]);

  if (!isMounted) return null;
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <>
      {!props.noSearch && (
        <div className="relative z-10" id="autocomplete-container">
          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={onPlaceChanged}>
            <div className="relative">
              <input
                className="w-full rounded-xl p-4 outline-none mb-4 shadow-sm border border-gray-200 pl-12 transition-all focus:border-[#F28A38] focus:ring-2 focus:ring-[#F28A38] focus:ring-opacity-20"
                placeholder="Search for a location"
                value={addressString}
                onChange={(e) => setAddressString(e.target.value)}
                onBlur={() => {
                  if (addressString === "") {
                    props.setWhereIsIt?.({ lat: 0, lng: 0, query: "" });
                  }
                }}
              />
              <svg
                className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </Autocomplete>
        </div>
      )}
      <div
        className={`${
          props.hideMap ? "hidden" : "flex"
        } flex-grow w-full h-[60vh] rounded-xl overflow-hidden shadow-lg`}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={center}
          options={mapOptions}
          onLoad={(map) => {
            if (!map) return;
            const newCenter = map.getCenter()?.toJSON();
            if (newCenter) setCenter(newCenter);
            setMap(map);
          }}
          onZoomChanged={() => {
            if (map) {
              setZoomLevel(map.getZoom());
            }
          }}>
          {props.radius ? (
            <Circle
              center={center}
              radius={props.radius}
              options={{
                fillColor: "#F28A38",
                fillOpacity: 0.15,
                strokeColor: "#F28A38",
                strokeOpacity: 0.8,
                strokeWeight: 2,
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
                  zIndex={50000}
                />
              )}
              <Circle
                center={{ lat: location.lat, lng: location.lng }}
                onClick={() => setActiveMarker(location)}
                radius={300}
                options={{
                  fillColor: "#F28A38",
                  fillOpacity: 0.1,
                  strokeColor: "#F28A38",
                  strokeOpacity: 0.6,
                  strokeWeight: 2,
                }}
              />
            </div>
          ))}
          {activeMarker && (
            <InfoWindow
              position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
              onCloseClick={() => setActiveMarker(null)}>
              <div className="flex w-[350px] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                <Link href={`/listings/${activeMarker.id}`}>
                  <div className="group relative h-[200px] w-full overflow-hidden">
                    <Image
                      src={activeMarker.homeInfo.listingImages[0]}
                      alt="listing image"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-all duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {activeMarker.homeInfo.title}
                      </h3>
                      <p className="text-sm text-white/90">
                        {activeMarker.homeInfo.locatedIn}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                        {activeMarker.homeInfo.description ||
                          "No description available"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeMarker.homeInfo.locatedIn && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {activeMarker.homeInfo.locatedIn}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/listings/${activeMarker.id}`}
                      className="inline-flex items-center text-sm font-medium text-[#F28A38] hover:text-[#E07928]">
                      More details
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                    <Link
                      href={`/listings/${activeMarker.id}`}
                      className="inline-flex items-center rounded-lg bg-[#F28A38] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#E07928] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F28A38] focus:ring-offset-2">
                      View Listing
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </>
  );
}

export default GoogleMapComponent;
