
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t mt-auto py-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold mb-4">WealthGrowth</h4>
            <p className="text-muted-foreground text-sm">
              Growing your wealth with innovative investment solutions. Double your investments in as little as 15 days.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/investments" className="text-muted-foreground hover:text-foreground transition-colors">
                  Investments
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-muted-foreground hover:text-foreground transition-colors">
                  Referrals
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Risk Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@wealthgrowth.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  support@wealthgrowth.com
                </a>
              </li>
              <li>
                <a href="https://t.me/+SRZ--KW2-YllNjE0" className="text-muted-foreground hover:text-foreground transition-colors">
                  WealthGrowth Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} WealthGrowth. All rights reserved.</p>
          <p className="mt-1">
            DISCLAIMER: Investments involve risk and are not guaranteed. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
