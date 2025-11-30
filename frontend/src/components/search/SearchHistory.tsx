import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, X, Trash2 } from "lucide-react";
import {
  SearchService,
  type SearchHistoryItem,
} from "@/services/searchService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SearchHistoryProps {
  onSearchSelect?: (query: string) => void;
  className?: string;
}

export function SearchHistory({
  onSearchSelect,
  className,
}: SearchHistoryProps) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const items = await SearchService.getSearchHistory(20);
      setHistory(items);
    } catch (error) {
      console.error("Failed to load search history:", error);
      toast.error("Failed to load search history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearchClick = (query: string) => {
    if (onSearchSelect) {
      onSearchSelect(query);
    } else {
      navigate(`/app/search?q=${encodeURIComponent(query)}&tab=all`);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await SearchService.deleteSearchHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      toast.success("Search removed from history");
    } catch (error) {
      console.error("Failed to delete search history item:", error);
      toast.error("Failed to delete search history item");
    }
  };

  const handleClearAll = async () => {
    try {
      await SearchService.clearSearchHistory();
      setHistory([]);
      setIsClearDialogOpen(false);
      toast.success("Search history cleared");
    } catch (error) {
      console.error("Failed to clear search history:", error);
      toast.error("Failed to clear search history");
    }
  };

  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">
            Loading history...
          </div>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No search history</h3>
          <p className="text-sm text-muted-foreground">
            Your recent searches will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Recent Searches</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsClearDialogOpen(true)}
            className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>

        {/* History List */}
        <div className="divide-y">
          {history.map((item) => (
            <button
              key={item._id}
              onClick={() => handleSearchClick(item.query)}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{item.query}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteItem(item._id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </button>
          ))}
        </div>
      </Card>

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title="Clear search history?"
        description="This will permanently delete all your search history. This action cannot be undone."
        confirmLabel="Clear all"
        variant="destructive"
        onConfirm={handleClearAll}
      />
    </>
  );
}
