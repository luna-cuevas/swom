import React from "react";
import { HomeContent } from "./components/HomeContent";

const fetchHighlightedListings = async () => {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/members/getHighlightedListings`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch highlighted listings");
    }

    const listings = await response.json();
    return listings.map((listing: any) => ({
      _id: listing.id,
      slug: { current: listing.slug },
      title: listing.homeInfo.title,
      homeInfo: {
        ...listing.homeInfo,
        firstImage: listing.homeInfo.firstImage,
      },
      highlightTag: listing.highlightTag,
      owner: listing.owner,
    }));
  } catch (error) {
    console.error("Error fetching highlighted listings:", error);
    return [];
  }
};

export default async function HomePage() {
  const highlightedListings = await fetchHighlightedListings();

  return (
    <main className="overflow-x-hidden">
      <HomeContent highlightedListings={highlightedListings} />
    </main>
  );
}
