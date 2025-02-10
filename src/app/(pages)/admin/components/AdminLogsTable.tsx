import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Change {
  from: any;
  to: any;
}

interface Changes {
  home_info?: { [key: string]: Change };
  user_info?: { [key: string]: Change };
  amenities?: { [key: string]: Change };
  slug?: Change;
}

interface AdminLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  details: {
    listing_id?: string;
    listing_title?: string;
    user_email?: string;
    table?: string;
    changes?: Changes;
    [key: string]: any;
  };
  created_at: string;
}

const ACTION_TYPES = {
  ALL: "all",
  LISTINGS: "listings",
  USERS: "users",
  CITIES: "cities",
} as const;

type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

export default function AdminLogsTable() {
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<ActionType>(
    ACTION_TYPES.ALL
  );

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const response = await fetch("/api/admin/getLogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  const filteredLogs = logs?.filter((log: AdminLog) => {
    if (selectedActionType === ACTION_TYPES.ALL) return true;

    switch (selectedActionType) {
      case ACTION_TYPES.LISTINGS:
        return (
          log.action.includes("listing") || log.action.includes("highlight")
        );
      case ACTION_TYPES.USERS:
        return log.action.includes("user");
      case ACTION_TYPES.CITIES:
        return log.action.includes("city");
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[384px]" />
        </div>
        <TableSkeleton columns={4} rows={5} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Select
            value={selectedActionType}
            onValueChange={(value: string) =>
              setSelectedActionType(value as ActionType)
            }>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Action Types</SelectLabel>
                <SelectItem value={ACTION_TYPES.ALL}>All Actions</SelectItem>
                <SelectItem value={ACTION_TYPES.LISTINGS}>Listings</SelectItem>
                <SelectItem value={ACTION_TYPES.USERS}>Users</SelectItem>
                <SelectItem value={ACTION_TYPES.CITIES}>Cities</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-center border-r h-11 font-medium">
                  Date
                </TableHead>
                <TableHead className="text-center border-r h-11 font-medium">
                  Admin
                </TableHead>
                <TableHead className="text-center border-r h-11 font-medium">
                  Action
                </TableHead>
                <TableHead className="text-center h-11 font-medium">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs?.map((log: AdminLog) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="text-center border-r">
                    {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-center border-r">
                    {log.admin_email}
                  </TableCell>
                  <TableCell className="text-center border-r">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Log Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Admin</h4>
                  <p className="mt-1">{selectedLog?.admin_email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Action</h4>
                  <p className="mt-1 capitalize">{selectedLog?.action}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p className="mt-1">
                    {selectedLog &&
                      format(new Date(selectedLog.created_at), "PPpp")}
                  </p>
                </div>
              </div>

              {/* Listing action details */}
              {selectedLog?.action.includes("listing") && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Listing Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Listing ID:</span>
                      <p className="mt-1 text-sm font-mono">
                        {selectedLog.details?.listing_id}
                      </p>
                    </div>
                    {selectedLog.details?.title && (
                      <div>
                        <span className="text-sm text-gray-500">Title:</span>
                        <p className="mt-1">{selectedLog.details.title}</p>
                      </div>
                    )}
                    {selectedLog.details?.status && (
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <p className="mt-1 capitalize">
                          {selectedLog.details.status}
                        </p>
                      </div>
                    )}
                    {selectedLog.details?.changes && (
                      <div>
                        <span className="text-sm text-gray-500">Changes:</span>
                        <div className="mt-2 space-y-3 ">
                          {Object.entries(selectedLog.details.changes).map(
                            ([key, value]: [string, any]) => {
                              // Skip entries where both the value and all nested values are null
                              const hasNonNullValues =
                                typeof value === "object" && value !== null
                                  ? Object.values(value).some((v) => v !== null)
                                  : value !== null;

                              if (!hasNonNullValues) return null;

                              return (
                                <div
                                  key={key}
                                  className="pl-2 border-l-2 border-muted-foreground/20">
                                  <h5 className="text-sm font-medium capitalize mb-1">
                                    {key.replace(/_/g, " ")}:
                                  </h5>
                                  {typeof value === "object" &&
                                  value !== null ? (
                                    <div className="pl-3 space-y-1">
                                      {Object.entries(
                                        value as Record<string, Change>
                                      ).map(([subKey, subValue]) => {
                                        // Skip if both from and to are null or equal
                                        if (
                                          subValue?.from === null &&
                                          subValue?.to === null
                                        ) {
                                          return null;
                                        }
                                        if (
                                          JSON.stringify(subValue?.from) ===
                                          JSON.stringify(subValue?.to)
                                        ) {
                                          return null;
                                        }

                                        return (
                                          <div key={subKey} className="text-sm">
                                            <span className="font-medium capitalize">
                                              {subKey.replace(/_/g, " ")}:
                                            </span>{" "}
                                            {typeof subValue === "object" &&
                                            subValue !== null ? (
                                              <span className="text-sm">
                                                <span className="text-red-500/70 line-through">
                                                  {JSON.stringify(
                                                    subValue.from,
                                                    null,
                                                    2
                                                  )}
                                                </span>
                                                {" → "}
                                                <span className="text-green-500/70">
                                                  {JSON.stringify(
                                                    subValue.to,
                                                    null,
                                                    2
                                                  )}
                                                </span>
                                              </span>
                                            ) : (
                                              String(subValue)
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm pl-3">
                                      {value === ""
                                        ? "(empty string)"
                                        : String(value)}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                    {selectedLog.details?.highlight !== undefined && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Highlight:
                        </span>
                        <p className="mt-1">
                          {selectedLog.details.highlight
                            ? "Enabled"
                            : "Disabled"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User action details */}
              {selectedLog?.action.includes("user") && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    User Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">User ID:</span>
                      <p className="mt-1 text-sm font-mono">
                        {selectedLog.details?.user_id}
                      </p>
                    </div>
                    {selectedLog.details?.email && (
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="mt-1">{selectedLog.details.email}</p>
                      </div>
                    )}
                    {selectedLog.details?.changes && (
                      <div>
                        <span className="text-sm text-gray-500">Changes:</span>
                        <div className="mt-2 space-y-3">
                          {Object.entries(selectedLog.details.changes).map(
                            ([key, value]: [string, any]) => {
                              // Skip entries where both the value and all nested values are null
                              const hasNonNullValues =
                                typeof value === "object" && value !== null
                                  ? Object.values(value).some((v) => v !== null)
                                  : value !== null;

                              if (!hasNonNullValues) return null;

                              return (
                                <div
                                  key={key}
                                  className="pl-2 border-l-2 border-muted-foreground/20">
                                  <h5 className="text-sm font-medium capitalize mb-1">
                                    {key.replace(/_/g, " ")}:
                                  </h5>
                                  {typeof value === "object" &&
                                  value !== null ? (
                                    <div className="pl-3 space-y-1">
                                      {Object.entries(
                                        value as Record<string, Change>
                                      ).map(([subKey, subValue]) => {
                                        // Skip if both from and to are null or equal
                                        if (
                                          subValue?.from === null &&
                                          subValue?.to === null
                                        ) {
                                          return null;
                                        }
                                        if (
                                          JSON.stringify(subValue?.from) ===
                                          JSON.stringify(subValue?.to)
                                        ) {
                                          return null;
                                        }

                                        return (
                                          <div key={subKey} className="text-sm">
                                            <span className="font-medium capitalize">
                                              {subKey.replace(/_/g, " ")}:
                                            </span>{" "}
                                            {typeof subValue === "object" &&
                                            subValue !== null ? (
                                              <span className="text-sm">
                                                <span className="text-red-500/70 line-through">
                                                  {JSON.stringify(
                                                    subValue.from,
                                                    null,
                                                    2
                                                  )}
                                                </span>
                                                {" → "}
                                                <span className="text-green-500/70">
                                                  {JSON.stringify(
                                                    subValue.to,
                                                    null,
                                                    2
                                                  )}
                                                </span>
                                              </span>
                                            ) : (
                                              String(subValue)
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm pl-3">
                                      {value === ""
                                        ? "(empty string)"
                                        : String(value)}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* City action details */}
              {selectedLog?.action.includes("city") && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    City Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">City:</span>
                      <p className="mt-1">{selectedLog.details?.city}</p>
                    </div>
                    {selectedLog.details?.description && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Description:
                        </span>
                        <p className="mt-1">
                          {selectedLog.details.description}
                        </p>
                      </div>
                    )}
                    {selectedLog.action === "delete_city_description" && (
                      <div>
                        <span className="text-sm text-gray-500">Action:</span>
                        <p className="mt-1 text-red-500">
                          Deleted city description
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
