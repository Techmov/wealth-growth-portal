
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

interface PaymentSettingsProps {
  onSettingsUpdated?: () => void;
}

export function PaymentSettings({ onSettingsUpdated }: PaymentSettingsProps) {
  const [trc20Address, setTrc20Address] = useState("");
  const [bep20Address, setBep20Address] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load current settings
    const settings = localStorage.getItem("paymentSettings");
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      setTrc20Address(parsedSettings.trc20Address || "");
      setBep20Address(parsedSettings.bep20Address || "");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const settings = {
      trc20Address,
      bep20Address
    };
    
    localStorage.setItem("paymentSettings", JSON.stringify(settings));
    
    // Dispatch event to update any components that depend on payment settings
    window.dispatchEvent(new CustomEvent('paymentSettingsUpdated', { 
      detail: { settings } 
    }));
    
    if (onSettingsUpdated) {
      onSettingsUpdated();
    }
    
    toast.success("Payment settings updated successfully");
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway Settings</CardTitle>
        <CardDescription>
          Update your cryptocurrency wallet addresses for deposits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trc20-address">USDT (TRC20) Wallet Address</Label>
            <Input
              id="trc20-address"
              value={trc20Address}
              onChange={(e) => setTrc20Address(e.target.value)}
              placeholder="TG3XXX..."
            />
            <p className="text-xs text-muted-foreground">
              TRC20 addresses start with T and are used on the TRON network
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bep20-address">USDT (BEP20) Wallet Address</Label>
            <Input
              id="bep20-address"
              value={bep20Address}
              onChange={(e) => setBep20Address(e.target.value)}
              placeholder="0x123..."
            />
            <p className="text-xs text-muted-foreground">
              BEP20 addresses start with 0x and are used on the Binance Smart Chain
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-muted-foreground">
        <p>
          These wallet addresses will be displayed to users on the deposit page. 
          Make sure to double-check the addresses before saving.
        </p>
      </CardFooter>
    </Card>
  );
}
