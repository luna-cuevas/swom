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
import { Star, Trash2 } from "lucide-react";
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
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";

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
    type: "approve" | "reject" | "delete";
    listing: PendingListing | null;
  }>({
    isOpen: false,
    type: "approve",
    listing: null,
  });

  const [state, setState] = useAtom(globalStateAtom);

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
    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      const response = await fetch("/api/admin/updateListingStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          status: "approved",
          adminId: state.user?.id,
        }),
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
    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      const response = await fetch("/api/admin/updateListingStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          status: "rejected",
          adminId: state.user?.id,
        }),
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

  const handleDelete = async (listingId: string) => {
    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      const response = await fetch("/api/admin/deletePendingListing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          adminId: state.user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete listing");

      toast.success("Listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      setConfirmDialog({ isOpen: false, type: "delete", listing: null });
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  const handleToggleHighlight = async (listingId: string) => {
    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      const response = await fetch("/api/admin/toggleHighlight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          adminId: state.user.id,
        }),
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
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.map((listing) => (
              <TableRow
                key={listing.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedListing(listing)}>
                <TableCell className="font-medium">
                  {listing.home_info.title}
                </TableCell>
                <TableCell>{listing.user_info.email}</TableCell>
                <TableCell>{listing.home_info.city}</TableCell>
                <TableCell>{listing.user_info.recommended}</TableCell>
                <TableCell
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()} // Prevent row click on actions
                >
                  <Button
                    variant="outline"
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
                    variant="outline"
                    size="sm"
                    className="bg-red-50 hover:bg-red-100 hover:text-red-600"
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        type: "reject",
                        listing,
                      })
                    }>
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleHighlight(listing.id)}>
                    <Star
                      className={`h-4 w-4 ${
                        listing.is_highlighted
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        type: "delete",
                        listing,
                      })
                    }>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
          setConfirmDialog({ ...confirmDialog, isOpen })
        }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "approve"
                ? "Approve Listing"
                : confirmDialog.type === "reject"
                  ? "Reject Listing"
                  : "Delete Listing"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "approve"
                ? "Are you sure you want to approve this listing?"
                : confirmDialog.type === "reject"
                  ? "Are you sure you want to reject this listing?"
                  : "Are you sure you want to delete this listing? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  isOpen: false,
                  type: "approve",
                  listing: null,
                })
              }>
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.type === "delete" ? "destructive" : "default"
              }
              onClick={() => {
                if (confirmDialog.listing) {
                  if (confirmDialog.type === "approve") {
                    handleApprove(confirmDialog.listing.id);
                  } else if (confirmDialog.type === "reject") {
                    handleReject(confirmDialog.listing.id);
                  } else {
                    handleDelete(confirmDialog.listing.id);
                  }
                }
              }}>
              {confirmDialog.type === "approve"
                ? "Approve"
                : confirmDialog.type === "reject"
                  ? "Reject"
                  : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
