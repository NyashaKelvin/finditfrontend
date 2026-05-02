import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getItemDetail, createClaim, sendMessage, deleteItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";
import { MapPin, Calendar, Tag, Send, MessageSquare, ChevronLeft, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import ConfirmModal from "@/components/ConfirmModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: itemRes, isLoading: loading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => getItemDetail(id),
    staleTime: 1000 * 60 * 5, // 5 minutes for testing
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      toast.success("Post permanently removed from database.");
      navigate("/dashboard");
    },
    onError: (err) => {
      console.error("Item Delete Error:", err);
      toast.error(err.response?.data?.detail || "Could not delete. Check your permissions.");
      setConfirmDelete(false);
    }
  });

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const item = itemRes?.data;
  const [inputVal, setInputVal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner />;
  if (!item) return <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Item not found.</div>;

  const isOwner = Number(item.owner) === user?.id;
  const isAdmin = user?.is_staff || user?.is_superuser;


  const handleSendMessage = async () => {
    if (!inputVal.trim()) return;
    setSubmitting(true);
    try {
      await sendMessage({ 
        receiver: item.owner, 
        item: Number(id), 
        body: inputVal 
      });
      toast.success("Message sent to owner!");
      setInputVal("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Message failed.");
    }
    setSubmitting(false);
  };

  const handleClaim = async () => {
    setSubmitting(true);
    try {
      await createClaim({ 
        item: Number(id), 
        answer_to_question: inputVal || "Standard claim request." 
      });
      toast.success("Claim request submitted!");
      setInputVal("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Claim failed.");
    }
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {(isOwner || isAdmin) && item.status !== 'CLAIMED' && (
          <button 
            onClick={handleDelete}
            disabled={submitting}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold text-sm uppercase tracking-wider group"
          >
            <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Delete Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side: Image */}
        <div className="glass-card overflow-hidden rounded-2xl shadow-xl h-fit">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-auto object-contain max-h-[500px]" />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-muted/30 text-muted-foreground gap-3">
              <Tag size={40} className="text-muted/50" />
              <span>No image provided</span>
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="space-y-8">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              item.status === "LOST" ? "bg-red-500/10 text-red-500" : 
              item.status === "FOUND" ? "bg-green-500/10 text-green-500" : 
              "bg-primary/10 text-primary"
            }`}>
              {item.status}
            </span>
            <h1 className="text-4xl font-extrabold mt-4 tracking-tight leading-tight">{item.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoBox icon={<Tag className="w-4 h-4" />} label="Category" value={item.category} />
            <InfoBox icon={<MapPin className="w-4 h-4" />} label="Location" value={item.location} />
            <InfoBox icon={<Calendar className="w-4 h-4" />} label="Date Reported" value={new Date(item.date_spotted).toLocaleDateString()} />
          </div>

          {/* Action Area */}
          {!user ? (
            <div className="glass-card p-6 text-center border-dashed">
              <h3 className="mb-2 font-bold">Want to contact the owner?</h3>
              <p className="text-sm text-muted-foreground mb-4">You must be signed in to claim or message about this item.</p>
              <Link to="/login" state={{ from: `/items/${id}` }} className="btn-primary inline-flex items-center gap-2">
                Sign In to Continue
              </Link>
            </div>
          ) : isOwner ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/20 text-center">
                <p className="text-sm font-medium text-muted-foreground italic mb-4">
                  You are the author of this post. You can delete it or manage claims from your Inbox.
                </p>
                {item.status !== 'CLAIMED' ? (
                  <button 
                    onClick={handleDelete}
                    className="btn-secondary !bg-destructive/10 !text-destructive hover:!bg-destructive hover:!text-white w-full py-4 font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete this Post
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/5 py-3 rounded-xl border border-primary/20">
                    <CheckCircle className="w-5 h-5" />
                    This item has been Successfully Claimed
                  </div>
                )}
              </div>
            </div>
          ) : item.status === 'CLAIMED' ? (
            <div className="glass-card p-8 border-success/20 bg-success/5 text-center space-y-3">
               <div className="bg-success/20 h-12 w-12 rounded-full flex items-center justify-center mx-auto text-success mb-2">
                 <CheckCircle className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-success">Item Successfully Returned</h3>
               <p className="text-muted-foreground text-sm max-w-xs mx-auto">This item has already been claimed and returned to its owner.</p>
            </div>
          ) : (
            <div className="glass-card p-8 border-primary/20 bg-primary/5 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {item.status === "FOUND" ? "Is this yours?" : "Found this item?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.status === "FOUND" 
                    ? `Verification Question: ${item.verification_question || "Please describe the item."}`
                    : "Contact the owner to report that you've found this item."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    className="input-field min-h-[120px] bg-background pr-12 pb-10" 
                    placeholder="Type your message or verification answer..." 
                    value={inputVal} 
                    onChange={(e) => setInputVal(e.target.value)} 
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={submitting || !inputVal.trim()}
                    className="absolute right-3 bottom-3 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                    title="Send Message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <button 
                    onClick={handleClaim} 
                    className="btn-primary w-full py-4 font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20" 
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Submit Official Claim"}
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground mt-2 italic">
                    Note: An official claim allows the owner to Approve or Reject your ownership.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal 
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate(id)}
        isLoading={deleteMutation.isPending}
        title="Delete this post?"
        message="Are you sure you want to permanently remove this item from the platform? This cannot be undone."
      />
    </div>
  );
};

const InfoBox = ({ icon, label, value }) => (
  <div className="glass-card p-5 transition-all hover:bg-white/10">
    <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-1">
      <span className="text-primary">{icon}</span> {label}
    </div>
    <div className="font-bold text-lg">{value}</div>
  </div>
);

export default ItemDetail;
