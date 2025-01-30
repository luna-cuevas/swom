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
import { useState } from "react";
import { HighlightedListingDetailsModal } from "./HighlightedListingDetailsModal";
import { toast } from "react-toastify";
import { TableSkeleton } from "./TableSkeleton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableRow } from "./SortableRow";
import { GripVertical, Save } from "lucide-react";

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

type HighlightedListing = {
  id: string;
  status: string | null;
  created_at: string;
  highlight_tag: string | null;
  home_info: HomeInfo;
  user_info: UserInfo;
  highlighted_order_rank: number;
  global_order_rank: number;
};

const columns = [
  "Title",
  "Email",
  "Location",
  "Tagline",
  "Wiki Mujeres",
  "Actions",
];

export default function HighlightedListings() {
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] =
    useState<HighlightedListing | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<HighlightedListing[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: highlightedListings = [], isLoading } = useQuery<
    HighlightedListing[]
  >({
    queryKey: ["highlightedListings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/getHighlightedListings", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch highlighted listings");
      }
      const data = await response.json();
      return data.sort(
        (a: HighlightedListing, b: HighlightedListing) =>
          (a.highlighted_order_rank || 0) - (b.highlighted_order_rank || 0)
      );
    },
    // no cache
    staleTime: 0,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex =
      pendingOrder.length > 0
        ? pendingOrder.findIndex((item) => item.id === active.id)
        : highlightedListings.findIndex((item) => item.id === active.id);
    const newIndex =
      pendingOrder.length > 0
        ? pendingOrder.findIndex((item) => item.id === over.id)
        : highlightedListings.findIndex((item) => item.id === over.id);

    const currentOrder =
      pendingOrder.length > 0 ? pendingOrder : highlightedListings;
    const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
    setPendingOrder(newOrder);
  };

  const saveNewOrder = async () => {
    if (pendingOrder.length === 0) return;

    try {
      // Update all items with their new ranks
      await Promise.all(
        pendingOrder.map((listing, index) =>
          fetch("/api/admin/updateListingOrder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              listingId: listing.id,
              newRank: index,
              isHighlighted: true,
            }),
          })
        )
      );

      // Update the local cache
      queryClient.setQueryData<HighlightedListing[]>(
        ["highlightedListings"],
        pendingOrder
      );

      toast.success("Order updated successfully");
      setIsEditingOrder(false);
      setPendingOrder([]);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ["highlightedListings"] });
      setPendingOrder([]);
    }
  };

  const cancelEditing = () => {
    setIsEditingOrder(false);
    setPendingOrder([]);
  };

  const startEditing = () => {
    setIsEditingOrder(true);
    setPendingOrder(highlightedListings);
  };

  const removeHighlight = async (listingId: string) => {
    try {
      const response = await fetch("/api/admin/toggleHighlight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove highlight");
      }

      // Close modal if the removed listing was being viewed
      if (selectedListing?.id === listingId) {
        setSelectedListing(null);
      }

      // Update the local cache immediately
      queryClient.setQueryData<HighlightedListing[]>(
        ["highlightedListings"],
        (old) => old?.filter((listing) => listing.id !== listingId) ?? []
      );

      toast.success("Highlight removed successfully");
    } catch (error) {
      console.error("Error removing highlight:", error);
      toast.error("Failed to remove highlight");
    }
  };

  const handleTagUpdate = (listingId: string, newTag: string) => {
    // Update the local cache immediately
    queryClient.setQueryData<HighlightedListing[]>(
      ["highlightedListings"],
      (old) => {
        if (!old) return [];
        return old.map((listing) =>
          listing.id === listingId
            ? { ...listing, highlight_tag: newTag }
            : listing
        );
      }
    );

    // Also update the selected listing if it's the one being edited
    if (selectedListing?.id === listingId) {
      setSelectedListing((prev) =>
        prev ? { ...prev, highlight_tag: newTag } : null
      );
    }
  };

  if (isLoading) {
    return <TableSkeleton columns={columns} />;
  }

  if (!highlightedListings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600 mb-2">No highlighted listings</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          You can highlight listings from the Live Listings tab by clicking the
          star icon in the Actions column. Highlighted listings will appear on
          the homepage.
        </p>
      </div>
    );
  }

  const displayedListings =
    pendingOrder.length > 0 ? pendingOrder : highlightedListings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isEditingOrder ? (
            <Button onClick={startEditing} variant="outline" className="gap-2">
              <GripVertical className="h-4 w-4" />
              Edit Order
            </Button>
          ) : (
            <>
              <Button
                onClick={saveNewOrder}
                variant="default"
                className="gap-2">
                <Save className="h-4 w-4" />
                Save Order
              </Button>
              <Button onClick={cancelEditing} variant="outline">
                Cancel
              </Button>
            </>
          )}
        </div>
        {isEditingOrder && (
          <p className="text-sm text-gray-500">
            Drag and drop listings to reorder them
          </p>
        )}
      </div>

      <Table className="border rounded-md">
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
        {isEditingOrder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <TableBody>
              <SortableContext
                items={displayedListings}
                strategy={verticalListSortingStrategy}>
                {displayedListings.map((listing: HighlightedListing) => (
                  <SortableRow
                    key={listing.id}
                    listing={listing}
                    onRemoveHighlight={removeHighlight}
                    onSelect={() => setSelectedListing(listing)}
                    showDragHandle={true}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </DndContext>
        ) : (
          <TableBody>
            {displayedListings.map((listing: HighlightedListing) => (
              <SortableRow
                key={listing.id}
                listing={listing}
                onRemoveHighlight={removeHighlight}
                onSelect={() => setSelectedListing(listing)}
                showDragHandle={false}
              />
            ))}
          </TableBody>
        )}
      </Table>

      <HighlightedListingDetailsModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onTagUpdate={handleTagUpdate}
      />
    </div>
  );
}
