"use client";
import CarouselPage from "@/components/Carousel";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import dynamic from "next/dynamic";

const GoogleMapComponent = dynamic(
  () => import("@/components/GoogleMapComponent"),
  {
    loading: () => <div>Loading map...</div>,
    ssr: false,
  }
);

const Page = () => {
  const pathName = usePathname();
  const slug = pathName.split("/listings/")[1];
  const [state] = useAtom(globalStateAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [mapsActive, setMapsActive] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  console.log(slug);

  const fetchListing = async () => {
    try {
      const url = new URL(
        "/api/members/my-listing/getListing",
        window.location.origin
      );
      url.searchParams.append("id", slug);
      if (state?.user?.email) {
        url.searchParams.append("email", state.user.email);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setListing(data);
      setIsFavorited(data.favorite || false);
      setIsLoading(false);
    } catch (error: any) {
      toast.error(`Error fetching data: ${error.message}`);
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!state?.user?.id) {
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
          listingId: slug,
          userId: state.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      const data = await response.json();
      setIsFavorited(data.favorite);
      toast.success(
        data.favorite ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorite status");
      console.error("Error toggling favorite:", error);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [slug]);

  useEffect(() => {
    if (state?.user?.id && listing?.favorites) {
      const isLiked = listing.favorites.some(
        (fav: { listingId: string }) => fav.listingId === slug
      );
      setIsFavorited(isLiked);
    }
  }, [state?.user?.id, listing?.favorites, slug]);

  if (isLoading) {
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

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Listing not found
          </h1>
          <Link href="/listings" className="text-[#172544] hover:underline">
            Return to listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/listings"
              className="text-gray-800 hover:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isFavorited ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-5 h-5 ${isFavorited ? "text-red-500" : "text-gray-600"}`}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span
                className={`text-sm font-medium ${isFavorited ? "text-red-500" : "text-gray-600"}`}>
                {isFavorited ? "Favorited" : "Favorite"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-width Image Gallery */}
      <div className="w-full bg-gray-100">
        <div className="max-w-screen-2xl mx-auto justify-center flex">
          <div className="lg:aspect-video h-[50vh] lg:h-full flex justify-center max-h-[600px] w-full">
            <CarouselPage
              overlay={false}
              thumbnails={true}
              images={
                listing.home_info.listing_images?.length > 0
                  ? listing.home_info.listing_images.map(
                      (url: string, index: number) => ({
                        key: index,
                        src: url,
                      })
                    )
                  : [1, 2, 3].map((file) => ({
                      key: file,
                      src: "/placeholder.png",
                    }))
              }
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="border-b pb-6 mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 font-['EBGaramond']">
                {listing.home_info.title}
              </h1>
              <p className="text-lg text-gray-600 font-['Noto']">
                {listing.home_info.city}
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-6 pb-8 mb-8 border-b">
              <div>
                <h3 className="font-medium text-gray-900 mb-1 font-['EBGaramond']">
                  Property type
                </h3>
                <p className="text-gray-500 capitalize font-['Noto']">
                  {listing.home_info.property_type}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1 font-['EBGaramond']">
                  Bedrooms
                </h3>
                <p className="text-gray-500 font-['Noto']">
                  {listing.home_info.how_many_sleep}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1 font-['EBGaramond']">
                  Bathrooms
                </h3>
                <p className="text-gray-500 font-['Noto']">
                  {listing.home_info.bathrooms}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1 font-['EBGaramond']">
                  Area
                </h3>
                <p className="text-gray-500 font-['Noto']">
                  {listing.home_info.area || "N/A"} m²
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1 font-['EBGaramond']">
                  Located in
                </h3>
                <p className="text-gray-500 font-['Noto']">
                  {listing.home_info.located_in || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1 font-['EBGaramond']">
                  Residence type
                </h3>
                <p className="text-gray-500 capitalize font-['Noto']">
                  {listing.home_info.main_or_second || "N/A"}
                </p>
              </div>
            </div>

            {/* About the City */}
            <div className="pb-8 mb-8 border-b">
              <h2 className="text-xl font-semibold mb-4 !font-['EBGaramond']">
                About {listing.home_info.city}
              </h2>
              <p className="text-gray-600 leading-relaxed !font-['Noto']">
                {listing.home_info.about_city ||
                  "No information available about this city."}
              </p>
            </div>

            {/* Description */}
            <div className="pb-8 mb-8 border-b">
              <h2 className="text-xl font-semibold mb-4 !font-['EBGaramond']">
                About this home
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line font-['Noto']">
                {listing.home_info.description || "No description available."}
              </p>
            </div>

            {/* Amenities */}
            {listing.amenities &&
              Object.values(listing.amenities).some(
                (value) => value === true
              ) && (
                <div className="pb-8 mb-8 border-b">
                  <h2 className="text-xl font-semibold mb-6 !font-['EBGaramond']">
                    What this place offers
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(
                      listing.amenities as Record<string, boolean | string>
                    )
                      .filter(
                        ([key]) =>
                          ![
                            "id",
                            "created_at",
                            "updated_at",
                            "submission_id",
                          ].includes(key)
                      )
                      .map(
                        ([key, value]) =>
                          value === true && (
                            <div key={key} className="flex items-center gap-3">
                              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4 text-gray-600">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </svg>
                              </div>
                              <span className="text-gray-700 capitalize font-['Noto']">
                                {key.replace(/_/g, " ")}
                              </span>
                            </div>
                          )
                      )}
                  </div>
                </div>
              )}

            {/* Location */}
            {mapsActive && listing.home_info.address && (
              <div>
                <h2 className="text-xl font-semibold mb-4 !font-['EBGaramond']">
                  Location
                </h2>
                <div className="h-[400px] rounded-xl overflow-hidden">
                  <GoogleMapComponent
                    exactAddress={
                      listing.home_info.address
                        ? {
                            lat: listing.home_info.address.lat,
                            lng: listing.home_info.address.lng,
                          }
                        : undefined
                    }
                    listings={[
                      {
                        id: listing.id,
                        user_info: {
                          email: listing.user_info.email,
                        },
                        home_info: {
                          address: {
                            lat: listing.home_info.address.lat,
                            lng: listing.home_info.address.lng,
                          },
                          description: listing.home_info.description,
                          title: listing.home_info.title,
                          located_in: listing.home_info.located_in,
                          listing_images: listing.home_info.listing_images,
                        },
                      },
                    ]}
                    noSearch={true}
                    radius={300}
                    marker={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Host Details */}
          <div>
            <div className="sticky top-24 bg-white rounded-xl border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16">
                  <Image
                    fill
                    src={
                      listing.user_info.profile_image_url || "/placeholder.png"
                    }
                    className="rounded-full object-cover"
                    alt={listing.user_info.name}
                    sizes="64px"
                  />
                </div>
                <div>
                  <h2 className="font-medium text-gray-900 !font-['EBGaramond']">
                    Hosted by {listing.user_info.name}
                  </h2>
                  <p className="text-gray-500 !font-['Noto']">
                    {listing.user_info.profession}
                  </p>
                </div>
              </div>

              {listing.user_info.id === state?.user?.id ? (
                <Link
                  href="/profile"
                  className="block w-full py-3 px-4 text-center border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors mb-6 font-['Noto']">
                  View Profile
                </Link>
              ) : (
                <Link
                  href={`/messages?listingId=${listing.id}&hostEmail=${encodeURIComponent(listing.user_info.email)}`}
                  className="block w-full py-3 px-4 text-center bg-[#172544] text-white rounded-lg hover:bg-[#0f1a2e] transition-colors mb-6 font-['Noto']">
                  Contact Host
                </Link>
              )}

              {listing.user_info.about_me && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 !font-['EBGaramond']">
                    About
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-['Noto']">
                    {listing.user_info.about_me}
                  </p>
                </div>
              )}

              {listing.user_info.cities_to_go?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 !font-['EBGaramond']">
                    Would like to visit
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.user_info.cities_to_go.map((city: string) => (
                      <span
                        key={city}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-['Noto']">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities they'd like to visit */}
              {listing.user_info.open_to_other_cities &&
                Object.values(
                  listing.user_info.open_to_other_cities as Record<
                    string,
                    string
                  >
                ).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 !font-['EBGaramond']">
                      Would like to visit
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(
                        listing.user_info.open_to_other_cities as Record<
                          string,
                          string
                        >
                      )
                        .filter((city) => city && city.trim() !== "")
                        .map((city: string, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-['Noto']">
                            {city}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

              {/* Open to other destinations */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 font-['EBGaramond']">
                  Open to other destinations
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-['Noto']">
                  {listing.user_info.open_to_other_destinations
                    ? "This host is open to exploring other destinations not listed above."
                    : "This host prefers to stick to their listed destinations."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
