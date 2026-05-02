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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center px-4 animate-fade-in relative py-12">
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
              <UserPlus size={28} />
            </div>
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-sm text-muted-foreground mt-2">Join the FindIt community today</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-semibold ml-1">{f.label}</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                    {f.icon}
                  </div>
                  <input
                    type={f.key === "password" ? (showPassword ? "text" : "password") : f.type}
                    className={`input-field pl-11 bg-muted/20 border-transparent focus:border-primary/50 focus:bg-background ${f.key === "password" ? "pr-12" : ""}`}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                  {f.key === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="submit" 
              className="btn-primary w-full py-3 mt-4 font-bold shadow-lg shadow-primary/20 border-none"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" state={location.state} className="text-primary font-bold hover:underline transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
