import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";

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

type Props = {
  listing: HighlightedListing;
  onRemoveHighlight: (id: string) => void;
  onSelect: () => void;
  showDragHandle?: boolean;
};

export function SortableRow({
  listing,
  onRemoveHighlight,
  onSelect,
  showDragHandle = false,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: listing.id });

  const style = showDragHandle
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      }
    : undefined;

  return (
    <TableRow
      ref={showDragHandle ? setNodeRef : undefined}
      style={style}
      className={`hover:bg-gray-100 ${showDragHandle ? "select-none" : ""}`}>
      <TableCell className="text-center border-r">
        <div className="flex items-center justify-center gap-2">
          {showDragHandle && (
            <span {...attributes} {...listeners} className="touch-none">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            </span>
          )}
          <span onClick={onSelect} className="cursor-pointer">
            {listing.home_info.title}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center border-r" onClick={onSelect}>
        {listing.user_info.email}
      </TableCell>
      <TableCell className="text-center border-r" onClick={onSelect}>
        {listing.home_info.city}
      </TableCell>
      <TableCell className="text-center border-r" onClick={onSelect}>
        {listing.highlight_tag || "No tagline set"}
      </TableCell>
      <TableCell className="text-center border-r" onClick={onSelect}>
        {listing.user_info.recommended === "wikimujeres" ? "Yes" : "No"}
      </TableCell>
      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemoveHighlight(listing.id)}>
          Remove Highlight
        </Button>
      </TableCell>
    </TableRow>
  );
}
