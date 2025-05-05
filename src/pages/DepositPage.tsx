
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DepositForm } from "@/components/DepositForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const DepositPage = () => {
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState<{trc20: boolean, bep20: boolean}>({ trc20: false, bep20: false });
  const [paymentSettings, setPaymentSettings] = useState({
    trc20Address: "TG3XXX...Default TRC20 Address",
    bep20Address: "0x123...Default BEP20 Address"
  });
  
  useEffect(() => {
    // Get payment settings from localStorage
    const settings = localStorage.getItem("paymentSettings");
    if (settings) {
      setPaymentSettings(JSON.parse(settings));
    }
  }, []);
  
  const copyToClipboard = async (text: string, type: 'trc20' | 'bep20') => {
    await navigator.clipboard.writeText(text);
    
    setCopied(prev => ({ ...prev, [type]: true }));
    
    toast.success("Address copied to clipboard");
    
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Deposit Funds</h1>
            <p className="text-muted-foreground mt-2">
              Deposit cryptocurrency to your account
            </p>
          </div>
          
          <div className="bg-card rounded-lg border p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payment Addresses</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-md border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">USDT (TRC20)</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(paymentSettings.trc20Address, 'trc20')}
                      className="gap-2"
                    >
                      {copied.trc20 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied.trc20 ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="mt-2 p-2 bg-muted rounded text-sm font-mono break-all">
                    {paymentSettings.trc20Address}
                  </div>
                </div>
                
                <div className="p-4 rounded-md border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">USDT (BEP20)</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(paymentSettings.bep20Address, 'bep20')}
                      className="gap-2"
                    >
                      {copied.bep20 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied.bep20 ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="mt-2 p-2 bg-muted rounded text-sm font-mono break-all">
                    {paymentSettings.bep20Address}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <DepositForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DepositPage;
