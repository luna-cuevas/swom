import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { ListingDetailsModal } from "./ListingDetailsModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

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

type PendingListing = {
  id: string;
  status: string | null;
  created_at: string;
  is_highlighted: boolean;
  home_info: HomeInfo;
  user_info: UserInfo;
};

const columns = ["Title", "Email", "Location", "Wiki Mujeres", "Actions"];

export default function PendingApprovals() {
  const [filter, setFilter] = useState("");
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject";
    listing: PendingListing | null;
  }>({
    isOpen: false,
    type: "approve",
    listing: null,
  });

  const { data: pendingListings = [], isLoading } = useQuery<PendingListing[]>({
    queryKey: ["pendingListings"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/getPendingListings", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch pending listings");
        }
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid response format");
        }
        setError(null);
        return data;
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching pending listings:", error);
        throw error;
      }
    },
    staleTime: 0,
  });

  const handleApprove = async (listingId: string) => {
    try {
      const response = await fetch("/api/admin/updateListingStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId, status: "approved" }),
      });

      if (!response.ok) throw new Error("Failed to approve listing");

      toast.success("Listing approved successfully");
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      setConfirmDialog({ isOpen: false, type: "approve", listing: null });
    } catch (error) {
      console.error("Error approving listing:", error);
      toast.error("Failed to approve listing");
    }
  };

  const handleReject = async (listingId: string) => {
    try {
      const response = await fetch("/api/admin/updateListingStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId, status: "rejected" }),
      });

      if (!response.ok) throw new Error("Failed to reject listing");

      toast.success("Listing rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      setConfirmDialog({ isOpen: false, type: "reject", listing: null });
    } catch (error) {
      console.error("Error rejecting listing:", error);
      toast.error("Failed to reject listing");
    }
  };

  const handleToggleHighlight = async (listingId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
    } catch (error) {
      console.error("Error toggling highlight status:", error);
      toast.error("Failed to toggle highlight status");
    }
  };

  const filteredListings = pendingListings.filter(
    (listing: PendingListing) =>
      listing.home_info.title.toLowerCase().includes(filter.toLowerCase()) ||
      listing.user_info.email.toLowerCase().includes(filter.toLowerCase()) ||
      listing.home_info.city.toLowerCase().includes(filter.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600">Error: {error}</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["pendingListings"] })
          }
          className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[384px]" />
        </div>
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

  if (!pendingListings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600 mb-2">No pending listings</p>
        <p className="text-sm text-gray-500">All listings have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search pending listings..."
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilter(e.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="text-center border-r h-11 font-medium last:border-r-0">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.map((listing: PendingListing) => (
              <TableRow
                key={listing.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedListing(listing)}>
                <TableCell className="text-center border-r">
                  {listing.home_info.title}
                </TableCell>
                <TableCell className="text-center border-r">
                  {listing.user_info.email}
                </TableCell>
                <TableCell className="text-center border-r">
                  {listing.home_info.city}
                </TableCell>
                <TableCell className="text-center border-r">
                  {listing.user_info.recommended === "wikimujeres"
                    ? "Yes"
                    : "No"}
                </TableCell>
                <TableCell
                  className="text-center"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: "approve",
                          listing,
                        })
                      }>
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: "reject",
                          listing,
                        })
                      }>
                      Reject
                    </Button>
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
      />

      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen }))
        }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "approve"
                ? "Approve Listing"
                : "Reject Listing"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "approve"
                ? `You're about to approve the listing "${confirmDialog.listing?.home_info.title}" by ${confirmDialog.listing?.user_info.name}. This will send out a welcome email (Brevo template 1).`
                : `You're about to reject the listing "${confirmDialog.listing?.home_info.title}" by ${confirmDialog.listing?.user_info.name}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
              }>
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.type === "approve" ? "default" : "destructive"
              }
              onClick={() => {
                if (confirmDialog.listing) {
                  if (confirmDialog.type === "approve") {
                    handleApprove(confirmDialog.listing.id);
                  } else {
                    handleReject(confirmDialog.listing.id);
                  }
                }
              }}>
              {confirmDialog.type === "approve"
                ? "Yes, Approve"
                : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
