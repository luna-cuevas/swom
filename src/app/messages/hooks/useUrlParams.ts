import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface UrlParams {
  listingId: string | null;
  hostEmail: string | null;
}

/**
 * Custom hook to manage URL parameters for the messages page
 * Handles syncing URL parameters with state and triggering conversation creation
 */
export function useUrlParams() {
  const searchParams = useSearchParams();
  const [urlParams, setUrlParams] = useState<UrlParams>({
    listingId: null,
    hostEmail: null,
  });
  const [shouldAutoSelectFirst, setShouldAutoSelectFirst] = useState(true);
  const [isHandlingUrlParams, setIsHandlingUrlParams] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const newListingId = searchParams.get("listingId");
      const newHostEmail = searchParams.get("hostEmail");

      console.log("🔍 URL Parameters changed:", {
        newListingId,
        newHostEmail,
        currentListingId: urlParams.listingId,
        currentHostEmail: urlParams.hostEmail,
      });

      if (newListingId && newHostEmail) {
        if (
          newListingId !== urlParams.listingId ||
          newHostEmail !== urlParams.hostEmail
        ) {
          setShouldAutoSelectFirst(false);
          setIsHandlingUrlParams(true);

          setUrlParams({
            listingId: newListingId,
            hostEmail: newHostEmail,
          });
        }
      }
    }
  }, [searchParams, urlParams.listingId, urlParams.hostEmail]);

  return {
    urlParams,
    setUrlParams,
    shouldAutoSelectFirst,
    setShouldAutoSelectFirst,
    isHandlingUrlParams,
    setIsHandlingUrlParams,
  };
} 