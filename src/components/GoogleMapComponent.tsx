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
    user_info: {
      email: string;
      name: string;
      profile_image_url: string;
      profession: string;
    };
    home_info: {
      address: {
        lat: number;
        lng: number;
      };
      description: string;
      title: string;
      located_in: string;
      listing_images: string[];
      property_type: string;
      how_many_sleep: number;
      bathrooms: number;
      area: number;
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
    borderRadius: "12px",
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
            propertyType: listing.home_info.property_type,
            howManySleep: listing.home_info.how_many_sleep,
            bathrooms: listing.home_info.bathrooms,
            area: listing.home_info.area,
          },
          userInfo: {
            email: listing.user_info.email,
            name: listing.user_info.name,
            profileImageUrl: listing.user_info.profile_image_url,
            profession: listing.user_info.profession,
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

  const getMarkerIcon = (isActive: boolean = false) => {
    if (!isLoaded) return null;

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isActive ? "#E07928" : "#F28A38",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#FFFFFF",
      scale: isActive ? 12 : 10,
    };
  };

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
                className="w-full rounded-xl p-3 sm:p-4 outline-none mb-4 shadow-sm border border-gray-200 pl-12 transition-all focus:border-[#F28A38] focus:ring-2 focus:ring-[#F28A38] focus:ring-opacity-20"
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
                className="w-5 h-5 sm:w-6 sm:h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
        } flex-grow w-full h-full rounded-xl overflow-hidden shadow-lg transition-all duration-300`}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={center}
          options={{
            ...mapOptions,
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#333333" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9f5f9" }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }],
              },
              {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#f0f0f0" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#e8f7e6" }],
              },
              {
                featureType: "transit.station",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }],
              },
            ],
          }}
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
            <MarkerF
              position={center}
              zIndex={50000}
              options={{
                optimized: true,
                icon: getMarkerIcon(false),
              }}
            />
          ) : null}

          {listingsLocations.map((location: any, index: number) => (
            <div key={index}>
              {zoomLevel < zoomThreshold && (
                <MarkerF
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => setActiveMarker(location)}
                  zIndex={activeMarker?.id === location.id ? 50001 : 50000}
                  options={{
                    optimized: true,
                    icon: getMarkerIcon(activeMarker?.id === location.id),
                    animation:
                      activeMarker?.id === location.id
                        ? google.maps.Animation.BOUNCE
                        : undefined,
                  }}
                />
              )}
              <Circle
                center={{ lat: location.lat, lng: location.lng }}
                onClick={() => setActiveMarker(location)}
                radius={300}
                options={{
                  fillColor: "#F28A38",
                  fillOpacity: activeMarker?.id === location.id ? 0.2 : 0.1,
                  strokeColor: "#F28A38",
                  strokeOpacity: activeMarker?.id === location.id ? 0.8 : 0.6,
                  strokeWeight: activeMarker?.id === location.id ? 3 : 2,
                }}
              />
            </div>
          ))}
          {activeMarker && (
            <InfoWindow
              position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
              onCloseClick={() => setActiveMarker(null)}
              options={{
                pixelOffset: new google.maps.Size(0, -5),
              }}>
              <div
                className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg"
                style={{ maxWidth: "320px", minWidth: "280px" }}>
                <Link
                  href={`/listings/${activeMarker.id}`}
                  className="relative group">
                  <div className="relative h-[180px] w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={activeMarker.homeInfo.listingImages[0]}
                      alt={activeMarker.homeInfo.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 280px, 320px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Add favorite functionality here
                      }}>
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </Link>
                <div className="p-4">
                  <Link
                    href={`/listings/${activeMarker.id}`}
                    className="block group">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#172544] transition-colors line-clamp-1">
                      {activeMarker.homeInfo.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mb-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1.5 text-gray-500"
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
                      {activeMarker.homeInfo.propertyType
                        ?.charAt(0)
                        .toUpperCase() +
                        activeMarker.homeInfo.propertyType?.slice(1) ||
                        "Property"}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        {activeMarker.homeInfo.howManySleep} beds
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        {activeMarker.homeInfo.bathrooms} baths
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                        {activeMarker.homeInfo.area}m²
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white">
                        <Image
                          src={
                            activeMarker.userInfo.profileImageUrl ||
                            "/placeholder.png"
                          }
                          alt={activeMarker.userInfo.name || "Host"}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activeMarker.userInfo.name || "Host"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activeMarker.userInfo.profession || "Property Host"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        className="text-sm font-medium text-[#172544] hover:text-[#0f1a2e] transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/listings/${activeMarker.id}`;
                        }}>
                        View details
                        <svg
                          className="w-4 h-4"
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
                      </button>
                    </div>
                  </Link>
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
