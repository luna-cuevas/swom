"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ListingsTable from "./components/ListingsTable";
import PendingApprovals from "./components/PendingApprovals";
import HighlightedListings from "./components/HighlightedListings";
import CityDescriptions from "./components/CityDescriptions";
import UsersTable from "./components/UsersTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AdminDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container min-h-[90vh] mx-auto py-10 space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage listings, approvals, and highlighted content
          </p>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="listings" className="flex-1 max-w-[200px]">
              Live Listings
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 max-w-[200px]">
              Pending Approval
            </TabsTrigger>
            <TabsTrigger value="highlighted" className="flex-1 max-w-[200px]">
              Highlighted Listings
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex-1 max-w-[200px]">
              City Descriptions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 max-w-[200px]">
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card className="p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Live Listings</h2>
                </div>
                <ListingsTable />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Pending Approval</h2>
                </div>
                <PendingApprovals />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="highlighted">
            <Card className="p-6 pt-4">
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
            <Card className="p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">City Descriptions</h2>
                </div>
                <CityDescriptions />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Users</h2>
                </div>
                <UsersTable />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}
