import { TradeLevels } from "@/components/TradeLevels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnalysisSummary } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { BarChart2, Clock, TrendingUp } from "lucide-react";

interface AnalysisCardProps {
  analysis: AnalysisSummary;
  onClick?: () => void;
  index?: number;
}

export function AnalysisCard({ analysis, onClick, index }: AnalysisCardProps) {
  const ocidIndex = index != null ? `.${index}` : "";
  const createdAt = Number(analysis.createdAt) / 1_000_000;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const rrColor =
    analysis.riskReward >= 2
      ? "text-primary"
      : analysis.riskReward >= 1
        ? "text-accent"
        : "text-destructive";

  return (
    <Card
      className="group cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-all duration-200 overflow-hidden"
      onClick={onClick}
      data-ocid={`analysis.item${ocidIndex}`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-sm text-foreground truncate">
                {analysis.platform ?? "Forex Chart"}
              </p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{timeAgo}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={`text-sm font-mono font-bold ${rrColor}`}>
              {analysis.riskReward.toFixed(2)}
            </span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
              R:R
            </Badge>
          </div>
        </div>

        {/* Trade levels (compact) */}
        <TradeLevels
          entryPrice={analysis.entryPrice}
          stopLoss={analysis.stopLoss}
          takeProfits={analysis.takeProfits}
          compact
        />
      </div>
    </Card>
  );
}
