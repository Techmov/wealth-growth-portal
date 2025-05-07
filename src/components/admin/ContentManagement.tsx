
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPromotionsManagement } from "./content/AdminPromotionsManagement";

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState("promotions");
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
      <p className="text-muted-foreground">
        Manage promotions and content displayed on the homepage.
      </p>
      
      <Tabs 
        defaultValue="promotions" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="promotions" className="space-y-4">
          <AdminPromotionsManagement />
        </TabsContent>
        
        <TabsContent value="offers" className="space-y-4">
          {/* We'll implement this later - similar to promotions management */}
          <div className="bg-muted p-8 rounded-md text-center">
            <h3 className="font-medium text-lg mb-2">Offer Management Coming Soon</h3>
            <p className="text-muted-foreground">
              The ability to manage offers will be implemented in a future update.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          {/* We'll implement this later - similar to promotions management */}
          <div className="bg-muted p-8 rounded-md text-center">
            <h3 className="font-medium text-lg mb-2">Feature Management Coming Soon</h3>
            <p className="text-muted-foreground">
              The ability to manage features will be implemented in a future update.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
