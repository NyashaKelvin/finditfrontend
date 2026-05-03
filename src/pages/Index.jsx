import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getBootstrap } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";
import { Search, ShieldCheck, Users, Package, X, ChevronRight, Mail, Map, Lock, Info } from "lucide-react";
import { useState } from "react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(null);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatClick = (path) => {
    if (!user) {
      navigate("/login", { 
        state: { 
          from: { pathname: path }, 
          message: "Please sign in to access the community dashboard." 
        } 
      });
    } else {
      navigate(path);
    }
  };
  
  const { data: bootRes, isLoading } = useQuery({
    queryKey: ['bootstrap'],
    queryFn: getBootstrap,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const stats = bootRes?.data?.stats || { total_lost: 0, total_found: 0, total_items: 0 };

  const howItWorksSteps = [
    { 
      step: "01", 
      title: "Post Your Item", 
      desc: "Describe the item with details, location, and a photo. High-quality info helps the most.", 
      icon: <Package className="w-7 h-7" />,
      longDesc: "Start by filling out our simple form. You can upload images—which our system automatically optimizes into fast-loading thumbnails—and specify where exactly the item was spotted. This creates a visible record that our entire community can see.",
      link: "/post-item",
      linkText: "Post an Item Now"
    },
    { 
      step: "02", 
      title: "Get Smart Matches", 
      desc: "Our system filters through thousands of items based on keywords and location.", 
      icon: <Search className="w-7 h-7" />,
      longDesc: "Once posted, your item enters our real-time database. Whether you are searching for a 'LOST' or 'FOUND' item, our filters let you narrow down results by category and date. No more scrolling through endless unrelated posts.",
      link: "/dashboard",
      linkText: "View the Dashboard"
    },
    { 
      step: "03", 
      title: "Claim & Reconnect", 
      desc: "Verify ownership through our secure verification process and set up a meeting.", 
      icon: <Users className="w-7 h-7" />,
      longDesc: "When a potential match is found, send a 'Claim Request'. The item owner will see your verification answer and can choose to approve it. Once approved, you get access to a private chat to arrange a safe returning point.",
      link: "/inbox",
      linkText: "Check Your Messages"
    }
  ];

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  return (
    <div className="animate-fade-in bg-background flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block mb-4 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary animate-pulse-subtle">
            Community-Powered Recovery
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6">
            Lost Something?<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sky-600">We'll Help You Find It.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            Post lost or found items, browse real-time reports, and reunite with your belongings using our secure matching system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-base px-8 py-3">Go to Dashboard</Link>
                <Link to="/post-item" className="btn-secondary text-base px-8 py-3">Post an Item</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3">Get Started Free</Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3">Sign In</Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-sky-500/5 blur-[80px] pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-12 relative z-10 mb-20">
        {isLoading ? (
          <div className="flex justify-center"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Lost Items", value: stats.total_lost, icon: <Search className="text-destructive" />, color: "border-destructive/20", bg: "bg-destructive/5", path: "/dashboard?tab=LOST" },
              { label: "Found Items", value: stats.total_found, icon: <ShieldCheck className="text-success" />, color: "border-success/20", bg: "bg-success/5", path: "/dashboard?tab=FOUND" },
              { label: "Recovered Total", value: stats.successfully_returned || 0, icon: <Package className="text-primary" />, color: "border-primary/20", bg: "bg-primary/5", path: "/dashboard" }
            ].map((s) => (
              <div 
                key={s.label} 
                onClick={() => handleStatClick(s.path)}
                className={`glass-card p-8 text-center border ${s.color} hover:border-primary/40 transition-all duration-300 cursor-pointer group active:scale-95`}
              >
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${s.bg} text-2xl transform transition-transform group-hover:scale-110`}>
                  {s.icon}
                </div>
                <div className="text-4xl font-black text-foreground mb-1 tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 border-t border-border/50">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Click on any step below to see detailed instructions and shortcuts for our platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorksSteps.map((item) => (
            <div 
              key={item.step} 
              onClick={() => handleStepClick(item)}
              className="glass-card p-10 text-center cursor-pointer group hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            >

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transform transition-all duration-500 group-hover:rotate-6">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{item.desc}</p>
              <div className="flex items-center justify-center text-primary font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Read Details <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Modal Overlay */}
      {activeStep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveStep(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary flex">
                {activeStep.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{activeStep.title}</h3>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Guide & Links</span>
              </div>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {activeStep.longDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to={activeStep.link} 
                className="btn-primary flex items-center justify-center gap-2 py-4"
                onClick={() => setActiveStep(null)}
              >
                {activeStep.linkText} <ChevronRight size={18} />
              </Link>
              <button 
                onClick={() => setActiveStep(null)}
                className="btn-ghost"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-auto pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" onClick={handleLogoClick} className="text-3xl font-black tracking-tighter text-primary flex items-center gap-2 mb-6 transition-transform hover:scale-105">
                FindIt
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The community's ultimate tool for finding what’s been lost and returning what’s been found. Secure, fast, and local.
              </p>

            </div>

            <div>
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <Map size={16} className="text-primary" /> Navigation
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/" onClick={handleLogoClick} className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Item Dashboard</Link></li>
                <li><Link to="/post-item" className="hover:text-primary transition-colors">Post New Item</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <Lock size={16} className="text-primary" /> User Account
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {user ? (
                  <>
                    <li><Link to="/inbox" className="hover:text-primary transition-colors">My Inbox</Link></li>
                    <li><Link to="/notifications" className="hover:text-primary transition-colors">Notifications</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                    <li><Link to="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <Info size={16} className="text-primary" /> Platform
              </h4>
              <p className="text-sm text-muted-foreground mb-6">
                Get real-time updates and search through lost and found items in your specific area.
              </p>
              <Link to="/register" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
                Join our community <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FindIt — Community Lost & Found Matchmaker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
