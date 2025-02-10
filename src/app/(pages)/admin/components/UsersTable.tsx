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
import { format } from "date-fns";
import { TableSkeleton } from "./TableSkeleton";
import { UserDetailsModal } from "./UserDetailsModal";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type User = {
  id: string;
  email: string;
  name: string;
  profile_image_url: string | null;
  dob: string | null;
  phone: string | null;
  age: number | null;
  profession: string | null;
  about_me: string | null;
  children: string | null;
  recommended: string | null;
  open_to_other_cities: any | null;
  open_to_other_destinations: boolean | null;
  created_at: string;
  updated_at: string;
  submission_id: string | null;
  has_listing: boolean;
  subscription_status: string;
};

type SortConfig = {
  key: keyof User | null;
  direction: "asc" | "desc";
};

type FilterConfig = {
  status: string[];
  wikiMujeres: boolean | null;
};

const columns = [
  { key: "name" as keyof User, label: "Name" },
  { key: "email" as keyof User, label: "Email" },
  { key: "subscription_status" as keyof User, label: "Status" },
  { key: "has_listing" as keyof User, label: "Listing" },
  { key: "recommended" as keyof User, label: "Wiki Mujeres" },
  { key: "created_at" as keyof User, label: "Created At" },
  { key: "updated_at" as keyof User, label: "Last Updated" },
  { key: null, label: "Actions" },
];

export default function UsersTable() {
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: [],
    wikiMujeres: null,
  });
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/getUsers", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch (error) {
      return "-";
    }
  };

  const handleSort = (key: keyof User | null) => {
    if (!key) return;
    setSortConfig((currentConfig) => ({
      key,
      direction:
        currentConfig.key === key && currentConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilterConfig((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleWikiMujeresFilter = (value: boolean | null) => {
    setFilterConfig((prev) => ({
      ...prev,
      wikiMujeres: prev.wikiMujeres === value ? null : value,
    }));
  };

  const sortedUsers = users?.slice().sort((a: User, b: User) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (sortConfig.key === "age") {
      return sortConfig.direction === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }

    if (sortConfig.key === "created_at" || sortConfig.key === "updated_at") {
      try {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      } catch (error) {
        return 0;
      }
    }

    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const filteredUsers = sortedUsers?.filter((user: User) => {
    const searchTerm = filter.toLowerCase();
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.phone?.toLowerCase().includes(searchTerm) ||
      user.profession?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      filterConfig.status.length === 0 ||
      filterConfig.status.includes(user.subscription_status);

    const matchesWikiMujeres =
      filterConfig.wikiMujeres === null ||
      (filterConfig.wikiMujeres === true &&
        user.recommended?.toLowerCase() === "wikimujeres") ||
      (filterConfig.wikiMujeres === false &&
        user.recommended?.toLowerCase() !== "wikimujeres");

    return matchesSearch && matchesStatus && matchesWikiMujeres;
  });

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search users..."
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilter(e.target.value)
            }
            className="w-[300px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="p-2">
                <h4 className="mb-2 text-sm font-medium">Status</h4>
                <div className="space-y-2">
                  <DropdownMenuCheckboxItem
                    checked={filterConfig.status.includes("Subscribed")}
                    onCheckedChange={() => handleStatusFilter("Subscribed")}>
                    Subscribed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterConfig.status.includes("Unsubscribed")}
                    onCheckedChange={() => handleStatusFilter("Unsubscribed")}>
                    Unsubscribed
                  </DropdownMenuCheckboxItem>
                </div>
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">Wiki Mujeres</h4>
                  <div className="space-y-2">
                    <DropdownMenuCheckboxItem
                      checked={filterConfig.wikiMujeres === true}
                      onCheckedChange={() => handleWikiMujeresFilter(true)}>
                      Yes
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterConfig.wikiMujeres === false}
                      onCheckedChange={() => handleWikiMujeresFilter(false)}>
                      No
                    </DropdownMenuCheckboxItem>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-gray-500">
          {filteredUsers?.length} users found
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.label}
                  className="text-center border-r h-11 font-medium last:border-r-0"
                  onClick={() => handleSort(column.key)}
                  style={{ cursor: column.key ? "pointer" : "default" }}>
                  <div className="flex items-center justify-center gap-1">
                    {column.label}
                    {column.key &&
                      sortConfig.key === column.key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user: User) => (
              <TableRow
                key={user.id}
                className={!user.has_listing ? "bg-gray-50" : ""}>
                <TableCell className="text-center font-medium border-r">
                  {user.name || "-"}
                </TableCell>
                <TableCell className="text-center border-r">
                  {user.email}
                </TableCell>
                <TableCell className="text-center border-r">
                  <Badge
                    variant={
                      user.subscription_status === "Subscribed"
                        ? "default"
                        : "destructive"
                    }>
                    {user.subscription_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center border-r">
                  {!user.has_listing ? (
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-600">
                      No Listing
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600">
                      Has Listing
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center border-r">
                  {user.recommended?.toLowerCase() === "wikimujeres" ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      No
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap border-r">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap border-r">
                  {formatDate(user.updated_at)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      className="h-8 px-4">
                      Details
                    </Button>
                    {user.has_listing && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-4">
                        <Link href={`/listings/my-listing?email=${user.email}`}>
                          Listing
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserDetailsModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdate={async () => {
          queryClient.removeQueries({ queryKey: ["users"] });
          await refetch();
          const updatedUser = users?.find(
            (u: User) => u.id === selectedUser?.id
          );
          setSelectedUser(updatedUser || null);
        }}
      />
    </div>
  );
}
