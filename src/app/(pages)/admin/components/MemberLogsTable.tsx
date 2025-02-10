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
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
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

interface MemberLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: any;
  created_at: string;
}

const ACTION_TYPES = {
  ALL: "all",
  MESSAGES: "messages",
  LISTINGS: "listings",
  SUBSCRIPTIONS: "subscriptions",
} as const;

type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

export default function MemberLogsTable() {
  const [selectedLog, setSelectedLog] = useState<MemberLog | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<ActionType>(
    ACTION_TYPES.ALL
  );
  const [state] = useAtom(globalStateAtom);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["member-logs"],
    queryFn: async () => {
      if (!state.user?.id) {
        throw new Error("Admin ID not found");
      }

      const response = await fetch("/api/admin/getMemberLogs", {
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
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch on component mount
    staleTime: 0, // Data is immediately considered stale
  });

  const filteredLogs = logs?.filter((log: MemberLog) => {
    if (selectedActionType === ACTION_TYPES.ALL) return true;

    switch (selectedActionType) {
      case ACTION_TYPES.MESSAGES:
        return (
          log.action.includes("message") || log.action.includes("conversation")
        );
      case ACTION_TYPES.LISTINGS:
        return log.action.includes("listing");
      case ACTION_TYPES.SUBSCRIPTIONS:
        return log.action.includes("subscription");
      default:
        return true;
    }
  });

  // Log filtered logs for debugging
  console.log(
    "Filtered message logs:",
    JSON.stringify(
      filteredLogs?.filter((log: MemberLog) => log.action === "send_message"),
      null,
      2
    )
  );

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
                <SelectItem value={ACTION_TYPES.MESSAGES}>Messages</SelectItem>
                <SelectItem value={ACTION_TYPES.LISTINGS}>Listings</SelectItem>
                <SelectItem value={ACTION_TYPES.SUBSCRIPTIONS}>
                  Subscriptions
                </SelectItem>
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
                  Member
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
              {filteredLogs?.map((log: MemberLog) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedLog(log)}>
                  <TableCell className="text-center border-r">
                    {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-center border-r">
                    {log.user_email}
                  </TableCell>
                  <TableCell className="text-center border-r">
                    {log.action}
                    {log.action === "send_message" &&
                      log.details?.has_attachments && (
                        <span className="block w-fit mx-auto mt-1 text-xs bg-muted px-2 py-1 rounded-full">
                          with attachment
                        </span>
                      )}
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
                  <h4 className="text-sm font-medium text-gray-500">Member</h4>
                  <p className="mt-1">{selectedLog?.user_email}</p>
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

              {/* Message specific details */}
              {selectedLog?.action === "send_message" && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Message Details
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Content:</span>
                        <p className="mt-1">
                          {selectedLog.details?.content || "No content"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Conversation ID:
                        </span>
                        <p className="mt-1 text-sm font-mono">
                          {selectedLog.details?.conversation_id}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Message ID:
                        </span>
                        <p className="mt-1 text-sm font-mono">
                          {selectedLog.details?.message_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedLog.details?.has_attachments && (
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Attachments
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedLog.details?.attachments?.map((att: any) => (
                          <div
                            key={att.id}
                            className="bg-muted rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p
                                  className="font-medium truncate max-w-[200px]"
                                  title={att.filename}>
                                  {att.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Type: {att.fileType} • Size:{" "}
                                  {(att.fileSize / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            {att.url && (
                              <div className="flex items-center gap-2">
                                {att.thumbnail_url && (
                                  <img
                                    src={att.thumbnail_url}
                                    alt={att.filename}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                )}
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1">
                                  View File
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Listing specific details */}
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
                        <span className="text-sm text-gray-500">
                          Changes Made:
                        </span>
                        <ul className="mt-1 list-disc list-inside">
                          {Object.entries(selectedLog.details.changes).map(
                            ([key, value]: [string, any]) => (
                              <li key={key} className="text-sm">
                                <span className="capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subscription specific details */}
              {selectedLog?.action.includes("subscription") && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Subscription Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">
                        Subscription ID:
                      </span>
                      <p className="mt-1 text-sm font-mono">
                        {selectedLog.details?.subscription_id}
                      </p>
                    </div>
                    {selectedLog.details?.status && (
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <p className="mt-1 capitalize">
                          {selectedLog.details.status}
                        </p>
                      </div>
                    )}
                    {selectedLog.details?.plan && (
                      <div>
                        <span className="text-sm text-gray-500">Plan:</span>
                        <p className="mt-1 capitalize">
                          {selectedLog.details.plan}
                        </p>
                      </div>
                    )}
                    {selectedLog.details?.amount && (
                      <div>
                        <span className="text-sm text-gray-500">Amount:</span>
                        <p className="mt-1">
                          ${(selectedLog.details.amount / 100).toFixed(2)}
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
