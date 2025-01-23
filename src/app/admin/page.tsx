"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ListingsTable from "./components/ListingsTable";
import PendingApprovals from "./components/PendingApprovals";
import HighlightedListings from "./components/HighlightedListings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AdminDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Live Listings</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="highlighted">Highlighted Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="p-6">
              <ListingsTable />
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="p-6">
              <PendingApprovals />
            </Card>
          </TabsContent>

          <TabsContent value="highlighted">
            <Card className="p-6">
              <HighlightedListings />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}
