import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/utils/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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
  home_info: HomeInfo;
  user_info: UserInfo;
};

export default function HighlightedListings() {
  const supabase = useSupabase();
  const { data: highlightedListings = [], isLoading } = useQuery<
    HighlightedListing[]
  >({
    queryKey: ["highlightedListings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("needs_approval")
        .select(
          `
          id,
          status,
          created_at,
          home_info:home_info_id!inner(
            id,
            title,
            city,
            description,
            listing_images
          ),
          user_info:user_info_id!inner(
            id,
            name,
            email,
            recommended
          )
        `
        )
        .eq("is_highlighted", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as HighlightedListing[];
    },
  });

  const removeHighlight = async (listingId: string) => {
    const { error } = await supabase
      .from("needs_approval")
      .update({ is_highlighted: false })
      .eq("id", listingId);

    if (error) {
      console.error("Error removing highlight:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Wiki Mujeres</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {highlightedListings.map((listing: HighlightedListing) => (
            <TableRow key={listing.id}>
              <TableCell>{listing.home_info.title}</TableCell>
              <TableCell>{listing.user_info.email}</TableCell>
              <TableCell>{listing.home_info.city}</TableCell>
              <TableCell>
                {listing.user_info.recommended === "wikimujeres" ? "Yes" : "No"}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeHighlight(listing.id)}>
                  Remove Highlight
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
