import { useState } from "react";
import Spinner from "@/components/Spinner";
import { useNavigate } from "react-router-dom";
import { createItem } from "@/lib/api";
import { Upload, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const PostItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "LOST",
    location: "",
    date_spotted: "",
    verification_question: ""
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.location || !form.date_spotted) {
      setError("Please fill all required fields.");
      toast.error("Missing required fields");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "") fd.append(k, v);
    });
    if (image) fd.append("image", image);
    
    try {
      const res = await createItem(fd);
      toast.success(`Item "${res.data.title}" posted successfully!`);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const data = err.response?.data;
      const detail = data ? (typeof data === 'string' ? data : Object.values(data).flat().join(" ")) : "Failed to post item.";
      setError(detail);
      toast.error(detail);
    }
    setLoading(false);
  };

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Discard & Exit
      </button>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Post Lost or Found Item</h1>
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <input className="input-field" placeholder="e.g. Blue Wallet" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category *</label>
            <select className="input-field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Select Category</option>
              {["PERSONAL", "ELECTRONICS", "DOCUMENTS", "CLOTHING", "ACADEMIC", "VALUABLE", "MISC"].map(c => (
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description *</label>
          <textarea className="input-field min-h-[100px]" placeholder="Detailed description of the item..." value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Date *</label>
            <input type="datetime-local" className="input-field" value={form.date_spotted} onChange={(e) => set("date_spotted", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Location *</label>
          <input className="input-field" placeholder="Where was it lost or found?" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>

        {form.status === "FOUND" && (
          <div>
            <label className="text-sm font-medium mb-1 block">Verification Question (Optional)</label>
            <input className="input-field" placeholder="e.g. What is written inside the wallet?" value={form.verification_question} onChange={(e) => set("verification_question", e.target.value)} />
            <p className="text-[10px] text-muted-foreground mt-1 italic">Someone claiming this item must answer this question to prove ownership.</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-1 block">Photo Evidence</label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors bg-card/50">
            <Upload className="text-primary w-5 h-5" />
            <span className="text-sm text-muted-foreground">{image ? image.name : "Click to upload image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </label>
        </div>

        <button type="submit" className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20" disabled={loading}>
          {loading ? <><Spinner className="inline py-0 mr-2 h-5 w-5" /> Posting...</> : "Submit Post"}
        </button>
      </form>
    </div>
  );
};

export default PostItem;
