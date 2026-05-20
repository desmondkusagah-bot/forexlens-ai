import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TradeLevels } from "@/components/TradeLevels";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLivePrice, useUpdateNotes } from "@/hooks/useAnalysis";
import { useAnalysis, useDeleteAnalysis } from "@/hooks/useHistory";
import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  Bot,
  Clock,
  Pencil,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

function formatTimestamp(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  return format(new Date(ms), "MMM d, yyyy 'at' h:mm a");
}

export default function HistoryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/protected/history/$id" });
  const analysisId = id ? BigInt(id) : null;

  const { data: analysis, isLoading, isError } = useAnalysis(analysisId);
  const deleteMutation = useDeleteAnalysis();
  const updateNotesMutation = useUpdateNotes();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState("");

  // Extract currency pair from summary text
  const currencyPair = analysis?.summary
    ? (analysis.summary
        .match(/\b([A-Z]{3}[\/]?[A-Z]{3})\b/)?.[1]
        ?.replace("/", "") ?? "")
    : "";

  const livePriceQuery = useLivePrice(currencyPair);

  // Sync notes state when analysis loads
  useEffect(() => {
    if (analysis) setNotes(analysis.notes ?? "");
  }, [analysis, analysis?.notes]);

  const handleSaveNotes = () => {
    if (!analysis) return;
    updateNotesMutation.mutate({ id: analysis.id, notes });
  };

  const handleDelete = () => {
    if (!analysis) return;
    deleteMutation.mutate(analysis.id, {
      onSuccess: () => navigate({ to: "/history" }),
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-24"
        data-ocid="history_detail.loading_state"
      >
        <LoadingSpinner size="lg" label="Loading analysis..." />
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div
        className="p-6 max-w-4xl mx-auto space-y-4"
        data-ocid="history_detail.error_state"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/history" })}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="history_detail.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <Card className="p-8 flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display font-semibold text-foreground text-lg">
              Analysis Not Found
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              This analysis may have been deleted or doesn't exist.
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/history" })}
            data-ocid="history_detail.back_to_history_button"
          >
            Back to History
          </Button>
        </Card>
      </div>
    );
  }

  const imageUrl = analysis.imageKey.startsWith("data:")
    ? analysis.imageKey
    : `/api/v1/object/${analysis.imageKey}`;

  return (
    <div
      className="p-6 max-w-5xl mx-auto space-y-6"
      data-ocid="history_detail.page"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/history" })}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="history_detail.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          disabled={deleteMutation.isPending}
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          data-ocid="history_detail.delete_button"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      {/* Metadata strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 flex-wrap"
        data-ocid="history_detail.metadata"
      >
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-foreground">
              {analysis.platform ?? "Forex Chart"}
            </h1>
            {analysis.platform && (
              <Badge variant="outline" className="text-xs">
                {analysis.platform}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-body">
              {formatTimestamp(analysis.createdAt)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main layout: chart + levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart image */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card
            className="overflow-hidden"
            data-ocid="history_detail.chart_panel"
          >
            <div className="px-4 pt-4 pb-2 border-b border-border/40">
              <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Original Chart
              </p>
            </div>
            <div className="bg-muted/20 aspect-video flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl}
                alt="Forex chart analysis"
                className="w-full h-full object-contain"
                data-ocid="history_detail.chart_image"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Trade levels */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Card
            className="p-4 space-y-4"
            data-ocid="history_detail.levels_panel"
          >
            <div className="border-b border-border/40 pb-3">
              <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Trade Levels
              </p>
            </div>
            <TradeLevels
              entryPrice={analysis.entryPrice}
              stopLoss={analysis.stopLoss}
              takeProfits={analysis.takeProfits}
              riskReward={analysis.riskReward}
            />
          </Card>
        </motion.div>
      </div>

      {/* Live Price Feed */}
      {currencyPair && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
        >
          <Card
            className="p-4 border-amber-500/30 bg-amber-500/5"
            data-ocid="history_detail.live_price_panel"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Wifi className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                    Live Price
                  </p>
                  <p className="text-sm font-display font-semibold text-amber-400">
                    {currencyPair}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {livePriceQuery.isLoading && (
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                )}
                {livePriceQuery.data != null ? (
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span
                        className="font-display font-bold text-lg text-foreground"
                        data-ocid="history_detail.live_price_value"
                      >
                        {livePriceQuery.data.toFixed(5)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      Updated {format(new Date(), "h:mm:ss a")}
                    </p>
                  </div>
                ) : livePriceQuery.isError ||
                  (!livePriceQuery.isLoading &&
                    livePriceQuery.data === null) ? (
                  <div
                    className="flex items-center gap-1.5 text-muted-foreground"
                    data-ocid="history_detail.live_price_unavailable"
                  >
                    <WifiOff className="h-3.5 w-3.5" />
                    <span className="text-xs font-body">Price unavailable</span>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Summary */}
      {analysis.summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <Card className="p-5" data-ocid="history_detail.summary_panel">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                  AI Analysis Summary
                </p>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* My Notes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
      >
        <Card className="p-5" data-ocid="history_detail.notes_panel">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border flex items-center justify-center flex-shrink-0">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
              My Notes
            </p>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your trade notes, thoughts, or observations here…"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            data-ocid="history_detail.notes_textarea"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={updateNotesMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-body font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              data-ocid="history_detail.notes_save_button"
            >
              {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmDelete}>
        <AlertDialogContent data-ocid="history_detail.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Analysis?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete this chart analysis. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmDelete(false)}
              data-ocid="history_detail.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="history_detail.delete.confirm_button"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
