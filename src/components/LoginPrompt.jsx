import { Link, useLocation } from "react-router-dom";
import { Lock, User, ArrowRight } from "lucide-react";

const LoginPrompt = ({ message }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
      <div className="glass-card max-w-lg p-10 flex flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse-subtle">
          <Lock size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          {message || "Please sign in or create an account to access this page."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            to="/login" 
            state={{ from: location, message: message }}
            className="btn-primary flex items-center justify-center gap-2 group"
          >
            <User className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            to="/register" 
            state={{ from: location, message: message }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            Create New Account
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-muted-foreground italic">
          Help our community stay safe by verifying your identity.
        </p>
      </div>
    </div>
  );
};

export default LoginPrompt;
