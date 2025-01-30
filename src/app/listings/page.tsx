"use client";
import ListingCard from "@/app/listings/components/ListingCard";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterModal from "./components/FilterModal";
import { useSearchParams, useRouter } from "next/navigation";
import debounce from "lodash/debounce";

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

interface ListingsResponse {
  listings: Listing[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const fetchListings = async (
  page: number = 1,
  limit: number = 9,
  search: string = ""
) => {
  const response = await fetch(
    `/api/members/getListings?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [whereIsIt, setWhereIsIt] = useState<{
    lat: number;
    lng: number;
    query: string;
  }>({
    lat: 0,
    lng: 0,
    query: "",
  });
  const [inputValue, setInputValue] = useState("");
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFiltered, setIsFiltered] = useState(false);

  // Create a debounced search function
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500), // 500ms delay
    []
  );

  // Cleanup the debounced function on component unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const {
    data: listingsData = {
      listings: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      isFiltered: false,
    },
    isLoading: queryLoading,
  } = useQuery<ListingsResponse & { isFiltered: boolean }>({
    queryKey: ["listings", currentPage, debouncedSearchQuery],
    queryFn: () => fetchListings(currentPage, 9, debouncedSearchQuery),
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
    setListings(listingsData.listings);
    setFilteredListings(listingsData.listings);
    setTotalPages(listingsData.totalPages);
    setTotalCount(listingsData.totalCount);
    setIsFiltered(listingsData.isFiltered);
    setIsLoading(false);
  }, [listingsData]);

  // Separate effect for filtering
  useEffect(() => {
    if (!listings.length) return;

    let result = [...listings];

    // Apply property filters
    if (filters.propertyType) {
      result = result.filter(
        (listing) =>
          listing?.home_info?.property_type?.toLowerCase() ===
          filters.propertyType.toLowerCase()
      );
    }
    if (filters.mainOrSecond) {
      result = result.filter(
        (listing) =>
          listing?.home_info?.main_or_second?.toLowerCase() ===
          filters.mainOrSecond.toLowerCase()
      );
    }
    if (filters.bedrooms) {
      result = result.filter(
        (listing) =>
          listing?.home_info?.how_many_sleep === parseInt(filters.bedrooms)
      );
    }
    if (filters.bathrooms) {
      result = result.filter(
        (listing) =>
          listing?.home_info?.bathrooms === parseInt(filters.bathrooms)
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (listing) =>
          (listing?.home_info?.title?.toLowerCase()?.includes(query) ||
            listing?.home_info?.city?.toLowerCase()?.includes(query) ||
            listing?.home_info?.description?.toLowerCase()?.includes(query)) ??
          false
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

  // Handle whereIsIt changes
  useEffect(() => {
    console.log("whereIsIt", whereIsIt);
    if (!whereIsIt || !whereIsIt.lat || !whereIsIt.lng || !listings.length)
      return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: whereIsIt.lat, lng: whereIsIt.lng } },
      (results, status) => {
        if (status === "OK" && results?.[0]) {
          const cityComponent = results[0].address_components?.find(
            (component) =>
              component.types.includes("locality") ||
              component.types.includes("administrative_area_level_1")
          );
          if (cityComponent) {
            setInputValue(cityComponent.long_name);
          }
        }
      }
    );
  }, [whereIsIt?.lat, whereIsIt?.lng, listings.length]);

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = isFiltered ? totalPages : Math.min(5, totalPages);
    let startPage = 1;
    let endPage = maxVisiblePages;

    if (currentPage > 3 && !isFiltered) {
      startPage = currentPage - 2;
      endPage = Math.min(currentPage + 2, totalPages);
    }

    return (
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg border border-[#172544] ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-[#172544] hover:bg-[#172544] hover:text-white"
          }`}>
          Previous
        </button>

        <div className="flex items-center gap-2">
          {currentPage > 3 && !isFiltered && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="w-10 h-10 rounded-lg border border-[#172544] bg-white text-[#172544] hover:bg-[#172544] hover:text-white">
                1
              </button>
              {currentPage > 4 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-lg border border-[#172544] ${
                currentPage === page
                  ? "bg-[#172544] text-white"
                  : "bg-white text-[#172544] hover:bg-[#172544] hover:text-white"
              }`}>
              {page}
            </button>
          ))}

          {endPage < totalPages && !isFiltered && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="w-10 h-10 rounded-lg border border-[#172544] bg-white text-[#172544] hover:bg-[#172544] hover:text-white">
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg border border-[#172544] ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-[#172544] hover:bg-[#172544] hover:text-white"
          }`}>
          Next
        </button>
      </div>
    );
  };

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedSetSearch(e.target.value);
                }}
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
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    debouncedSetSearch("");
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
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

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex pb-8">
          {/* Debug logs */}
          <div style={{ display: "none" }}>
            {JSON.stringify({ whereIsIt, inputValue })}
          </div>
          <div
            className={`m-auto ${whereIsIt.lat && whereIsIt.lng ? "flex flex-col w-fit" : "hidden"}`}>
            <p className="text-2xl">Say hello to</p>
            <h2 className="text-3xl capitalize">
              {whereIsIt.lat && whereIsIt.lng ? inputValue : "the world."}
            </h2>
          </div>
          <h1
            className={`text-3xl m-auto ${whereIsIt.lat && whereIsIt.lng ? "text-right" : "text-center"}`}>
            Let&apos;s discover your <br /> new adventure.
          </h1>
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
              setWhereIsIt={(newState) => {
                if (typeof newState === "function") {
                  setWhereIsIt(newState);
                  return;
                }
                console.log("Setting whereIsIt to:", newState);
                setWhereIsIt(newState);
                if (newState.query) {
                  setInputValue(newState.query);
                  console.log("Setting inputValue to:", newState.query);
                }
              }}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  setListings={setListings}
                />
              ))}
            </div>

            {renderPaginationControls()}
          </>
        )}
      </div>
    </main>
  );
};

export default ListingsPage;
