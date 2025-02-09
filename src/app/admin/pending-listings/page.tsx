"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SanityListing {
  _id: string;
  slug?: { current: string };
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
    city: string;
    description?: string;
    property_type: string;
    how_many_sleep: number;
    bathrooms: number;
    area: string;
    [key: string]: any;
  };
  amenities: {
    [key: string]: boolean;
  };
  privacyPolicy?: {
    accepted: boolean;
    date: string;
  };
}

type MigrationStatus =
  | "pending"
  | "success"
  | "error"
  | "exists"
  | "needs_signup";
type FilterType = "pending" | "completed" | "needs_signup";

export default function PendingListingsPage() {
  const [listings, setListings] = useState<SanityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<
    Record<string, MigrationStatus>
  >({});
  const [filter, setFilter] = useState<FilterType>("pending");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("/api/admin/getSanityPendingListings");
        if (!response.ok) throw new Error("Failed to fetch listings");
        const data = await response.json();
        setListings(data);
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

      const response = await fetch("/api/admin/migratePendingListing", {
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

      // Remove the listing from the state after successful migration
      setListings((prev) => prev.filter((item) => item._id !== listing._id));
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
      return status === "success";
    }
  });

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Listings Migration</h1>
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
              <th className="p-2 border">Actions</th>
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
                <td className="p-2 border">{listing.homeInfo.property_type}</td>
                <td className="p-2 border">
                  {listing.homeInfo.how_many_sleep}
                </td>
                <td className="p-2 border">
                  {migrationStatus[listing._id] === "needs_signup" ? (
                    <div className="flex flex-col gap-2">
                      <span className="px-4 py-2 bg-yellow-500 text-white rounded">
                        Needs Signup
                      </span>
                      <span className="text-xs text-gray-500">
                        User must create an account first
                      </span>
                    </div>
                  ) : migrationStatus[listing._id] === "success" ? (
                    <span className="px-4 py-2 bg-green-500 text-white rounded">
                      Migrated
                    </span>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
