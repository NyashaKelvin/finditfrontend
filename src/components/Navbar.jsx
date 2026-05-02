import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Bell, Menu, X, Home, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBootstrap, getItems, getClaims, getMessages, getNotifications } from "@/lib/api";
const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();

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
    {user && (
      <Link to="/my-posts" className="btn-ghost text-sm" onClick={() => setMobileOpen(false)}>My Posts</Link>
    )}
    <Link to="/post-item" className="btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Post Item</Link>
    <Link to="/inbox" className="relative btn-ghost text-sm" onClick={() => setMobileOpen(false)} onMouseEnter={prefetchInbox}>
      <MessageSquare className="inline mr-1 w-4 h-4" /> Inbox {unreadMsg > 0 && <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground shadow-sm ring-2 ring-card">{unreadMsg}</span>}
    </Link>
    <Link to="/notifications" className="relative btn-ghost text-sm" onClick={() => setMobileOpen(false)} onMouseEnter={prefetchNotifications}>
      <Bell className="inline mr-1 w-4 h-4" /> Alerts {unreadNotif > 0 && <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground shadow-sm ring-2 ring-card">{unreadNotif}</span>}
    </Link>
    {user ? (
      <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
    ) : (
      <>
        <Link to="/login" className="btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
        <Link to="/register" className="btn-primary text-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
      </>
    )}
  </>;

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
          <button onClick={toggleTheme} className="btn-ghost p-2 ml-2" aria-label="Toggle theme">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
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
      {mobileOpen && <div className="md:hidden border-b border-border bg-card px-4 py-3 flex flex-col gap-2 animate-fade-in">
          {navLinks}
        </div>}
    </nav>;
};
export default Navbar;
