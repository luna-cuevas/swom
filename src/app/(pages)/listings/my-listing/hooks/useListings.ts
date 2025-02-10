import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { toast } from "react-toastify";
import { Listing } from "../types";

export function useListings(userEmail: string | undefined) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeListingIndex, setActiveListingIndex] = useState(0);

  const fetchListings = useCallback(async () => {
    if (!userEmail) {
      console.error("No user email found");
      toast.error("Please log in to view your listings");
      setIsLoaded(true);
      return;
    }

    try {
      const encodedEmail = encodeURIComponent(userEmail);
      const response = await fetch(
        `/api/members/my-listing/getListing?email=${encodedEmail}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP error! status: ${response.status}`
        );
      }

      setListings(Array.isArray(data) ? data : [data]);
      setIsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      toast.error(`Error fetching listings: ${error.message}`);
      setListings([]);
      setIsLoaded(true);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoaded,
    activeListingIndex,
    setActiveListingIndex,
    refreshListings: fetchListings,
  };
} 