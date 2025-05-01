
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DepositForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Mock company TRC20 address - in a real app, this would come from your backend
  const companyTrc20Address = "TRC20CompanyAddress123456789";

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast.error("Please upload an image file");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    setScreenshot(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!txHash.trim()) {
      toast.error("Please enter the transaction hash");
      return;
    }
    
    if (!screenshot) {
      toast.error("Please upload a screenshot of your deposit");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would upload the screenshot to your server/storage
      // and create a deposit transaction record
      
      // Mock successful deposit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Deposit submitted for processing!");
      
      // Reset form
      setAmount("");
      setTxHash("");
      setScreenshot(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast.error("Failed to process deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company USDT Deposit Address (TRC20)</h3>
          <div className="p-3 bg-muted rounded-md flex flex-col gap-2">
            <code className="text-sm font-mono break-all select-all">{companyTrc20Address}</code>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                navigator.clipboard.writeText(companyTrc20Address);
                toast.success("Address copied to clipboard");
              }}
            >
              Copy Address
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Send USDT to this address from your wallet. After sending, complete the form below.
          </p>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Deposit Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="txHash">Transaction Hash (TXID)</Label>
          <Input
            id="txHash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Enter transaction hash"
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground">
            Copy the transaction hash from your wallet after making the transfer
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="screenshot">Upload Deposit Screenshot</Label>
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="screenshot" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-secondary/10"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-primary" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 5MB)</p>
              </div>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
                required
              />
            </label>
          </div>
          
          {previewUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Screenshot Preview:</h4>
              <div className="relative border rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Deposit screenshot preview" 
                  className="w-full max-h-[300px] object-contain"
                />
                <Button 
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setScreenshot(null);
                    setPreviewUrl(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Deposit"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
