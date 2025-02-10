import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listing: {
    id: string;
    home_info: {
      title: string;
    };
    user_info: {
      id: string;
      email: string;
    };
  } | null;
};

export function DeleteListingModal({
  isOpen,
  onClose,
  onConfirm,
  listing,
}: Props) {
  const [deleteUser, setDeleteUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [state] = useAtom(globalStateAtom);

  const handleDelete = async () => {
    if (!listing) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/deleteListing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: state.user.id,
          listingId: listing.id,
          deleteUser,
          userId: listing.user_info.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete listing");

      toast.success("Listing deleted successfully");
      onConfirm();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the listing &quot;
            {listing?.home_info.title}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="deleteUser"
            checked={deleteUser}
            onCheckedChange={(checked) => setDeleteUser(checked as boolean)}
          />
          <label
            htmlFor="deleteUser"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Also delete user account ({listing?.user_info.email})
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
