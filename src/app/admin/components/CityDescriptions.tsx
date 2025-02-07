import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Plus } from "lucide-react";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";

interface CityDescription {
  id: string;
  city: string;
  description: string;
}

const columns = ["City", "Description", "Actions"];

export default function CityDescriptions() {
  const [filter, setFilter] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [state] = useAtom(globalStateAtom);

  const {
    data: descriptions = [],
    isLoading,
    refetch,
  } = useQuery<CityDescription[]>({
    queryKey: ["cityDescriptions"],
    queryFn: async () => {
      if (!state.user?.id) {
        throw new Error("Admin ID not found");
      }

      const response = await fetch("/api/admin/getCityDescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify({
          adminId: state.user.id,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch city descriptions");
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredDescriptions = descriptions.filter((desc) =>
    desc.city.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!newCity.trim() || !newDescription.trim()) {
      toast.warning("Please fill in both city and description");
      return;
    }

    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/createCityDescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: state.user.id,
          city: newCity.trim(),
          description: newDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add city description");
      }

      toast.success("City description added successfully");
      setNewCity("");
      setNewDescription("");
      queryClient.invalidateQueries({ queryKey: ["cityDescriptions"] });
    } catch (error) {
      toast.error("Failed to add city description");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!state.user?.id) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      const response = await fetch(`/api/admin/deleteCityDescription`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: state.user.id,
          id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete city description");
      }

      toast.success("City description deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["cityDescriptions"] });
    } catch (error) {
      toast.error("Failed to delete city description");
    }
  };

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

  if (!descriptions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600 mb-2">No city descriptions</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Add city descriptions to provide information about different
          locations. These descriptions will be displayed on the website.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search cities..."
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilter(e.target.value)
            }
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add New City Description</h2>
          <Plus className="w-4 h-4 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              City Name
            </label>
            <Input
              value={newCity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCity(e.target.value)
              }
              placeholder="Enter city name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              value={newDescription}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDescription(e.target.value)
              }
              placeholder="Enter city description"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full md:w-auto mt-4">
          {loading ? "Adding..." : "Add City Description"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column} className="text-left h-11 font-medium">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDescriptions.map((description) => (
              <TableRow key={description.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {description.city}
                </TableCell>
                <TableCell className="max-w-xl">
                  {description.description}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(description.id)}
                    className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
