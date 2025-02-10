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
  const [state] = useAtom(globalStateAtom);

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
        body: JSON.stringify({ listingId, adminId: state.user.id }),
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
          adminId: state.user.id,
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
          adminId: state.user.id,
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
          adminId: state.user.id,
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
          adminId: state.user.id,
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pendingOrder.findIndex((item) => item.id === active.id);
    const newIndex = pendingOrder.findIndex((item) => item.id === over.id);

    const newOrder = arrayMove(pendingOrder, oldIndex, newIndex);
    setPendingOrder(newOrder);
  };

  const handleSaveOrder = async () => {
    try {
      const response = await fetch("/api/admin/updateListingOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: state.user.id,
          listings: pendingOrder.map((listing, index) => ({
            id: listing.id,
            global_order_rank: index + 1,
            highlighted_order_rank: listing.is_highlighted ? index + 1 : null,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to update listing order");

      toast.success("Listing order updated successfully");
      setIsEditingOrder(false);
      queryClient.removeQueries({ queryKey: ["listings"] });
      await refetch();
    } catch (error) {
      console.error("Error updating listing order:", error);
      toast.error("Failed to update listing order");
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
        <TableSkeleton columns={columns.length} rows={5} />
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
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input
            placeholder="Search listings..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-[300px]"
          />
          <div className="flex items-center gap-2">
            <Button
              variant={wikiFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setWikiFilter(!wikiFilter)}>
              Wiki Mujeres
            </Button>
            <Button
              variant={statusFilter === "published" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setStatusFilter(
                  statusFilter === "published" ? null : "published"
                )
              }>
              Published
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditingOrder ? (
            <>
              <Button onClick={handleSaveOrder} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Order
              </Button>
              <Button onClick={cancelEditing} variant="outline" size="sm">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={startEditing} variant="outline" size="sm">
                <GripVertical className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
              <Button onClick={() => setIsAddListingModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isEditingOrder && <TableHead className="w-[50px]" />}
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={columns.length} rows={5} />
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={filteredListings}
                    strategy={verticalListSortingStrategy}>
                    {filteredListings.map((listing) => (
                      <SortableListingRow
                        key={listing.id}
                        listing={listing}
                        isEditingOrder={isEditingOrder}
                        onToggleHighlight={handleToggleHighlight}
                        onResendWelcome={handleResendWelcome}
                        onPasswordReset={handlePasswordReset}
                        onTogglePublish={handleTogglePublish}
                        onDelete={() => setListingToDelete(listing)}
                        onClick={() => setSelectedListing(listing)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      <AddListingModal
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onSuccess={() => {
          setIsAddListingModalOpen(false);
          refetch();
        }}
      />

      <DeleteListingModal
        listing={listingToDelete}
        isOpen={!!listingToDelete}
        onClose={() => setListingToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
