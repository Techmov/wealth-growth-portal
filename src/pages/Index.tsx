
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  ArrowRight, 
  CheckCircle,
  ChevronDown,
  ArrowUp,
  Landmark,
  Shield,
  Users,
  TrendingUp,
  Clock,
  BarChart3
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  
  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const investmentPlans = [
    {
      name: "Starter Growth",
      amount: "$100",
      duration: "15 days",
      profit: "100%",
      risk: "Low",
      features: ["Daily ROI updates", "Beginner-friendly", "24/7 Support"]
    },
    {
      name: "Premium Growth",
      amount: "$500",
      duration: "20 days",
      profit: "120%",
      risk: "Medium",
      features: ["Higher returns", "Priority Support", "Investment Guidance"]
    },
    {
      name: "Elite Growth",
      amount: "$1,000+",
      duration: "30 days",
      profit: "200%",
      risk: "Medium-High",
      features: ["Maximum returns", "VIP Support", "Personal Investment Manager"]
    }
  ];

  const faqs = [
    {
      question: "How does WealthGrow double my investment?",
      answer: "WealthGrow leverages sophisticated investment algorithms and market opportunities to generate high returns. Our proprietary trading system identifies and executes profitable trades across various financial markets to grow your capital."
    },
    {
      question: "How long until I see returns?",
      answer: "Our investment plans have varying timeframes, from 15 to 30 days. Each plan comes with a specified duration after which you'll receive your original investment plus profits. Some plans offer interim updates so you can track growth."
    },
    {
      question: "How secure are my investments?",
      answer: "Security is our top priority. We employ bank-grade encryption, secure payment processors, and strict risk management protocols to protect your funds and personal information."
    },
    {
      question: "What is the minimum investment amount?",
      answer: "Our entry-level investment plan starts at $100, making wealth growth accessible to everyone. As you gain confidence, you can explore our premium plans that offer higher returns."
    },
    {
      question: "How does the referral system work?",
      answer: "When you refer friends or family using your unique referral code, you earn a commission on their deposits. This creates a passive income stream alongside your investments."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with animation */}
        <section className="relative overflow-hidden bg-gradient-to-br from-wealth-primary to-purple-900 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjIuNCAxMCAxLjN2LjhsLTEwIDMuOXYtNnpNMTQgMThjMS4yIDAgMi4yLjQgMTAgMS4zdi44bC0xMCAzLjl2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
          </div>
          
          <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block px-3 py-1 mb-6 rounded-full bg-white/20 text-sm font-medium text-white backdrop-blur-sm">
                Trusted by 10,000+ investors worldwide
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 slide-up">
                <span className="block">Double Your Investment</span>
                <span className="relative inline-block">
                  in Just <span className="text-yellow-300">30 Days</span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-300"></span>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join our exclusive investment platform that guarantees exceptional returns through strategic market opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="text-lg font-medium px-8 py-6 bg-yellow-500 hover:bg-yellow-600 text-black">
                    Start Investing <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/investments">
                  <Button variant="outline" size="lg" className="text-lg font-medium px-8 py-6 border-white text-white hover:bg-white/20">
                    View Investment Plans
                  </Button>
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">High Returns</h3>
                  <p className="text-white/70">Up to 200% profit in just 30 days</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
                  <p className="text-white/70">Bank-grade security protecting your investments</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Referral Rewards</h3>
                  <p className="text-white/70">Earn bonuses by inviting others</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
              <path fill="#ffffff" fillOpacity="1" d="M0,128L48,112C96,96,192,64,288,69.3C384,75,480,117,576,144C672,171,768,181,864,165.3C960,149,1056,107,1152,85.3C1248,64,1344,64,1392,64L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Investment Plans Showcase */}
        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Investment Plans</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the investment plan that suits your financial goals and risk tolerance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {investmentPlans.map((plan, index) => (
                <div key={index} className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border ${index === 1 ? 'border-wealth-primary transform scale-105' : 'border-gray-100'}`}>
                  <div className={`p-8 ${index === 1 ? 'bg-wealth-primary text-white' : 'bg-white'}`}>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-4xl font-bold">{plan.amount}</span>
                      <span className="text-lg text-gray-500">minimum</span>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>Duration:</span>
                        <span className="font-semibold">{plan.duration}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>Return:</span>
                        <span className="font-semibold text-green-600">{plan.profit}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>Risk Level:</span>
                        <span className="font-semibold">{plan.risk}</span>
                      </div>
                    </div>
                    
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className={`w-5 h-5 ${index === 1 ? 'text-green-300' : 'text-green-500'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to="/signup">
                      <Button className={`w-full py-6 ${index === 1 ? 'bg-white text-wealth-primary hover:bg-gray-100' : ''}`}>
                        Start Investing
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl font-bold mb-6">About WealthGrow</h2>
                <p className="text-lg text-gray-600 mb-6">
                  WealthGrow is a leading investment platform focused on providing exceptional returns through carefully selected market opportunities and strategic investments.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-wealth-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Landmark className="text-wealth-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Experienced Team</h3>
                      <p className="text-gray-600">
                        Our team consists of financial experts with decades of experience in market analysis and investment management.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-wealth-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <BarChart3 className="text-wealth-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Proprietary Algorithm</h3>
                      <p className="text-gray-600">
                        Our advanced trading algorithms identify profitable opportunities across multiple markets 24/7.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-wealth-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="text-wealth-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Fast Returns</h3>
                      <p className="text-gray-600">
                        Unlike traditional investments, our platform delivers significant returns in days, not years.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="w-full h-[400px] bg-wealth-primary rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                      alt="Investment Team" 
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-wealth-primary/50"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-white p-8 text-center">
                      <h3 className="text-3xl font-bold mb-4">Join Over 10,000 Investors</h3>
                      <p className="text-xl mb-6">Who have already doubled their investments</p>
                      <Link to="/signup">
                        <Button size="lg" className="bg-white text-wealth-primary hover:bg-gray-100">
                          Start Your Journey Today
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500 rounded-lg -z-10"></div>
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-wealth-primary rounded-lg -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">
                  Find answers to common questions about our investment platform.
                </p>
              </div>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                      onClick={() => toggleQuestion(index)}
                    >
                      <span className="text-lg font-semibold">{faq.question}</span>
                      {activeQuestion === index ? 
                        <ChevronDown className="transform rotate-180 transition-transform" /> : 
                        <ChevronDown className="transition-transform" />
                      }
                    </button>
                    
                    {activeQuestion === index && (
                      <div className="p-6 pt-0 text-gray-600 border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-wealth-primary text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,_rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_70%_20%,_rgba(255,255,255,0.08),transparent_30%)]"></div>
          </div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                <ArrowUp className="w-4 h-4" /> 200% Returns In 30 Days
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Double Your Investment?
              </h2>
              
              <p className="text-xl text-white/80 max-w-2xl">
                Join thousands of investors who have already transformed their financial future with our platform. Start your wealth growth journey today!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-wealth-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                    Create Your Account
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
