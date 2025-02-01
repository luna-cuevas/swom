import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Mail,
  Star,
  StarOff,
  Key,
  GripVertical,
  Save,
  Plus,
  Archive,
  Upload,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
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
import { SortableListingRow } from "./SortableListingRow";
import { AddListingModal } from "./AddListingModal";
import { DeleteListingModal } from "./DeleteListingModal";

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
  subscription_status: boolean;
  global_order_rank: number;
  highlighted_order_rank: number;
};

const columns = [
  "Title",
  "Email",
  "Location",
  "Slug",
  "Status",
  "Wiki Mujeres",
  "Actions",
];

export default function ListingsTable() {
  const [filter, setFilter] = useState("");
  const [wikiFilter, setWikiFilter] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Listing[]>([]);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      const data = await response.json();
      return data.sort(
        (a: Listing, b: Listing) =>
          (a.global_order_rank || 0) - (b.global_order_rank || 0)
      );
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

    const matchesStatus = statusFilter ? listing.status === statusFilter : true;

    if (wikiFilter !== null) {
      return (
        matchesSearch &&
        listing.user_info.recommended === "wikimujeres" &&
        matchesStatus
      );
    }

    return matchesSearch && matchesStatus;
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

  const handleTogglePublish = async (
    listingId: string,
    currentStatus: string | null,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      const response = await fetch("/api/admin/publishListing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          status: currentStatus === "published" ? "archive" : "publish",
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle publish status");

      const data = await response.json();
      toast.success(
        `Listing ${data.status === "published" ? "published" : "archived"} successfully`
      );

      // Force a complete refetch
      queryClient.removeQueries({ queryKey: ["listings"] });
      await refetch();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Failed to toggle publish status");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex =
      pendingOrder.length > 0
        ? pendingOrder.findIndex((item) => item.id === active.id)
        : filteredListings.findIndex((item) => item.id === active.id);
    const newIndex =
      pendingOrder.length > 0
        ? pendingOrder.findIndex((item) => item.id === over.id)
        : filteredListings.findIndex((item) => item.id === over.id);

    const currentOrder =
      pendingOrder.length > 0 ? pendingOrder : filteredListings;
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
              isHighlighted: false,
            }),
          })
        )
      );

      // Update the local cache
      queryClient.setQueryData<Listing[]>(["listings"], (old) => {
        if (!old) return pendingOrder;
        const oldFiltered = old.filter(
          (item) => !pendingOrder.find((f) => f.id === item.id)
        );
        return [...oldFiltered, ...pendingOrder].sort(
          (a, b) => (a.global_order_rank || 0) - (b.global_order_rank || 0)
        );
      });

      toast.success("Order updated successfully");
      setIsEditingOrder(false);
      setPendingOrder([]);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setPendingOrder([]);
    }
  };

  const cancelEditing = () => {
    setIsEditingOrder(false);
    setPendingOrder([]);
  };

  const startEditing = () => {
    setIsEditingOrder(true);
    setPendingOrder(filteredListings);
  };

  const handleDelete = async () => {
    await refetch();
    setListingToDelete(null);
  };

  const statusOptions = [
    { label: "All", value: null },
    { label: "Published", value: "published" },
    { label: "Approved", value: "approved" },
    { label: "Archived", value: "archived" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[384px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

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

  const displayedListings =
    pendingOrder.length > 0 ? pendingOrder : filteredListings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value || "all"}
                variant={statusFilter === option.value ? "default" : "outline"}
                onClick={() => setStatusFilter(option.value)}
                size="sm">
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddListingModalOpen(true)}
            variant="default"
            className="gap-2">
            <Plus className="h-4 w-4" />
            Add Listing
          </Button>
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
      </div>

      {isEditingOrder && (
        <p className="text-sm text-gray-500">
          Drag and drop listings to reorder them
        </p>
      )}

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
          {isEditingOrder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <TableBody>
                <SortableContext
                  items={displayedListings}
                  strategy={verticalListSortingStrategy}>
                  {displayedListings.map((listing: Listing) => (
                    <SortableListingRow
                      key={listing.id}
                      listing={listing}
                      onSelect={() => setSelectedListing(listing)}
                      onToggleHighlight={handleToggleHighlight}
                      onResendWelcome={handleResendWelcome}
                      onPasswordReset={handlePasswordReset}
                      onTogglePublish={handleTogglePublish}
                      onDelete={(listing: Listing) =>
                        setListingToDelete(listing)
                      }
                      showDragHandle={true}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </DndContext>
          ) : (
            <TableBody>
              {displayedListings.map((listing: Listing) => (
                <SortableListingRow
                  key={listing.id}
                  listing={listing}
                  onSelect={() => setSelectedListing(listing)}
                  onToggleHighlight={handleToggleHighlight}
                  onResendWelcome={handleResendWelcome}
                  onPasswordReset={handlePasswordReset}
                  onTogglePublish={handleTogglePublish}
                  onDelete={(listing: Listing) => setListingToDelete(listing)}
                  showDragHandle={false}
                />
              ))}
            </TableBody>
          )}
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

      <AddListingModal
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onSuccess={() => {
          setIsAddListingModalOpen(false);
          refetch();
        }}
      />

      <DeleteListingModal
        isOpen={!!listingToDelete}
        onClose={() => setListingToDelete(null)}
        onConfirm={handleDelete}
        listing={listingToDelete}
      />
    </div>
  );
}
