import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Lock, ChevronLeft, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const redirectInfo = location.state?.message;
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("All fields are required.");
      return;
    }
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || err.message || "Login failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center px-4 animate-fade-in relative">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate("/")} 
          className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        <div className="glass-card w-full p-8 shadow-2xl border-primary/10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <User size={28} />
            </div>
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          {redirectInfo && (
            <div className="mb-6 rounded-lg bg-primary/10 border border-primary/20 p-4 text-sm text-primary animate-pulse-subtle">
              <p className="font-semibold mb-1">Authentication Required</p>
              {redirectInfo}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-muted-foreground w-4.5 h-4.5" />
                <input
                  className="input-field pl-11 bg-muted/20 border-transparent focus:border-primary/50 focus:bg-background"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-muted-foreground w-4.5 h-4.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-11 pr-12 bg-muted/20 border-transparent focus:border-primary/50 focus:bg-background"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-3 mt-2 font-bold shadow-lg shadow-primary/20 border-none"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" state={location.state} className="text-primary font-bold hover:underline transition-colors">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
