import { useState, useEffect } from "react";
import { UseFormReset } from "react-hook-form";
import { ListingFormData, Listing } from "../types";
import { toast } from "react-toastify";

export function useFormHandling(
  reset: UseFormReset<ListingFormData>,
  activeListingIndex: number,
  listings: Listing[],
  refreshListings: () => Promise<void>
) {
  const [formDirty, setFormDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [downloadedImages, setDownloadedImages] = useState<string[]>([]);
  const [initialFormState, setInitialFormState] = useState<ListingFormData | null>(null);
  const [initialImageState, setInitialImageState] = useState<string[]>([]);

  const setFormValues = (listing: Listing) => {
    console.log("Setting form values with listing:", listing);
    const formValues = {
      user_info: listing.user_info,
      home_info: listing.home_info,
      amenities: listing.amenities,
    };
    reset(formValues);
    setInitialFormState(formValues);
    setFormDirty(false);
    const listingImages = listing.home_info.listing_images || [];
    setDownloadedImages(listingImages);
    setInitialImageState(listingImages);
    setImageFiles([]);
    console.log("Form values set:", formValues);
  };

  const resetImageState = () => {
    setImageFiles([]);
    setDownloadedImages(initialImageState);
    setFormDirty(false);
  };

  useEffect(() => {
    if (listings.length > 0) {
      console.log("Initializing form with listing index:", activeListingIndex);
      setFormValues(listings[activeListingIndex]);
    }
  }, [listings, activeListingIndex, reset]);

  useEffect(() => {
    // Check if images have changed (either new uploads or reordering)
    const currentImages = imageFiles.length > 0
      ? imageFiles.map(file => URL.createObjectURL(file))
      : downloadedImages;

    const hasImageChanges = JSON.stringify(currentImages) !== JSON.stringify(initialImageState);

    if (!initialFormState) return;
    const currentFormState = {
      user_info: initialFormState.user_info,
      home_info: initialFormState.home_info,
      amenities: initialFormState.amenities,
    };
    const hasFormChanges = JSON.stringify(currentFormState) !== JSON.stringify(initialFormState);

    console.log("Form state comparison:", {
      hasImageChanges,
      hasFormChanges,
      currentFormState,
      initialFormState
    });

    setFormDirty(hasImageChanges || hasFormChanges);
  }, [imageFiles, downloadedImages, initialImageState, initialFormState]);

  const onFormChange = (data: ListingFormData) => {
    if (!initialFormState) return;

    // Deep compare objects excluding timestamps and IDs
    const compareObjects = (obj1: any, obj2: any) => {
      const clean = (obj: any) => {
        const cleaned = { ...obj };
        delete cleaned.created_at;
        delete cleaned.updated_at;
        delete cleaned.id;
        return cleaned;
      };

      return JSON.stringify(clean(obj1)) !== JSON.stringify(clean(obj2));
    };

    const hasUserInfoChanges = compareObjects(data.user_info, initialFormState.user_info);
    const hasHomeInfoChanges = compareObjects(data.home_info, initialFormState.home_info);
    const hasAmenitiesChanges = compareObjects(data.amenities, initialFormState.amenities);

    console.log("Form changes detected:", {
      hasUserInfoChanges,
      hasHomeInfoChanges,
      hasAmenitiesChanges,
      imageChanges: imageFiles.length > 0
    });

    setFormDirty(hasUserInfoChanges || hasHomeInfoChanges || hasAmenitiesChanges || imageFiles.length > 0);
  };

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);

    try {
      console.log("Starting form submission with data:", data);
      let listing_images = listings[activeListingIndex].home_info.listing_images || [];

      // Upload images if changed
      if (imageFiles.length > 0 || profileImage.length > 0) {
        const formData = new FormData();

        if (profileImage.length > 0) {
          formData.append('type', 'profile');
          formData.append('files', profileImage[0]);

          const profileResponse = await fetch('/api/members/my-listing/uploadImages', {
            method: 'POST',
            body: formData
          });

          if (!profileResponse.ok) {
            throw new Error('Failed to upload profile image');
          }

          const profileData = await profileResponse.json();
          data.user_info.profile_image_url = profileData.urls[0];
        }

        if (imageFiles.length > 0) {
          const listingFormData = new FormData();
          listingFormData.append('type', 'listing');
          imageFiles.forEach(file => {
            listingFormData.append('files', file);
          });

          const listingResponse = await fetch('/api/members/my-listing/uploadImages', {
            method: 'POST',
            body: listingFormData
          });

          if (!listingResponse.ok) {
            throw new Error('Failed to upload listing images');
          }

          const listingData = await listingResponse.json();
          listing_images = listingData.urls;
        }
      }

      // Update listing data
      const response = await fetch('/api/members/my-listing/updateListing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_info: {
            ...data.user_info,
          },
          home_info: {
            ...data.home_info,
            listing_images,
          },
          amenities: data.amenities,
          ids: {
            listing_id: listings[activeListingIndex].id,
            user_info_id: listings[activeListingIndex].user_info.id,
            home_info_id: listings[activeListingIndex].home_info.id,
            amenities_id: listings[activeListingIndex].amenities.id,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }

      const responseData = await response.json();

      toast.success("Listing updated successfully!");
      setFormDirty(false);

      // Refresh the listings data
      await refreshListings();

      // Update the local state with the new data
      const updatedListing = {
        ...listings[activeListingIndex],
        user_info: responseData.data.user_info || listings[activeListingIndex].user_info,
        home_info: responseData.data.home_info || listings[activeListingIndex].home_info,
        amenities: responseData.data.amenities || listings[activeListingIndex].amenities,
      };
      setFormValues(updatedListing);

    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast.error(`Failed to update listing: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  return {
    formDirty,
    setFormDirty,
    isSubmitting,
    profileImage,
    setProfileImage,
    imageFiles,
    setImageFiles,
    downloadedImages,
    setDownloadedImages,
    onSubmit,
    setFormValues,
    onFormChange,
    resetImageState,
  };
} 