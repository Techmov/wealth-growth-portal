
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

interface ChartProps {
  title: string;
  type: "line" | "bar" | "pie";
  timeframe: "day" | "week" | "month";
  onTimeframeChange: (timeframe: "day" | "week" | "month") => void;
}

export function Chart({ title, type, timeframe, onTimeframeChange }: ChartProps) {
  // Define chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  
  // Fetch chart data based on type and timeframe
  const { data, isLoading } = useQuery({
    queryKey: ["chart-data", type, timeframe],
    queryFn: async () => {
      console.log(`Fetching ${type} chart data for timeframe: ${timeframe}`);
      
      // Different data fetching based on chart type
      if (type === "line") {
        // Fetch investment growth data
        return await fetchInvestmentData(timeframe);
      } else if (type === "bar") {
        // Fetch deposit vs withdrawal data
        return await fetchDepositWithdrawalData(timeframe);
      } else {
        // Fetch investment plan distribution data
        return await fetchInvestmentPlanData();
      }
    },
    refetchInterval: 120000 // Refresh every 2 minutes
  });
  
  // Function to fetch investment data
  const fetchInvestmentData = async (timeframe: string) => {
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === "day") {
      startDate.setHours(now.getHours() - 24);
    } else if (timeframe === "week") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    // This would be replaced with actual data from Supabase
    // Here we're generating sample data for demonstration
    const sampleData = [];
    
    // Generate different intervals based on timeframe
    const intervals = timeframe === "day" ? 24 : timeframe === "week" ? 7 : 30;
    
    for (let i = 0; i < intervals; i++) {
      const date = new Date(startDate);
      if (timeframe === "day") {
        date.setHours(date.getHours() + i);
      } else if (timeframe === "week") {
        date.setDate(date.getDate() + i);
      } else {
        date.setDate(date.getDate() + i);
      }
      
      sampleData.push({
        name: timeframe === "day" 
          ? date.getHours() + ":00" 
          : `${date.getMonth() + 1}/${date.getDate()}`,
        value: 5000 + Math.random() * 2000,
      });
    }
    
    return sampleData;
  };
  
  // Function to fetch deposit vs withdrawal data
  const fetchDepositWithdrawalData = async (timeframe: string) => {
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === "day") {
      startDate.setHours(now.getHours() - 24);
    } else if (timeframe === "week") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    // This would be replaced with actual data from Supabase
    // Here we're generating sample data for demonstration
    const sampleData = [];
    
    // Generate different intervals based on timeframe
    const intervals = timeframe === "day" ? 24 : timeframe === "week" ? 7 : 30;
    
    for (let i = 0; i < intervals; i++) {
      const date = new Date(startDate);
      if (timeframe === "day") {
        date.setHours(date.getHours() + i);
      } else if (timeframe === "week") {
        date.setDate(date.getDate() + i);
      } else {
        date.setDate(date.getDate() + i);
      }
      
      sampleData.push({
        name: timeframe === "day" 
          ? date.getHours() + ":00" 
          : `${date.getMonth() + 1}/${date.getDate()}`,
        deposits: 1000 + Math.random() * 1000,
        withdrawals: 800 + Math.random() * 800,
      });
    }
    
    return sampleData;
  };
  
  // Function to fetch investment plan distribution data
  const fetchInvestmentPlanData = async () => {
    // This would be replaced with actual data from Supabase
    return [
      { name: "Basic Plan", value: 400 },
      { name: "Premium Plan", value: 300 },
      { name: "Gold Plan", value: 200 },
      { name: "Platinum Plan", value: 100 },
    ];
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {timeframe === "day" 
              ? "Last 24 hours" 
              : timeframe === "week" 
                ? "Last 7 days" 
                : "Last 30 days"}
          </CardDescription>
        </div>
        <ToggleGroup 
          type="single" 
          size="sm"
          value={timeframe}
          onValueChange={(value) => {
            if (value) onTimeframeChange(value as "day" | "week" | "month");
          }}
        >
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Bar dataKey="deposits" fill="#0088FE" />
              <Bar dataKey="withdrawals" fill="#FF8042" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
