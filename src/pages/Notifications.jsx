import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, deleteNotification } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { Bell, Check, ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(null); // id

  const { data: notifRes, isLoading: loading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 30, // 30 seconds
  });

  const notifications = Array.isArray(notifRes?.data) ? notifRes.data : notifRes?.data?.results || [];

  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
    },
    onError: () => toast.error("Failed to mark as read."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      setConfirmDelete(null);
      toast.success("Notification permanently removed.");
    },
    onError: (err) => {
      console.error("Notif Delete Error:", err);
      toast.error(err.response?.data?.detail || "Delete failed.");
      setConfirmDelete(null);
    },
  });

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-4xl">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <h1 className="mb-8 text-3xl font-extrabold flex items-center gap-3">
        <Bell className="text-primary w-8 h-8" /> 
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary/30">
            <Bell className="w-8 h-8" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground/60 mt-1">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div key={n.id} className={`glass-card p-6 flex items-start gap-4 transition-all hover:border-primary/30 ${n.is_read ? "opacity-60 bg-muted/20" : "border-l-4 border-l-primary"}`}>
              <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${n.is_read ? "bg-muted-foreground/30" : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"}`} />
              <div className="flex-1">
                <p className={`text-md leading-relaxed ${!n.is_read ? "font-semibold" : ""}`}>
                  {n.message || n.text || n.body}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider italic">
                    {new Date(n.created_at || n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!n.is_read && (
                  <button 
                    onClick={() => markReadMutation.mutate(n.id)} 
                    className="btn-ghost p-2 rounded-full hover:bg-primary/10 transition-colors group"
                    title="Mark as read"
                  >
                    <Check className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </button>
                )}
                <button 
                  onClick={() => setConfirmDelete(n.id)} 
                  className="btn-ghost p-2 rounded-full hover:bg-destructive/10 transition-colors group"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete)}
        isLoading={deleteMutation.isPending}
        title="Delete Notification?"
        message="Are you sure you want to remove this alert? This cannot be undone."
      />
    </div>
  );
};

export default Notifications;
