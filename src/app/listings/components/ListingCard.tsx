"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import { toast } from "react-toastify";

interface Location {
  lat: number;
  lng: number;
  query: string;
}

interface ListingInfo {
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
  favorite?: boolean;
}

interface Props {
  listing: ListingInfo;
  setListings?: React.Dispatch<React.SetStateAction<ListingInfo[]>>;
  myListingPage?: boolean;
}

const ListingCard = ({ listing, setListings, myListingPage }: Props) => {
  const [state] = useAtom(globalStateAtom);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking favorite

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
          listingId: listing.id,
          userId: state.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setListings?.((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, favorite: !item.favorite } : item
        )
      );
    } catch (error: any) {
      toast.error(`Error toggling favorite: ${error.message}`);
    }
  };

  const listingUrl =
    listing.user_info.email === state?.user?.email
      ? !myListingPage
        ? `/listings/my-listing`
        : `/listings/my-listing?listing=${listing.id}`
      : `/listings/${listing.id}`;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow w-full">
      <div className="relative aspect-[4/3] sm:aspect-[3/2] md:aspect-[4/3]">
        <Link href={listingUrl} className="block w-full h-full">
          <Image
            src={listing.home_info.listing_images[0] || "/placeholder.png"}
            alt={listing.home_info.title}
            fill
            className="object-cover transition-transform hover:scale-105 duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        {setListings && (
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:bg-white">
            <svg
              className={`w-5 h-5 ${
                listing.favorite ? "text-red-500 fill-current" : "text-gray-600"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <Link href={listingUrl} className="block group">
          <h2 className="text-lg sm:text-xl font-semibold mb-1 text-gray-900 line-clamp-1 group-hover:text-[#172544] transition-colors">
            {listing.home_info.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-1">
            {listing.home_info.city}
          </p>
        </Link>
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>
              {listing.home_info.how_many_sleep}{" "}
              {listing.home_info.how_many_sleep === 1 ? "bed" : "beds"}
            </span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>
              {listing.home_info.bathrooms}{" "}
              {listing.home_info.bathrooms === 1 ? "bath" : "baths"}
            </span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span>{listing.home_info.area}m²</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white">
            <Image
              src={listing.user_info.profile_image_url || "/placeholder.png"}
              alt={listing.user_info.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {listing.user_info.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {listing.user_info.profession}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
