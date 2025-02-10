"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ListingsTable from "./components/ListingsTable";
import PendingApprovals from "./components/PendingApprovals";
import HighlightedListings from "./components/HighlightedListings";
import CityDescriptions from "./components/CityDescriptions";
import UsersTable from "./components/UsersTable";
import AdminLogsTable from "./components/AdminLogsTable";
import MemberLogsTable from "./components/MemberLogsTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const queryClient = new QueryClient();

export default function AdminDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container min-h-[90vh] mx-auto py-4 sm:py-10 space-y-4 sm:space-y-8 px-2 sm:px-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage listings, approvals, and highlighted content
          </p>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start border-b inline-flex h-auto p-0 gap-2">
              <TabsTrigger
                value="listings"
                className="flex-none px-3 py-1.5 h-auto">
                Live Listings
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex-none px-3 py-1.5 h-auto">
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="highlighted"
                className="flex-none px-3 py-1.5 h-auto">
                Highlighted
              </TabsTrigger>
              <TabsTrigger
                value="cities"
                className="flex-none px-3 py-1.5 h-auto">
                Cities
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex-none px-3 py-1.5 h-auto">
                Users
              </TabsTrigger>
              <TabsTrigger
                value="admin-logs"
                className="flex-none px-3 py-1.5 h-auto">
                Admin Logs
              </TabsTrigger>
              <TabsTrigger
                value="member-logs"
                className="flex-none px-3 py-1.5 h-auto">
                Member Logs
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="listings">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Live Listings</h2>
                </div>
                <ListingsTable />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Pending Approval</h2>
                </div>
                <PendingApprovals />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="highlighted">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Highlighted Listings
                  </h2>
                </div>
                <HighlightedListings />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cities">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">City Descriptions</h2>
                </div>
                <CityDescriptions />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Users</h2>
                </div>
                <UsersTable />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="admin-logs">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Admin Activity Logs</h2>
                </div>
                <AdminLogsTable />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="member-logs">
            <Card className="p-2 sm:p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Member Activity Logs
                  </h2>
                </div>
                <MemberLogsTable />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}
