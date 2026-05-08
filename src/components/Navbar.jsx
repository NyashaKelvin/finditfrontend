import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Bell, Menu, X, Home, MessageSquare, User, LogOut, ChevronDown, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBootstrap, getItems, getClaims, getMessages, getNotifications } from "@/lib/api";
const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const prefetchDashboard = () => queryClient.prefetchQuery({ queryKey: ['items', 'LOST', ''], queryFn: () => getItems({ status: 'LOST', search: '' }) });
  const prefetchInbox = () => {
    queryClient.prefetchQuery({ queryKey: ['bootstrap'], queryFn: getBootstrap });
  };
  const prefetchNotifications = () => queryClient.prefetchQuery({ queryKey: ['notifications'], queryFn: getNotifications });

  const { data: bootRes } = useQuery({
    queryKey: ['bootstrap'],
    queryFn: getBootstrap,
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (bootRes?.data?.user) {
      // ONLY update if the user data is actually different to prevent re-render loops
      const currentUserStr = JSON.stringify(user);
      const newUserStr = JSON.stringify(bootRes.data.user);
      
      if (currentUserStr !== newUserStr) {
        updateUser(bootRes.data.user);
      }
    }
  }, [bootRes?.data?.user, updateUser, user]);

  const unreadMsg = bootRes?.data?.unread_messages || 0;
  const notifications = bootRes?.data?.notifications || [];
  const unreadNotif = Array.isArray(notifications) ? notifications.filter(n => !n?.is_read).length : 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinks = <>
    <Link to="/" className="btn-ghost text-sm" onClick={handleLogoClick}><Home className="inline mr-1 w-4 h-4" /> Home</Link>
    <Link to="/dashboard" className="btn-ghost text-sm" onClick={() => setMobileOpen(false)} onMouseEnter={prefetchDashboard}>Dashboard</Link>
    <Link to="/post-item" className="btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Post Item</Link>
    <Link to="/inbox" className="relative btn-ghost text-sm" onClick={() => setMobileOpen(false)} onMouseEnter={prefetchInbox}>
      <MessageSquare className="inline mr-1 w-4 h-4" /> Inbox {unreadMsg > 0 && <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground shadow-sm ring-2 ring-card">{unreadMsg}</span>}
    </Link>
    <Link to="/notifications" className="relative btn-ghost text-sm" onClick={() => setMobileOpen(false)} onMouseEnter={prefetchNotifications}>
      <Bell className="inline mr-1 w-4 h-4" /> Alerts {unreadNotif > 0 && <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground shadow-sm ring-2 ring-card">{unreadNotif}</span>}
    </Link>
  </>;

  const UserMenuContent = ({ isMobile }) => {
    if (!user) {
      return (
        <div className="p-4 flex flex-col items-center text-center gap-4">
          <div className="mb-1">
            <p className="text-sm font-bold text-foreground">Welcome to FindIt</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Community-powered discovery</p>
          </div>
          
          <div className="flex flex-col w-full gap-2 px-1">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium hover:bg-muted rounded-lg transition-all" 
              onClick={() => { setMobileOpen(false); setShowUserMenu(false); }}
            >
              <User className="w-4 h-4" /> Login
            </Link>
            <Link 
              to="/register" 
              className="btn-primary w-full py-2.5 text-sm font-bold shadow-md shadow-primary/10" 
              onClick={() => { setMobileOpen(false); setShowUserMenu(false); }}
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      );
    }
    return <>
      <div className={`px-5 py-4 border-b border-border mb-2 ${isMobile ? 'bg-muted/30 rounded-t-xl' : ''}`}>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1">Account</p>
        <p className="text-sm font-bold truncate text-foreground">{user.username}</p>
      </div>
      
      <div className="flex flex-col gap-0.5 px-1.5">
        <Link 
          to="/my-posts" 
          className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-all duration-200 group" 
          onClick={() => { setMobileOpen(false); setShowUserMenu(false); }}
        >
          <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> 
          <span>My Items</span>
        </Link>
        <Link 
          to="/dashboard" 
          className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-all duration-200 group" 
          onClick={() => { setMobileOpen(false); setShowUserMenu(false); }}
        >
          <Home className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> 
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="mt-2 pt-2 border-t border-border px-1.5">
        <button 
          onClick={() => { handleLogout(); setShowUserMenu(false); setMobileOpen(false); }} 
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4" /> 
          <span>Logout</span>
        </button>
      </div>
    </>;
  };

  return <nav className="sticky top-0 z-50 h-16 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 text-xl font-bold text-primary transition-transform hover:scale-105 active:scale-95">
          FindIt
        </Link>

        {
    /* Desktop */
  }
        <div className="hidden md:flex items-center gap-2">
          {navLinks}
          
          <div className="h-6 w-px bg-border mx-2" />

          <button onClick={toggleTheme} className="btn-ghost p-2 mr-1" aria-label="Toggle theme">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 p-1 pl-2 rounded-full border transition-all duration-200 ${showUserMenu ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted'}`}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 text-primary">
                <User className="w-4.5 h-4.5" />
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-card border border-border shadow-xl py-2 animate-in fade-in zoom-in-95 origin-top-right z-[100]">
                <UserMenuContent isMobile={false} />
              </div>
            )}
          </div>
        </div>

        {
    /* Mobile toggle */
  }
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="btn-ghost p-2" aria-label="Toggle theme">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {
    /* Mobile menu */
  }
      {mobileOpen && <div className="md:hidden border-b border-border bg-card px-4 py-3 flex flex-col gap-2 animate-fade-in shadow-lg">
          {navLinks}
          <div className="h-px bg-border my-1" />
          <UserMenuContent isMobile={true} />
        </div>}
    </nav>;
};
export default Navbar;
