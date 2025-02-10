"use client";
import ListingCard from "@/app/(pages)/listings/components/ListingCard";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

  // Add new state for all listings
  const [allListings, setAllListings] = useState<Listing[]>([]);

  const queryClient = useQueryClient();

  // Load state from URL parameters on initial load
  useEffect(() => {
    const loadStateFromURL = async () => {
      const page = searchParams.get("page");
      const map = searchParams.get("map");
      const search = searchParams.get("search");
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const locationQuery = searchParams.get("locationQuery");
      const favorites = searchParams.get("favorites");

      // Load individual filter parameters
      const propertyType = searchParams.get("type");
      const bedrooms = searchParams.get("beds");
      const bathrooms = searchParams.get("baths");
      const mainOrSecond = searchParams.get("residence");

      // Load amenities from URL
      const amenityParams = Array.from(searchParams.entries())
        .filter(([key]) => key.startsWith("amenity-"))
        .reduce(
          (acc, [key, value]) => {
            const amenityName = key.replace("amenity-", "");
            acc[amenityName] = value === "true";
            return acc;
          },
          {} as Record<string, boolean>
        );

      // Set initial states
      if (page) setCurrentPage(parseInt(page));
      if (map) setShowMap(map === "true");
      if (favorites) setShowFavorites(favorites === "true");
      if (search) {
        setSearchQuery(search);
        setDebouncedSearchQuery(search);
      }
      if (lat && lng && locationQuery) {
        setWhereIsIt({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          query: locationQuery,
        });
      }

      // Set filters if any are present
      const newFilters = {
        propertyType: propertyType || "",
        bedrooms: bedrooms || "",
        bathrooms: bathrooms || "",
        mainOrSecond: mainOrSecond || "",
        amenities: {
          ...filters.amenities,
          ...amenityParams,
        },
      };

      if (
        propertyType ||
        bedrooms ||
        bathrooms ||
        mainOrSecond ||
        Object.keys(amenityParams).length > 0
      ) {
        setFilters(newFilters);
        setIsFiltered(true);
      }
    };

    loadStateFromURL();
  }, [searchParams]);

  // Update URL parameters when state changes
  useEffect(() => {
    const updateURL = () => {
      const params = new URLSearchParams();

      // Add basic parameters
      if (currentPage > 1) params.set("page", currentPage.toString());
      if (showMap) params.set("map", "true");
      if (showFavorites) params.set("favorites", "true");
      if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);

      // Add location parameters
      if (whereIsIt.lat !== 0 && whereIsIt.lng !== 0) {
        params.set("lat", whereIsIt.lat.toString());
        params.set("lng", whereIsIt.lng.toString());
        params.set("locationQuery", whereIsIt.query);
      }

      // Add filter parameters in a SEO-friendly way
      if (filters.propertyType) params.set("type", filters.propertyType);
      if (filters.bedrooms) params.set("beds", filters.bedrooms);
      if (filters.bathrooms) params.set("baths", filters.bathrooms);
      if (filters.mainOrSecond) params.set("residence", filters.mainOrSecond);

      // Add active amenities
      Object.entries(filters.amenities).forEach(([key, value]) => {
        if (value === true) {
          params.set(`amenity-${key}`, "true");
        }
      });

      // Update URL without triggering navigation
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    };

    // Debounce the URL update to prevent too frequent updates
    const timeoutId = setTimeout(updateURL, 100);
    return () => clearTimeout(timeoutId);
  }, [
    currentPage,
    showMap,
    debouncedSearchQuery,
    whereIsIt,
    filters,
    isFiltered,
    showFavorites,
  ]);

  // Update isFiltered state when filters change
  useEffect(() => {
    setIsFiltered(hasActiveFilters());
  }, [filters, searchQuery]);

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

  // Modify the fetchListings function to get all listings at once
  const fetchAllListings = async (search: string = "") => {
    console.log("search", search);

    const response = await fetch(
      `/api/members/getListings?page=1&limit=1000&search=${encodeURIComponent(search)}${state.user?.id ? `&userId=${state.user.id}` : ""}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }
    return response.json();
  };

  // Update the query to fetch all listings
  const {
    data: listingsData = {
      listings: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      isFiltered: false,
    },
    isLoading: queryLoading,
    refetch: refetchListings,
  } = useQuery<ListingsResponse & { isFiltered: boolean }>({
    queryKey: ["listings", debouncedSearchQuery],
    queryFn: () => fetchAllListings(debouncedSearchQuery),
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

  // Modify the filtering effect to handle pagination
  useEffect(() => {
    if (!listings.length) return;

    let result = [...listings];

    // Apply all filters
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

    // Store all filtered results
    setAllListings(result);

    // Calculate pagination
    const startIndex = (currentPage - 1) * 9;
    const endIndex = startIndex + 9;
    const paginatedResults = result.slice(startIndex, endIndex);

    // Update state
    setFilteredListings(paginatedResults);
    setTotalCount(result.length);
    setTotalPages(Math.ceil(result.length / 9));
  }, [listings, filters, showFavorites, searchQuery, currentPage]);

  // Update initial listings effect
  useEffect(() => {
    setListings(listingsData.listings);
    setAllListings(listingsData.listings);
    setIsFiltered(listingsData.isFiltered);
    setIsLoading(false);
  }, [listingsData]);

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

  const toggleFavorite = async (listingId: string) => {
    if (!state.user?.id) {
      toast.error("Please log in to favorite listings");
      return;
    }

    try {
      const response = await fetch("/api/members/toggleFavorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          userId: state.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update both listings and filteredListings
      const updateListingState = (prev: Listing[]) =>
        prev.map((item) =>
          item.id === listingId ? { ...item, favorite: !item.favorite } : item
        );

      setListings(updateListingState);
      setFilteredListings(updateListingState);

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      await refetchListings();

      toast.success(
        data.favorite ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error: any) {
      toast.error(`Error toggling favorite: ${error.message}`);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="w-full sm:w-auto flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedSetSearch(e.target.value);
                }}
                placeholder="Search listings..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#172544] focus:border-transparent"
              />
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:border-[#172544] hover:text-[#172544] transition-colors flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
                {hasActiveFilters() && (
                  <span className="w-2 h-2 rounded-full bg-[#172544]" />
                )}
              </button>
              <button
                onClick={() => {
                  if (!state.user?.id) {
                    toast.error("Please log in to view favorites");
                    return;
                  }
                  setShowFavorites(!showFavorites);
                }}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${
                  showFavorites
                    ? "bg-[#172544] text-white border-[#172544]"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#172544] hover:text-[#172544]"
                }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={showFavorites ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                Favorites
                {showFavorites && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:border-[#172544] hover:text-[#172544] transition-colors flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex flex-col lg:flex-row gap-6`}>
            {/* Map */}
            {showMap && (
              <div className="w-full lg:w-1/2 h-[70vh] mb-6 rounded-xl overflow-hidden order-1 lg:order-2">
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
                      name: listing.user_info.name,
                      profile_image_url: listing.user_info.profile_image_url,
                      profession: listing.user_info.profession,
                    },
                    home_info: {
                      address: listing.home_info.address,
                      description: listing.home_info.description,
                      title: listing.home_info.title,
                      located_in: listing.home_info.located_in,
                      listing_images: listing.home_info.listing_images,
                      property_type: listing.home_info.property_type,
                      how_many_sleep: listing.home_info.how_many_sleep,
                      bathrooms: listing.home_info.bathrooms,
                      area: listing.home_info.area,
                      city: listing.home_info.city,
                    },
                  }))}
                  noSearch={true}
                  radius={300}
                />
              </div>
            )}

            {/* Listings Grid */}
            <div
              className={`w-full ${showMap ? "lg:w-1/2" : ""} order-2 lg:order-1`}>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Loading skeletons */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        setListings={setFilteredListings}
                        toggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                  {filteredListings.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No listings found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    {renderPaginationControls()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters()}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default ListingsPage;
