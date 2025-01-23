import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ListingDetailsModal } from "./ListingDetailsModal";
import { Mail, Star, StarOff, Key } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeInfo = {
  id: string;
  title: string;
  city: string;
  description: string;
  listing_images: string[];
};

type UserInfo = {
  id: string;
  name: string;
  email: string;
  recommended: string;
};

type Listing = {
  id: string;
  slug: string;
  status: string | null;
  created_at: string;
  home_info: HomeInfo;
  user_info: UserInfo;
  is_highlighted: boolean;
  wiki_mujeres_referral: boolean;
};

export default function ListingsTable() {
  const [filter, setFilter] = useState("");
  const [wikiFilter, setWikiFilter] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const {
    data: listings = [],
    isLoading,
    refetch,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/getAllListings", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredListings = listings.filter((listing: Listing) => {
    const matchesSearch =
      listing.home_info.title.toLowerCase().includes(filter.toLowerCase()) ||
      listing.user_info.email.toLowerCase().includes(filter.toLowerCase()) ||
      listing.home_info.city.toLowerCase().includes(filter.toLowerCase()) ||
      listing.slug.toLowerCase().includes(filter.toLowerCase());

    if (wikiFilter !== null) {
      return matchesSearch && listing.wiki_mujeres_referral === wikiFilter;
    }

    return matchesSearch;
  });

  const handleToggleHighlight = async (
    listingId: string,
    currentState: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      const response = await fetch("/api/admin/toggleHighlight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) throw new Error("Failed to toggle highlight status");

      const { is_highlighted } = await response.json();
      toast.success(
        `Listing ${is_highlighted ? "highlighted" : "unhighlighted"} successfully`
      );

      // Force a complete refetch
      queryClient.removeQueries({ queryKey: ["listings"] });
      await refetch();
    } catch (error) {
      console.error("Error toggling highlight status:", error);
      toast.error("Failed to toggle highlight status");
    }
  };

  const handleResendWelcome = async (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/admin/sendBrevoTemplate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: listing.user_info.email,
          templateId: 1,
          params: {
            name: listing.user_info.name,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send welcome email");
      toast.success("Welcome email sent successfully");
    } catch (error) {
      console.error("Error sending welcome email:", error);
      toast.error("Failed to send welcome email");
    }
  };

  const handlePasswordReset = async (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/admin/sendBrevoTemplate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: listing.user_info.email,
          templateId: 3,
          params: {
            name: listing.user_info.name,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send password reset email");

      // Also trigger Supabase password reset
      const supabaseResponse = await fetch("/api/admin/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: listing.user_info.email,
        }),
      });

      if (!supabaseResponse.ok)
        throw new Error("Failed to trigger password reset");

      toast.success("Password reset email sent successfully");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error("Failed to send password reset email");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (!listings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600 mb-2">No live listings available</p>
        <p className="text-sm text-gray-500">
          Check the &ldquo;Pending Approval&rdquo; tab for listings that need
          review
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search listings..."
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilter(e.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant={wikiFilter === true ? "default" : "outline"}
          onClick={() => setWikiFilter(wikiFilter === true ? null : true)}>
          Wiki Mujeres Only
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="text-center border-r h-11 font-medium">
                Title
              </TableHead>
              <TableHead className="text-center border-r h-11 font-medium">
                Email
              </TableHead>
              <TableHead className="text-center border-r h-11 font-medium">
                Location
              </TableHead>
              <TableHead className="text-center border-r h-11 font-medium">
                Status
              </TableHead>
              <TableHead className="text-center border-r h-11 font-medium">
                Wiki Mujeres
              </TableHead>
              <TableHead className="text-center h-11 font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.map((listing: Listing) => (
              <TableRow
                key={listing.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedListing(listing)}>
                <TableCell className="text-center border-r font-medium">
                  {listing.home_info.title}
                </TableCell>
                <TableCell className="text-center border-r">
                  {listing.user_info.email}
                </TableCell>
                <TableCell className="text-center border-r">
                  {listing.home_info.city}
                </TableCell>
                <TableCell className="text-center border-r">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      {
                        "bg-green-100 text-green-800":
                          listing.status === "approved",
                        "bg-yellow-100 text-yellow-800":
                          listing.status === "pending",
                        "bg-red-100 text-red-800":
                          listing.status === "rejected",
                        "bg-gray-100 text-gray-800": !listing.status,
                      }
                    )}>
                    {listing.status || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="text-center border-r">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      listing.wiki_mujeres_referral
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    )}>
                    {listing.wiki_mujeres_referral ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell
                  className="text-center"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) =>
                              handleToggleHighlight(
                                listing.id,
                                listing.is_highlighted,
                                e
                              )
                            }
                            className={
                              listing.is_highlighted
                                ? "text-yellow-500 hover:text-yellow-600"
                                : "text-gray-400 hover:text-gray-500"
                            }>
                            {listing.is_highlighted ? (
                              <Star className="h-4 w-4 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {listing.is_highlighted
                              ? "Remove highlight"
                              : "Highlight listing"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleResendWelcome(listing, e)}
                            className="text-blue-500 hover:text-blue-600">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Resend welcome email</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handlePasswordReset(listing, e)}
                            className="text-purple-500 hover:text-purple-600">
                            <Key className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send password reset email</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ListingDetailsModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onUpdate={async () => {
          await refetch();
          const updatedListing = listings.find(
            (l) => l.id === selectedListing?.id
          );
          setSelectedListing(updatedListing || null);
        }}
      />
    </div>
  );
}
