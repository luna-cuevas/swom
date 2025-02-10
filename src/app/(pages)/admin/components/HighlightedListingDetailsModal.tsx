import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";

type Props = {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
  onTagUpdate?: (listingId: string, newTag: string) => void;
};

export function HighlightedListingDetailsModal({
  listing,
  isOpen,
  onClose,
  onTagUpdate,
}: Props) {
  const [highlightTag, setHighlightTag] = useState(
    listing?.highlight_tag || ""
  );
  const [startIndex, setStartIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [state] = useAtom(globalStateAtom);

  // Update local state when listing prop changes
  useEffect(() => {
    setHighlightTag(listing?.highlight_tag || "");
  }, [listing?.highlight_tag]);

  if (!listing) return null;

  const images = listing.home_info.listing_images || [];
  const visibleImages = images.slice(startIndex, startIndex + 3);
  const hasNextImages = startIndex + 3 < images.length;
  const hasPreviousImages = startIndex > 0;

  const updateHighlightTag = async () => {
    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/updateTagline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: state.user.id,
          listingId: listing.id,
          tagline: highlightTag,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tagline");
      }

      toast.success("Tagline updated successfully");
      setIsEditing(false);
      // Notify parent component of the update
      onTagUpdate?.(listing.id, highlightTag);
    } catch (error) {
      console.error("Error updating tagline:", error);
      toast.error("Failed to update tagline");
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setHighlightTag(listing.highlight_tag || "");
    setIsEditing(false);
  };

  const nextImages = () => {
    if (hasNextImages) {
      setStartIndex((prev) => Math.min(prev + 3, images.length - 3));
    }
  };

  const previousImages = () => {
    if (hasPreviousImages) {
      setStartIndex((prev) => Math.max(prev - 3, 0));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Listing Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Images Carousel */}
            {images.length > 0 && (
              <div className="relative">
                <div className="grid grid-cols-3 gap-4">
                  {visibleImages.map((image: string, index: number) => (
                    <div
                      key={startIndex + index}
                      className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`Listing image ${startIndex + index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                {(hasPreviousImages || hasNextImages) && (
                  <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={previousImages}
                      disabled={!hasPreviousImages}
                      className="rounded-full bg-white/80 hover:bg-white shadow-lg">
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={nextImages}
                      disabled={!hasNextImages}
                      className="rounded-full bg-white/80 hover:bg-white shadow-lg">
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <p className="text-gray-500 text-sm">
                    {Math.floor(startIndex / 3) + 1} /{" "}
                    {Math.ceil(images.length / 3)}
                  </p>
                </div>
              </div>
            )}

            {/* Highlight Tag */}
            <div className="space-y-2 mt-8">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Tagline</h3>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 text-sm">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={highlightTag}
                    onChange={(e) => setHighlightTag(e.target.value)}
                    placeholder="Enter tagline"
                    className="max-w-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={updateHighlightTag} disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={cancelEdit}
                      disabled={isUpdating}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">
                  {listing.highlight_tag || "No tagline set"}
                </p>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{listing.home_info.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{listing.home_info.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">
                      {listing.status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wiki Mujeres</p>
                    <p className="font-medium">
                      {listing.user_info.recommended === "wikimujeres"
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {listing.home_info.description}
                </p>
              </div>

              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold">User Information</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{listing.user_info.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{listing.user_info.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
