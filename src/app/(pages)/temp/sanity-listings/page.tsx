"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SanityListing {
  _id: string;
  orderRank?: string;
  slug?: { current: string };
  highlightTag?: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    profession?: string;
    about_me?: string;
    [key: string]: any;
  };
  homeInfo: {
    title: string;
    address: { lat: number; lng: number };
    description?: string;
    property: string;
    howManySleep: number;
    city: string;
    bathrooms: number;
    area: string;
    [key: string]: any;
  };
  [key: string]: any;
}

type MigrationStatus =
  | "pending"
  | "success"
  | "error"
  | "exists"
  | "needs_signup";
type FilterType = "pending" | "completed" | "needs_signup";

export default function SanityListingsPage() {
  const [listings, setListings] = useState<SanityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<
    Record<string, MigrationStatus>
  >({});
  const [filter, setFilter] = useState<FilterType>("pending");

  const checkExistingListings = async (listings: SanityListing[]) => {
    try {
      const emails = listings.map((listing) => listing.userInfo.email);
      const response = await fetch("/api/temp/check-existing-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) {
        throw new Error("Failed to check existing listings");
      }

      const { existingEmails } = await response.json();
      const newMigrationStatus = { ...migrationStatus };

      listings.forEach((listing) => {
        if (existingEmails.includes(listing.userInfo.email)) {
          newMigrationStatus[listing._id] = "exists";
        }
      });

      setMigrationStatus(newMigrationStatus);
    } catch (error) {
      console.error("Error checking existing listings:", error);
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("/api/temp/get-sanity-listings");
        if (!response.ok) throw new Error("Failed to fetch listings");
        const data = await response.json();
        setListings(data);

        // Check for existing listings after fetching
        await checkExistingListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleMigrate = async (listing: SanityListing) => {
    try {
      setMigrationStatus((prev) => ({ ...prev, [listing._id]: "pending" }));

      const response = await fetch("/api/temp/migrate-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listing),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error?.includes("need to sign up")
        ) {
          setMigrationStatus((prev) => ({
            ...prev,
            [listing._id]: "needs_signup",
          }));
          toast.warning(
            `User ${listing.userInfo.email} needs to sign up first`
          );
        } else {
          throw new Error(data.error || "Failed to migrate listing");
        }
        return;
      }

      setMigrationStatus((prev) => ({ ...prev, [listing._id]: "success" }));
      toast.success(`Successfully migrated listing: ${listing.homeInfo.title}`);
    } catch (error: any) {
      console.error("Error migrating listing:", error);
      setMigrationStatus((prev) => ({ ...prev, [listing._id]: "error" }));
      toast.error(error.message || "Failed to migrate listing");
    }
  };

  const filteredListings = listings.filter((listing) => {
    const status = migrationStatus[listing._id];
    if (filter === "pending") {
      return !status || status === "error";
    } else if (filter === "needs_signup") {
      return status === "needs_signup";
    } else {
      return status === "success" || status === "exists";
    }
  });

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sanity Listings Data</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded ${
              filter === "pending"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}>
            Pending Migrations
          </button>
          <button
            onClick={() => setFilter("needs_signup")}
            className={`px-4 py-2 rounded ${
              filter === "needs_signup"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}>
            Needs Signup
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded ${
              filter === "completed"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}>
            Completed Migrations
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Host</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">City</th>
              <th className="p-2 border">Property Type</th>
              <th className="p-2 border">Capacity</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Raw Data</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map((listing) => (
              <tr key={listing._id} className="hover:bg-gray-50">
                <td className="p-2 border">{listing._id}</td>
                <td className="p-2 border">{listing.homeInfo.title}</td>
                <td className="p-2 border">{listing.userInfo.name}</td>
                <td className="p-2 border">{listing.userInfo.email}</td>
                <td className="p-2 border">{listing.homeInfo.city}</td>
                <td className="p-2 border">{listing.homeInfo.property}</td>
                <td className="p-2 border">{listing.homeInfo.howManySleep}</td>
                <td className="p-2 border">
                  {migrationStatus[listing._id] === "exists" ? (
                    <span className="px-4 py-2 bg-gray-500 text-white rounded">
                      Already in Supabase
                    </span>
                  ) : migrationStatus[listing._id] === "success" ? (
                    <span className="px-4 py-2 bg-green-500 text-white rounded">
                      Migrated
                    </span>
                  ) : migrationStatus[listing._id] === "needs_signup" ? (
                    <div className="flex flex-col gap-2">
                      <span className="px-4 py-2 bg-yellow-500 text-white rounded">
                        Needs Signup
                      </span>
                      <span className="text-xs text-gray-500">
                        User must create an account first
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMigrate(listing)}
                      disabled={migrationStatus[listing._id] === "pending"}
                      className={`px-4 py-2 rounded text-white ${
                        migrationStatus[listing._id] === "error"
                          ? "bg-red-500"
                          : migrationStatus[listing._id] === "pending"
                            ? "bg-gray-400"
                            : "bg-blue-500 hover:bg-blue-600"
                      }`}>
                      {migrationStatus[listing._id] === "error"
                        ? "Failed - Retry"
                        : migrationStatus[listing._id] === "pending"
                          ? "Migrating..."
                          : "Migrate to Supabase"}
                    </button>
                  )}
                </td>
                <td className="p-2 border">
                  <details>
                    <summary className="cursor-pointer">View Raw Data</summary>
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(listing, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
