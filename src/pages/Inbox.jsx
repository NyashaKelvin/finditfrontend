import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClaims, approveClaim, rejectClaim, getMessages, sendMessage, markMessageRead, deleteClaim, deleteMessage } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { CheckCircle, XCircle, Send, MessageCircle, ChevronLeft, Check, CheckCheck, Reply, X, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import ConfirmModal from "@/components/ConfirmModal";

const Inbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("claims");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id }

  const { data: claimsRes, isLoading: claimsLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: getClaims,
    refetchInterval: 10000, // Live updates every 10s
  });

  const { data: msgsRes, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: getMessages,
    refetchInterval: 10000, // Live updates every 10s
  });

  const claims = Array.isArray(claimsRes?.data) ? claimsRes.data : claimsRes?.data?.results || [];
  const messages = Array.isArray(msgsRes?.data) ? msgsRes.data : msgsRes?.data?.results || [];

  const unreadMessagesCount = messages.filter(m => Number(m.receiver) === user?.id && !m.is_read).length;
  const unreadClaimsCount = claims.filter(c => Number(c.item_owner) === user?.id && (!c.status || c.status === 'PENDING')).length;

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => type === 'claim' ? deleteClaim(id) : deleteMessage(id),
    onMutate: async ({ type, id }) => {
      const queryKey = type === 'claim' ? ['claims'] : ['messages'];
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old) => {
        const currentData = Array.isArray(old?.data) ? old.data : old?.data?.results || [];
        const filtered = currentData.filter(item => item.id !== id);
        // Match the structure (handle both direct array and DRF results wrapper)
        return old?.data?.results ? { ...old, data: { ...old.data, results: filtered } } : { ...old, data: filtered };
      });
      // Return a context object with the snapshotted value
      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      console.error("Delete Error:", err);
      // Rollback
      if (context?.previousData) {
        const queryKey = variables.type === 'claim' ? ['claims'] : ['messages'];
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(err.response?.data?.detail || "Delete failed. You might not have permission.");
      setConfirmDelete(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      setConfirmDelete(null);
      toast.success("Record permanently removed.");
    },
    onSettled: (data, error, variables) => {
      const queryKey = variables.type === 'claim' ? ['claims'] : ['messages'];
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Automatically mark received messages as read when viewing the tab
  useEffect(() => {
    if (tab === "messages" && messages.length > 0) {
      const unreadReceived = messages.filter(m => Number(m.receiver) === user?.id && !m.is_read);
      if (unreadReceived.length > 0) {
        Promise.all(unreadReceived.map(m => markMessageRead(m.id)))
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
          });
      }
    }
  }, [tab, messages, user?.id, queryClient]);

  const claimActionMutation = useMutation({
    mutationFn: ({ id, action }) => action === "approve" ? approveClaim(id) : rejectClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      toast.success("Action completed.");
    }
  });

  const sendReplyMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: async (_, variables) => {
      // Find the original message we replied to and mark it as read if needed
      // Actually, we already have replyTarget in state
      if (replyTarget && !replyTarget.is_read) {
        await markMessageRead(replyTarget.id);
      }
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      setReplyTarget(null);
      setReplyBody("");
      toast.success("Reply sent & conversation updated.");
    },
    onError: () => toast.error("Failed to send reply.")
  });

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyTarget || !replyBody.trim()) return;
    const receiverId = Number(replyTarget.sender) === user?.id ? Number(replyTarget.receiver) : Number(replyTarget.sender);
    sendReplyMutation.mutate({ 
      receiver: receiverId, 
      item: replyTarget.item || null, 
      body: replyBody 
    });
  };

  if (claimsLoading || msgsLoading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-5xl">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your claims and messages.</p>
        </div>
        <div className="flex rounded-full border border-border bg-muted/30 p-1">
          <button
            onClick={() => setTab("claims")}
            className={`relative px-8 py-2 rounded-full text-sm font-bold capitalize transition-all ${tab === "claims" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
          >
            Claims
            {unreadClaimsCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground border-2 border-background font-bold">{unreadClaimsCount}</span>}
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`relative px-8 py-2 rounded-full text-sm font-bold capitalize transition-all ${tab === "messages" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
          >
            Messages
            {unreadMessagesCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground border-2 border-background font-bold">{unreadMessagesCount}</span>}
          </button>
        </div>
      </div>

      {tab === "claims" && (
        <div className="grid grid-cols-1 gap-4">
          {claims.length === 0 ? (
            <div className="glass-card p-16 text-center text-muted-foreground border-dashed">
              No claim requests yet.
            </div>
          ) : (
            claims.map((c) => {
              const isOwner = Number(c.item_owner) === user?.id;
              const isRequester = Number(c.requester) === user?.id;
              
              return (
                <div key={c.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 border-l-4 border-l-transparent hover:border-l-primary transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="font-bold text-lg">Claim #{c.id}</span>
                       {isRequester && <span className="text-[10px] bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-tighter">My Request</span>}
                       {isOwner && <span className="text-[10px] bg-secondary text-secondary-foreground font-bold px-3 py-1 rounded-full uppercase tracking-tighter">To Review</span>}
                    </div>
                    <div className="text-lg font-medium">Item: {c.item_title}</div>
                    <div className="bg-muted/30 p-4 rounded-lg mt-3 text-sm italic border border-border/50">
                      &ldquo;{c.answer_to_question}&rdquo;
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        c.status === "APPROVED" ? "bg-success/20 text-success" : 
                        c.status === "REJECTED" ? "bg-destructive/20 text-destructive" : 
                        "bg-warning/20 text-warning"
                      }`}>
                        {c.status || "PENDING"}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    {isOwner && (!c.status || c.status === "PENDING") && (
                      <>
                        <button 
                          onClick={() => claimActionMutation.mutate({ id: c.id, action: "approve" })} 
                          className="btn-primary flex items-center justify-center gap-2 text-sm px-6 py-2.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button 
                          onClick={() => claimActionMutation.mutate({ id: c.id, action: "reject" })} 
                          className="btn-secondary !bg-destructive/10 !text-destructive !border-destructive/20 hover:!bg-destructive hover:!text-white flex items-center justify-center gap-2 text-sm px-6 py-2.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {c.status !== "APPROVED" && (
                      <button 
                        onClick={() => setConfirmDelete({ type: 'claim', id: c.id })}
                        className="p-2.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center"
                        title="Delete Claim"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "messages" && (
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted-foreground opacity-50">
              No conversations found.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isSender = Number(m.sender) === user?.id;
                const isUnread = !isSender && !m.is_read;
                
                return (
                  <div key={m.id} className={`glass-card p-5 transition-all group ${isUnread ? "bg-primary/5 border-l-4 border-l-primary" : "opacity-80"}`}>
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-2">
                          <span className={`text-sm tracking-wide uppercase font-bold ${isUnread ? "text-primary" : "text-muted-foreground"}`}>
                            {isSender ? `To: ${m.receiver_username || `UID ${m.receiver}`}` : `From: ${m.sender_username || `UID ${m.sender}`}`}
                          </span>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] font-medium text-muted-foreground italic">
                           {new Date(m.created_at || m.timestamp).toLocaleString()}
                         </span>
                         {isSender && (
                           <div className="flex items-center" title={m.is_read ? "Seen by recipient" : "Delivered"}>
                             {m.is_read ? <CheckCheck className="w-4 h-4 text-primary" /> : <Check className="w-4 h-4 text-muted-foreground/40" />}
                           </div>
                         )}
                       </div>
                    </div>
                    <p className={`text-md leading-relaxed mb-4 ${isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {m.body}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-3 border-t border-border/20">
                      {!isSender && !m.is_read && (
                        <button 
                          onClick={() => markMessageRead(m.id).then(() => {
                            queryClient.invalidateQueries({ queryKey: ["messages"] });
                            queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
                          })}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                           <Check className="w-4 h-4" /> Mark Read
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          setReplyTarget(m);
                          // Mark as read immediately when opening the reply modal for better UX
                          if (!isSender && !m.is_read) {
                            markMessageRead(m.id).then(() => {
                              queryClient.invalidateQueries({ queryKey: ["messages"] });
                              queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
                            });
                          }
                        }}
                        className="text-xs text-muted-foreground font-bold hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-wider"
                      >
                          <Reply className="w-4 h-4" /> Reply
                      </button>

                      <button 
                        onClick={() => setConfirmDelete({ type: 'message', id: m.id })}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setReplyTarget(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Reply className="w-5 h-5 text-primary" /> 
              Reply to {replyTarget.sender_username || `User ${replyTarget.sender}`}
            </h3>
            
            <div className="bg-muted/30 p-3 rounded-lg mb-4 text-sm italic text-muted-foreground border-l-2 border-primary/30">
              "{replyTarget.body.length > 100 ? replyTarget.body.substring(0, 100) + '...' : replyTarget.body}"
            </div>
            
            <form onSubmit={handleSendReply} className="space-y-4">
              <textarea 
                autoFocus
                className="input-field bg-background min-h-[150px] w-full resize-none" 
                placeholder="Type your reply here..." 
                value={replyBody} 
                onChange={(e) => setReplyBody(e.target.value)} 
              />
              <button 
                type="submit" 
                disabled={sendReplyMutation.isPending || !replyBody.trim()}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                {sendReplyMutation.isPending ? "Sending..." : <><Send className="w-4 h-4" /> Send Reply</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete)}
        isLoading={deleteMutation.isPending}
        title={`Delete ${confirmDelete?.type || 'Record'}?`}
        message={`Are you sure you want to remove this ${confirmDelete?.type || 'item'}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Inbox;

