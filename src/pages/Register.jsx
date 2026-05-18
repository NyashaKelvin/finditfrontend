import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, ChevronLeft, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const { register, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    phone_number: "" 
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const redirectInfo = location.state?.message;

  useEffect(() => {
    if (token) {
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.email || !form.password || !form.phone_number) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await register(form);
      navigate("/login", { state: location.state });
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? (typeof data === 'string' ? data : Object.values(data).flat().join(" ")) : (err.message || "Registration failed.");
      setError(msg);
    }
  };

  const fields = [
    { key: "username", label: "Username", type: "text", placeholder: "johndoe", icon: <User className="w-4.5 h-4.5" /> },
    { key: "email", label: "Email", type: "email", placeholder: "john@example.com", icon: <Mail className="w-4.5 h-4.5" /> },
    { key: "phone_number", label: "Phone Number", type: "tel", placeholder: "+1234567890", icon: <Phone className="w-4.5 h-4.5" /> },
    { key: "password", label: "Password", type: "password", placeholder: "••••••••", icon: <Lock className="w-4.5 h-4.5" /> }
  ];

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
              <UserPlus size={22} />
            </div>
            <h2 className="text-xl font-bold">Create Account</h2>
            <p className="text-xs text-muted-foreground mt-1">Join the FindIt community today</p>
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

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-semibold ml-1">{f.label}</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 text-muted-foreground pointer-events-none">
                    {f.icon}
                  </div>
                  <input
                    type={f.key === "password" ? (showPassword ? "text" : "password") : f.type}
                    className={`input-field pl-10 py-2 bg-muted/20 border-transparent focus:border-primary/50 focus:bg-background text-sm ${f.key === "password" ? "pr-10" : ""}`}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                  {f.key === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="submit" 
              className="btn-primary w-full py-2.5 mt-2 font-bold shadow-lg shadow-primary/20 border-none text-sm"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" state={location.state} className="text-primary font-bold hover:underline transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
