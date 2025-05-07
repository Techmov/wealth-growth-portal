
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  description?: string;
}

interface UserRegistration {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface ActivityFeedProps {
  transactions?: Transaction[];
  registrations?: UserRegistration[];
}

export function ActivityFeed({ transactions, registrations }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent system activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-0">
            <ScrollArea className="h-[300px] pr-4">
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-start space-x-4 border-b pb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </p>
                          <Badge 
                            variant={
                              transaction.status === "completed" ? "default" : 
                              transaction.status === "pending" ? "outline" : "destructive"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.description || "No description"}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {format(new Date(transaction.date), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent transactions</p>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="registrations" className="mt-0">
            <ScrollArea className="h-[300px] pr-4">
              {registrations && registrations.length > 0 ? (
                <div className="space-y-4">
                  {registrations.map((user) => (
                    <div key={user.id} className="flex items-start space-x-4 border-b pb-3">
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          Registered: {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent registrations</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
