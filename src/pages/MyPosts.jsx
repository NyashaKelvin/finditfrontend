import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getItems } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";
import ItemCard from "@/components/ItemCard";
import { Search, Package, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['my-items', user?.id, debouncedSearch],
    queryFn: ({ pageParam = 1 }) => getItems({ 
      owner: user?.id, 
      search: debouncedSearch, 
      page: pageParam 
    }),
    getNextPageParam: (lastPage) => {
      try {
        const pageData = lastPage?.data;
        if (!pageData || Array.isArray(pageData) || !pageData.results) {
          return undefined;
        }

        const nextUrl = pageData.next;
        const results = pageData.results;

        if (!nextUrl || (Array.isArray(results) && results.length === 0)) {
          return undefined;
        }

        const url = new URL(nextUrl);
        const page = url.searchParams.get('page');
        return page ? Number(page) : undefined;
      } catch {
        return undefined;
      }
    },
    initialPageParam: 1,
    enabled: !!user?.id,
  });

  const items = data?.pages?.flatMap(page => {
    const pageData = page?.data;
    if (!pageData) return [];
    return Array.isArray(pageData) ? pageData : (pageData.results || []);
  }) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Early return if loading
  if (isLoading && !data) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  // Early return if error
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="glass-card p-10 rounded-2xl">
          <p className="text-destructive font-bold">Error loading your posts. Please try again later.</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Reload Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-7xl">
       <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Posts</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage and track items you've reported.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 text-muted-foreground w-5 h-5" />
          <input
            className="input-field pl-11 py-3 bg-card shadow-sm border-transparent focus:border-primary/50"
            placeholder="Search within your posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {items?.length === 0 ? (
        <div className="glass-card p-24 text-center border-dashed border-2 flex flex-col items-center gap-6">
          <div className="p-6 bg-primary/5 rounded-full">
             <Package size={64} className="text-primary/20" />
          </div>
          <div>
            <p className="text-2xl font-bold">You haven't posted any items yet.</p>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Report items you've lost or found to see them listed here.</p>
          </div>
          <button onClick={() => navigate("/post-item")} className="btn-primary px-8">Report an Item Now</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          
          <div ref={loadMoreRef} className="py-16 flex justify-center w-full">
            {isFetchingNextPage ? (
              <Spinner />
            ) : hasNextPage ? (
              <p className="text-sm text-muted-foreground animate-pulse font-bold tracking-widest uppercase">Fetching more items...</p>
            ) : items?.length > 0 ? (
              <div className="h-[1px] w-32 bg-border-500/20" />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default MyPosts;
