import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDailyProfitUpdater() {
  useEffect(() => {
    const updateProfits = async () => {
      const { data: investments, error } = await supabase
        .from("investments")
        .select("*")
        .eq("status", "active");

      if (error) {
        console.error("Error fetching investments:", error.message);
        return;
      }

      const updates = investments.map(async (investment) => {
        const start = new Date(investment.start_date);
        const now = new Date();
        const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        const newValue = Math.min(
          investment.starting_value +
            investment.starting_value * (investment.daily_growth_rate / 100) * daysElapsed,
          investment.final_value
        );

        return supabase
          .from("investments")
          .update({ current_value: newValue })
          .eq("id", investment.id);
      });

      await Promise.all(updates);
    };

    // Set a timeout to run updateProfits after 24 hours
    const timeout = setTimeout(() => {
      updateProfits();
    }, 86400000); // 24 hours in milliseconds

    // Optional: clear timeout if the component unmounts before timeout
    return () => clearTimeout(timeout);
  }, []);
}
