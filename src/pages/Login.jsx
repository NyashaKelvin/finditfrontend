import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Lock, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const { login, loginGoogle, token, loading } = useAuth();
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

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // tokenResponse.access_token is the real OAuth2 access token
      await loginGoogle(tokenResponse.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Google Login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google Login was unsuccessful.");
  };


  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-4 animate-fade-in relative overflow-hidden">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate("/")} 
          className="mb-2.5 flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        <div className="glass-card w-full p-5 sm:p-6 shadow-2xl border-primary/10">
          <div className="text-center mb-4">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <User size={22} />
            </div>
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="text-xs text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {redirectInfo && (
            <div className="mb-4 rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-primary animate-pulse-subtle">
              <p className="font-semibold mb-0.5">Authentication Required</p>
              {redirectInfo}
            </div>
          )}

          {error && (
            <div className="mb-3.5 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  className="input-field pl-10 py-2 bg-muted/20 border-transparent focus:border-primary/50 focus:bg-background text-sm"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-10 pr-10 py-2 bg-muted/20 border-transparent focus:border-primary/50 focus:bg-background text-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-2.5 mt-1 font-bold shadow-lg shadow-primary/20 border-none text-sm"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => loginWithGoogle()}
              className="flex items-center justify-center gap-2.5 w-full py-2 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-xs font-medium shadow-sm"
              type="button"
            >
              <FcGoogle size={18} />
              <span>Sign in with Google</span>
            </button>
          </div>


          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don't have an account? <Link to="/register" state={location.state} className="text-primary font-bold hover:underline transition-colors">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
