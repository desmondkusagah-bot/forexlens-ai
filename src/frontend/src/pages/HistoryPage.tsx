import { AnalysisCard } from "@/components/AnalysisCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAnalysisHistory, useDeleteAnalysis } from "@/hooks/useHistory";
import type { AnalysisSummary } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

function ConfirmDeleteDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent data-ocid="history.delete.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Delete Analysis?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body">
            This action cannot be undone. The chart analysis and all associated
            data will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            data-ocid="history.delete.cancel_button"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-ocid="history.delete.confirm_button"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { items, hasMore, loadMore, isLoading, isFetchingMore } =
    useAnalysisHistory();
  const deleteMutation = useDeleteAnalysis();
  const [pendingDelete, setPendingDelete] = useState<AnalysisSummary | null>(
    null,
  );

  const handleDelete = (e: React.MouseEvent, analysis: AnalysisSummary) => {
    e.stopPropagation();
    setPendingDelete(analysis);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
      onError: () => setPendingDelete(null),
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6" data-ocid="history.page">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl text-foreground">
          Analysis History
        </h1>
        <p className="text-muted-foreground font-body text-sm">
          Review all your past forex chart analyses.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="history.loading_state"
        >
          <LoadingSpinner size="lg" label="Loading analyses..." />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No Analyses Yet"
          description="Upload your first forex chart to get AI-powered entry, stop loss, and take-profit levels."
          actionLabel="Analyse a Chart"
          onAction={() => navigate({ to: "/analyze" })}
        />
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-ocid="history.list"
          >
            {items.map((analysis, i) => (
              <motion.div
                key={analysis.id.toString()}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.3) }}
                className="relative group"
                data-ocid={`history.item.${i + 1}`}
              >
                <AnalysisCard
                  analysis={analysis}
                  onClick={() =>
                    navigate({
                      to: "/history/$id",
                      params: { id: analysis.id.toString() },
                    })
                  }
                  index={i + 1}
                />
                {/* Delete button overlay */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, analysis)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-2 right-2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Delete analysis"
                  data-ocid={`history.delete_button.${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isFetchingMore}
                data-ocid="history.load_more_button"
              >
                {isFetchingMore ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
