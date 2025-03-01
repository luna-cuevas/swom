"use client";
import CarouselPage from "@/components/Carousel";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ListingFormData } from "./types";
import { AmenitiesSection } from "./components/AmenitiesSection";
import { UserInfoSection } from "./components/UserInfoSection";
import { HomeInfoSection } from "./components/HomeInfoSection";
import { useListings } from "./hooks/useListings";
import { useCities } from "./hooks/useCities";
import { useFormHandling } from "./hooks/useFormHandling";
import { AddListingModal } from "./components/AddListingModal";

const BecomeMemberDropzone = dynamic(
  () => import("@/app/(pages)/become-member/components/BecomeMemberDropzone"),
  {
    loading: () => <p>Loading...</p>,
  }
);

const GoogleMapComponent = dynamic(
  () => import("@/components/GoogleMapComponent"),
  {
    loading: () => <div>Loading map...</div>,
    ssr: false,
  }
);

export default function Page() {
  const [state, setState] = useAtom(globalStateAtom);
  const { register, handleSubmit, setValue, reset, watch } =
    useForm<ListingFormData>();

  // Custom hooks
  const {
    listings,
    isLoaded,
    activeListingIndex,
    setActiveListingIndex,
    refreshListings,
  } = useListings(state.user?.email);
  const {
    searchTerm,
    citySearchOpen,
    filteredCities,
    handleInputChange,
    handleCitySelect,
  } = useCities(setValue);
  const {
    formDirty,
    isSubmitting,
    imageFiles,
    setImageFiles,
    downloadedImages,
    onSubmit,
    setFormValues,
    onFormChange,
    resetImageState,
  } = useFormHandling(reset, activeListingIndex, listings, refreshListings);

  // Watch form changes
  useEffect(() => {
    const subscription = watch((data) => {
      console.log("Form data changed:", data);
      onFormChange(data as ListingFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  const handleToggleUpload = () => {
    console.log("Toggling upload popup");
    setState({
      ...state,
      imgUploadPopUp: !state.imgUploadPopUp,
    });
    // Only reset state when closing
    if (state.imgUploadPopUp) {
      resetImageState();
    }
  };

  const handleArchiveListing = async () => {
    if (!listings[activeListingIndex] || !state.user?.id) return;

    const currentStatus = listings[activeListingIndex].status;
    const action = currentStatus === "archived" ? "publish" : "archive";

    try {
      const response = await fetch("/api/members/my-listing/archiveListing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listings[activeListingIndex].id,
          userEmail: state.user?.email,
          userId: state.user?.id,
          currentStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} listing`);
      }

      const data = await response.json();
      toast.success(`Listing ${action}ed successfully!`);

      // Update the form with the new listing data if it's the current listing
      if (data.listing) {
        setFormValues(data.listing);
      }

      // Refresh listings to update the UI
      await refreshListings();
    } catch (error: any) {
      console.error(`Error ${action}ing listing:`, error);
      toast.error(error.message || `Failed to ${action} listing`);
    }
  };

  if (!isLoaded) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-[#7F8119]"
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
    <div className="min-h-screen bg-[#F8F9FC]">
      <AddListingModal
        isOpen={state.addListingModalOpen || false}
        onClose={() => setState({ ...state, addListingModalOpen: false })}
        onSuccess={() => {
          setState({ ...state, addListingModalOpen: false });
          refreshListings();
        }}
      />

      {/* Top Navigation Bar with gradient background */}
      <div className="bg-gradient-to-r from-[#172544] to-[#2A3C63] text-white shadow-lg">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Listings</h1>
              <p className="text-gray-300 mt-2">
                Manage and update your property listings
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {listings && listings[activeListingIndex] && (
                <button
                  onClick={handleArchiveListing}
                  className={`px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md ${
                    listings[activeListingIndex].status === "archived"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-medium`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 4h12v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {listings[activeListingIndex].status === "archived"
                    ? "Publish Listing"
                    : "Archive Listing"}
                </button>
              )}
              {listings.filter(
                (listing) =>
                  listing.status === "approved" ||
                  listing.status === "published"
              ).length < 2 && (
                <button
                  onClick={() =>
                    setState({ ...state, addListingModalOpen: true })
                  }
                  className="px-6 py-2.5 rounded-lg bg-white text-[#172544] hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Listing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {listings && listings.length > 0 ? (
          <div className="flex flex-col gap-8">
            {/* Quick Stats with enhanced design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#172544]/10 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-[#172544]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Total Listings
                    </h3>
                    <p className="text-3xl font-bold text-[#172544] mt-1">
                      {listings.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#172544]/10 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-[#172544]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Active Listing
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-2xl font-bold text-[#172544]">
                        {listings[activeListingIndex]?.home_info?.title ||
                          "Untitled"}
                      </p>
                      {listings[activeListingIndex]?.status === "archived" && (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#172544]/10 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-[#172544]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Last Updated
                    </h3>
                    <p className="text-2xl font-bold text-[#172544] mt-1">
                      {new Date(
                        listings[activeListingIndex]?.updated_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Navigation with enhanced design */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Properties
              </h2>
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {listings.map((listing, index) => (
                  <button
                    key={listing.id}
                    onClick={() => setActiveListingIndex(index)}
                    className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all duration-200 flex items-center gap-2 font-medium ${
                      index === activeListingIndex
                        ? listing.status === "archived"
                          ? "bg-gray-900 text-white shadow-md"
                          : "bg-[#172544] text-white shadow-md"
                        : listing.status === "archived"
                          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}>
                    {listing.status === "archived" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 4h12v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {listing.home_info.title || `Listing ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column - Form */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Image Upload Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="relative">
                    <div className="relative aspect-[16/9]">
                      <CarouselPage
                        images={downloadedImages.map((url: string) => ({
                          src: url,
                        }))}
                      />
                    </div>
                    <button
                      onClick={handleToggleUpload}
                      className="absolute bottom-4 right-4 bg-[#7F8119] bg-opacity-90 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg">
                      <span className="text-lg">📸</span>
                      {state.imgUploadPopUp ? "Close Upload" : "Upload Photos"}
                    </button>
                  </div>
                  {state.imgUploadPopUp && (
                    <div className="p-6 border-t">
                      <BecomeMemberDropzone
                        imageFiles={imageFiles}
                        downloadURLs={downloadedImages}
                        setImageFiles={setImageFiles}
                      />
                    </div>
                  )}
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <HomeInfoSection
                    register={register}
                    setValue={setValue}
                    searchTerm={searchTerm}
                    onSearchTermChange={handleInputChange}
                    citySearchOpen={citySearchOpen}
                    filteredCities={filteredCities}
                    onCitySelect={handleCitySelect}
                    status={listings[activeListingIndex]?.status || "archived"}
                  />
                  <UserInfoSection register={register} />
                  <AmenitiesSection register={register} />

                  {formDirty && (
                    <div className="sticky bottom-0 bg-white border-t p-4 -mx-4">
                      <div className="max-w-[1440px] mx-auto flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            reset();
                            setFormValues(listings[activeListingIndex]);
                            resetImageState();
                          }}
                          className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-[#7F8119] text-white rounded-lg hover:bg-[#666914] transition-colors disabled:opacity-50">
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column - Preview & Stats */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Map Preview */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-[300px]">
                    <GoogleMapComponent
                      exactAddress={{
                        lat: listings[activeListingIndex]?.home_info?.address
                          ?.lat,
                        lng: listings[activeListingIndex]?.home_info?.address
                          ?.lng,
                      }}
                      noSearch={true}
                    />
                  </div>
                </div>

                {/* Property Preview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Property Preview
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-medium">
                          {
                            listings[activeListingIndex]?.home_info
                              ?.property_type
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sleeps</p>
                        <p className="font-medium">
                          {
                            listings[activeListingIndex]?.home_info
                              ?.how_many_sleep
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-medium">
                          {listings[activeListingIndex]?.home_info?.bathrooms}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Area</p>
                        <p className="font-medium">
                          {listings[activeListingIndex]?.home_info?.area} m²
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Listing Updated</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            listings[activeListingIndex]?.updated_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Listing Created</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            listings[activeListingIndex]?.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-2">No listings found</h2>
              <p className="text-gray-600 mb-6">
                Get started by creating your first listing
              </p>
              <Link
                href="/add-listing"
                className="inline-block bg-[#7F8119] text-white px-6 py-3 rounded-lg hover:bg-[#666914] transition-colors">
                Create Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
