"use client";
import ListingCard from "@/app/listings/components/ListingCard";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterModal from "./components/FilterModal";

const GoogleMapComponent = dynamic(
  () => import("@/components/GoogleMapComponent"),
  {
    loading: () => <div>Loading map...</div>,
    ssr: false,
  }
);

interface Location {
  lat: number;
  lng: number;
  query: string;
}

interface Listing {
  id: string;
  status: string;
  created_at: string;
  is_highlighted: boolean;
  slug: string;
  highlight_tag?: string;
  global_order_rank: number;
  home_info: {
    id: string;
    title: string;
    city: string;
    description: string;
    listing_images: string[];
    address: Location;
    property_type: string;
    how_many_sleep: number;
    located_in: string;
    bathrooms: number;
    area: number;
    main_or_second: string;
  };
  user_info: {
    id: string;
    email: string;
    name: string;
    profile_image_url: string;
    profession: string;
  };
  amenities?: {
    pool?: boolean;
    gym?: boolean;
    parking?: boolean;
    ac?: boolean;
    wifi?: boolean;
    washer?: boolean;
    dryer?: boolean;
    dishwasher?: boolean;
    elevator?: boolean;
    terrace?: boolean;
    bike?: boolean;
    car?: boolean;
    tv?: boolean;
    pingpong?: boolean;
    billiards?: boolean;
    scooter?: boolean;
    bbq?: boolean;
    computer?: boolean;
    wc_access?: boolean;
    playground?: boolean;
    baby_gear?: boolean;
    fireplace?: boolean;
    hot_tub?: boolean;
    sauna?: boolean;
    other?: boolean;
    doorman?: boolean;
    cleaning_service?: boolean;
    video_games?: boolean;
    tennis_court?: boolean;
  };
  favorite?: boolean;
}

// Add this type before the Filters interface
type AmenityKey = keyof NonNullable<Listing["amenities"]>;

interface Filters {
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  mainOrSecond: string;
  amenities: {
    bike: boolean;
    car: boolean;
    tv: boolean;
    dishwasher: boolean;
    pingpong: boolean;
    billiards: boolean;
    washer: boolean;
    dryer: boolean;
    wifi: boolean;
    elevator: boolean;
    terrace: boolean;
    scooter: boolean;
    bbq: boolean;
    computer: boolean;
    wc_access: boolean;
    pool: boolean;
    playground: boolean;
    baby_gear: boolean;
    ac: boolean;
    fireplace: boolean;
    parking: boolean;
    hot_tub: boolean;
    sauna: boolean;
    other: boolean;
    doorman: boolean;
    cleaning_service: boolean;
    video_games: boolean;
    tennis_court: boolean;
    gym: boolean;
  };
}

const fetchListings = async () => {
  const response = await fetch("/api/members/getListings");
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }
  return response.json();
};

const ListingsPage = () => {
  const [state] = useAtom(globalStateAtom);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    mainOrSecond: "",
    amenities: {
      bike: false,
      car: false,
      tv: false,
      dishwasher: false,
      pingpong: false,
      billiards: false,
      washer: false,
      dryer: false,
      wifi: false,
      elevator: false,
      terrace: false,
      scooter: false,
      bbq: false,
      computer: false,
      wc_access: false,
      pool: false,
      playground: false,
      baby_gear: false,
      ac: false,
      fireplace: false,
      parking: false,
      hot_tub: false,
      sauna: false,
      other: false,
      doorman: false,
      cleaning_service: false,
      video_games: false,
      tennis_court: false,
      gym: false,
    },
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: fetchedListings = [], isLoading: queryLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
    refetchOnWindowFocus: true,
  });

  const hasActiveFilters = () => {
    return (
      filters.propertyType !== "" ||
      filters.bedrooms !== "" ||
      filters.bathrooms !== "" ||
      filters.mainOrSecond !== "" ||
      Object.values(filters.amenities).some((value) => value) ||
      searchQuery !== ""
    );
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      mainOrSecond: "",
      amenities: {
        bike: false,
        car: false,
        tv: false,
        dishwasher: false,
        pingpong: false,
        billiards: false,
        washer: false,
        dryer: false,
        wifi: false,
        elevator: false,
        terrace: false,
        scooter: false,
        bbq: false,
        computer: false,
        wc_access: false,
        pool: false,
        playground: false,
        baby_gear: false,
        ac: false,
        fireplace: false,
        parking: false,
        hot_tub: false,
        sauna: false,
        other: false,
        doorman: false,
        cleaning_service: false,
        video_games: false,
        tennis_court: false,
        gym: false,
      },
    });
    setSearchQuery("");
  };

  useEffect(() => {
    setListings(fetchedListings);
    setFilteredListings(fetchedListings);
    setIsLoading(false);
  }, [fetchedListings]);

  useEffect(() => {
    let result = [...listings];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (listing) =>
          listing.home_info.title.toLowerCase().includes(query) ||
          listing.home_info.city.toLowerCase().includes(query) ||
          listing.home_info.description.toLowerCase().includes(query)
      );
    }

    // Apply property filters
    if (filters.propertyType) {
      result = result.filter(
        (listing) =>
          listing.home_info.property_type.toLowerCase() ===
          filters.propertyType.toLowerCase()
      );
    }
    if (filters.mainOrSecond) {
      result = result.filter(
        (listing) =>
          listing.home_info.main_or_second.toLowerCase() ===
          filters.mainOrSecond.toLowerCase()
      );
    }
    if (filters.bedrooms) {
      result = result.filter(
        (listing) =>
          listing.home_info.how_many_sleep === parseInt(filters.bedrooms)
      );
    }
    if (filters.bathrooms) {
      result = result.filter(
        (listing) => listing.home_info.bathrooms === parseInt(filters.bathrooms)
      );
    }

    // Apply amenity filters
    Object.entries(filters.amenities).forEach(([amenity, isSelected]) => {
      if (isSelected) {
        result = result.filter(
          (listing) => listing.amenities?.[amenity as AmenityKey]
        );
      }
    });

    // Apply favorites filter
    if (showFavorites) {
      result = result.filter((listing) => listing.favorite);
    }

    setFilteredListings(result);
  }, [listings, filters, showFavorites, searchQuery]);

  // Update map focus when filtered listings change
  useEffect(() => {
    if (showMap && filteredListings.length > 0) {
      // Focus on the first listing in the filtered results
      const firstListing = filteredListings[0];
      if (
        firstListing?.home_info?.address?.lat &&
        firstListing?.home_info?.address?.lng
      ) {
        // Map will automatically update due to prop changes
      }
    }
  }, [showMap, filteredListings]);

  if (isLoading || queryLoading) {
    return (
      <div
        role="status"
        className=" flex m-auto min-h-screen align-middle w-fit my-auto mx-auto px-3 py-2 text-white rounded-xl">
        <svg
          aria-hidden="true"
          className="m-auto w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-[#7F8119]"
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
    <main className="min-h-screen bg-[#F7F1EE]">
      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters()}
      />

      {/* Header with search and controls */}
      <div className=" top-0 z-10 bg-[#F7F1EE] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by city, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#172544] bg-white pl-12 focus:outline-none focus:ring-2 focus:ring-[#172544] focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
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
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2 rounded-lg border border-[#172544] ${
                  showMap
                    ? "bg-[#172544] text-white"
                    : "bg-white text-[#172544]"
                }`}>
                {showMap ? "Show List" : "Show Map"}
              </button>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`px-4 py-2 rounded-lg border border-[#172544] ${
                  showFavorites
                    ? "bg-[#172544] text-white"
                    : "bg-white text-[#172544]"
                }`}>
                {showFavorites ? "Show All" : "Show Favorites"}
              </button>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 rounded-lg border border-[#172544] bg-white flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>Filters {hasActiveFilters() && "(Active)"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No listings found</h2>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : showMap ? (
          <div className="h-[calc(100vh-12rem)] rounded-xl overflow-hidden">
            <GoogleMapComponent
              exactAddress={
                filteredListings[0]?.home_info?.address
                  ? {
                      lat: filteredListings[0].home_info.address.lat,
                      lng: filteredListings[0].home_info.address.lng,
                    }
                  : undefined
              }
              listings={filteredListings.map((listing) => ({
                id: listing.id,
                user_info: {
                  email: listing.user_info.email,
                },
                home_info: {
                  address: listing.home_info.address,
                  description: listing.home_info.description,
                  title: listing.home_info.title,
                  located_in: listing.home_info.located_in,
                  listing_images: listing.home_info.listing_images,
                },
              }))}
              noSearch={true}
              radius={300}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                setListings={setListings}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ListingsPage;
