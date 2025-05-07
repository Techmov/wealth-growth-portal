
import { useState } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/users/UserManagement";
import { DepositApprovals } from "@/components/admin/deposits/DepositApprovals";
import { WithdrawalApprovals } from "@/components/admin/withdrawals/WithdrawalApprovals";
import { InvestmentPlanManagement } from "@/components/admin/investment-plans/InvestmentPlanManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [statusChanged, setStatusChanged] = useState(false);

  const handleStatusChange = () => {
    setStatusChanged(!statusChanged);
  };

  return (
    <UserLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full flex justify-start overflow-x-auto">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="plans">Investment Plans</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="deposits" className="space-y-4">
            <DepositApprovals onStatusChange={handleStatusChange} />
          </TabsContent>
          
          <TabsContent value="withdrawals" className="space-y-4">
            <WithdrawalApprovals onStatusChange={handleStatusChange} />
          </TabsContent>
          
          <TabsContent value="plans" className="space-y-4">
            <InvestmentPlanManagement onStatusChange={handleStatusChange} />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <ContentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
};

export default AdminDashboard;
