import { useAuth } from "@/contexts/AuthContext";
import LoginPrompt from "@/components/LoginPrompt";
import Spinner from "@/components/Spinner";

const ProtectedRoute = ({ children, message = "Please login in or sign up to post or view other pages" }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Spinner size="lg" /></div>;
  }

  if (!token) {
    // Show the login prompt right here on the page instead of redirecting
    return <LoginPrompt message={message} />;
  }

  return children;
};

export default ProtectedRoute;
