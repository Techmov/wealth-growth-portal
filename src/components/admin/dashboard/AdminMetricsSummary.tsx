
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminMetricsSummary() {
  const isMobile = useIsMobile();
  
  // Fetch investment plan distribution data
  const { data: planDistribution, isLoading: planLoading } = useQuery({
    queryKey: ["plan-distribution"],
    queryFn: async () => {
      // In a real implementation, this would be fetched from Supabase
      // For now, we're returning sample data
      return [
        { name: "Starter", value: 30 },
        { name: "Growth", value: 40 },
        { name: "Premium", value: 20 },
        { name: "Enterprise", value: 10 }
      ];
    }
  });
  
  // Sample system health data
  const systemHealth = {
    uptime: "99.98%",
    responseTime: "120ms",
    errors: "0.01%",
    userSatisfaction: 95
  };

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
        <CardDescription>Key metrics and health indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[90%] mx-auto">
          {/* System Health */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">System Health</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm">Uptime</p>
                <p className="text-sm font-medium">{systemHealth.uptime}</p>
              </div>
              <Progress value={99.98} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm">Avg. Response Time</p>
                <p className="text-sm font-medium">{systemHealth.responseTime}</p>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm">Error Rate</p>
                <p className="text-sm font-medium">{systemHealth.errors}</p>
              </div>
              <Progress value={99} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm">User Satisfaction</p>
                <p className="text-sm font-medium">{systemHealth.userSatisfaction}%</p>
              </div>
              <Progress value={systemHealth.userSatisfaction} className="h-2" />
            </div>
          </div>
          
          {/* Investment Plan Distribution - hide on mobile */}
          {!isMobile && (
            <div className="h-[200px]">
              <h3 className="text-sm font-medium mb-4">Investment Plan Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {planDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
