import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getItems } from "@/lib/api";
import Spinner from "@/components/Spinner";
import ItemCard from "@/components/ItemCard";
import { Search, MapPin, Grid, ChevronLeft, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const tab = searchParams.get("tab") || "LOST";
  const setTab = (t) => setSearchParams({ tab: t }, { replace: true });

  // Debounce search to prevent unnecessary reloads while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const loadMoreRef = useRef(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['items', tab, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getItems({ 
        status: tab, 
        search: debouncedSearch, 
        page: pageParam 
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      try {
        const page = lastPage.data || lastPage;
        const results = page?.results;
        const nextUrl = page?.next;

        if (!Array.isArray(results) || results.length === 0 || !nextUrl) {
          return undefined;
        }

        const url = new URL(nextUrl);
        const nextPage = url.searchParams.get('page');
        return nextPage ? Number(nextPage) : undefined;
      } catch (err) {
        return undefined;
      }
    },
    initialPageParam: 1,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const items = data?.pages?.flatMap(page => {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    return page.results || [];
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

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Early return if loading (initial fetch)
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
          <p className="text-destructive font-bold">Error loading items. Please try again later.</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Reload Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={() => navigate("/")} 
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Browse Items</h1>
          <p className="text-muted-foreground mt-1">Found something? Lost something? Search here.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 text-muted-foreground w-5 h-5" />
          <input
            className="input-field pl-11 py-3 bg-card shadow-sm"
            placeholder={`Search ${tab.toLowerCase()} items...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 bg-muted/20 p-1 rounded-xl w-fit overflow-x-auto">
        {["LOST", "FOUND", "CLAIMED"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 transform active:scale-95 ${
              tab === t 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
              : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "LOST" ? <MapPin className="inline mr-2 w-4 h-4" /> : 
             t === "FOUND" ? <Grid className="inline mr-2 w-4 h-4" /> : 
             <CheckCircle className="inline mr-2 w-4 h-4" />}
            {t}
          </button>
        ))}
      </div>

      {items?.length === 0 ? (
        <div className="glass-card p-20 text-center rounded-3xl border-dashed">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Search size={48} className="opacity-20" />
            <p className="text-lg font-medium">No {tab.toLowerCase()} items found matching your criteria.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          
          <div ref={loadMoreRef} className="py-10 flex justify-center w-full">
            {isFetchingNextPage ? (
              <Spinner />
            ) : hasNextPage ? (
              <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading more items...</p>
            ) : items?.length > 0 ? (
              <p className="text-sm text-muted-foreground font-medium bg-muted/20 px-4 py-2 rounded-full border border-border/50 backdrop-blur-sm">No more items found.</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
