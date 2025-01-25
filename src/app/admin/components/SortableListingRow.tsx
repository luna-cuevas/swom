import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, Star, StarOff, Mail, Key } from "lucide-react";
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
  subscription_status: boolean;
  global_order_rank: number;
  highlighted_order_rank: number;
};

type Props = {
  listing: Listing;
  onSelect: () => void;
  onToggleHighlight: (
    id: string,
    currentState: boolean,
    e: React.MouseEvent
  ) => void;
  onResendWelcome: (listing: Listing, e: React.MouseEvent) => void;
  onPasswordReset: (listing: Listing, e: React.MouseEvent) => void;
  showDragHandle?: boolean;
};

export function SortableListingRow({
  listing,
  onSelect,
  onToggleHighlight,
  onResendWelcome,
  onPasswordReset,
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
      <TableCell className="text-center border-r font-medium">
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
        <div className="flex flex-col gap-1 items-center">
          <span
            className={cn(
              "px-1 py-1 capitalize text-[10px] font-medium",
              listing.status === "approved"
                ? "bg-green-100 text-green-800"
                : listing.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            )}>
            {listing.status || "N/A"}
          </span>
          {listing.subscription_status && (
            <span className="px-1 capitalize py-1 text-[10px] font-medium bg-blue-100 text-blue-800">
              Subscribed
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center border-r" onClick={onSelect}>
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            listing.user_info.recommended == "wikimujeres"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          )}>
          {listing.user_info.recommended == "wikimujeres" ? "Yes" : "No"}
        </span>
      </TableCell>
      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) =>
                    onToggleHighlight(listing.id, listing.is_highlighted, e)
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
                  onClick={(e) => onResendWelcome(listing, e)}
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
                  onClick={(e) => onPasswordReset(listing, e)}
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
  );
}
