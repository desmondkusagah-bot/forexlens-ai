import { Badge } from "@/components/ui/badge";
import type { TakeProfits } from "@/types";
import { Fragment } from "react";

interface TradeLevelsProps {
  entryPrice: number;
  stopLoss: number;
  takeProfits: TakeProfits;
  riskReward?: number;
  compact?: boolean;
}

function priceFormat(n: number) {
  return n.toFixed(5);
}

interface LevelRowProps {
  label: string;
  price: number;
  type: "entry" | "sl" | "tp";
  badge?: string;
  tpIndex?: number;
}

function LevelRow({ label, price, type, badge, tpIndex }: LevelRowProps) {
  const colorMap = {
    entry: "border-primary/30 bg-primary/10 text-primary",
    sl: "border-destructive/30 bg-destructive/10 text-destructive",
    tp: "border-accent/30 bg-accent/10 text-accent-foreground",
  };
  const dotMap = {
    entry: "bg-primary",
    sl: "bg-destructive",
    tp: "bg-accent",
  };

  const ocid =
    type === "tp" && tpIndex != null
      ? `trade_levels.tp.${tpIndex}`
      : `trade_levels.${type}`;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${colorMap[type]}`}
      data-ocid={ocid}
    >
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${dotMap[type]} flex-shrink-0`} />
        <span className="text-xs font-body font-medium opacity-80">
          {label}
        </span>
        {badge && (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
            {badge}
          </Badge>
        )}
      </div>
      <span className="font-mono text-sm font-semibold tracking-tight">
        {priceFormat(price)}
      </span>
    </div>
  );
}

export function TradeLevels({
  entryPrice,
  stopLoss,
  takeProfits,
  riskReward,
  compact,
}: TradeLevelsProps) {
  const tpEntries: [string, number, number][] = [
    ["TP 1", takeProfits.tp1, 1],
    ["TP 2", takeProfits.tp2, 2],
    ["TP 3", takeProfits.tp3, 3],
    ["TP 4", takeProfits.tp4, 4],
    ["TP 5", takeProfits.tp5, 5],
  ];

  if (compact) {
    return (
      <div
        className="grid grid-cols-2 gap-1.5 text-xs"
        data-ocid="trade_levels.compact"
      >
        <div className="font-body text-muted-foreground">Entry</div>
        <div className="font-mono text-right text-primary font-semibold">
          {priceFormat(entryPrice)}
        </div>
        <div className="font-body text-muted-foreground">SL</div>
        <div className="font-mono text-right text-destructive font-semibold">
          {priceFormat(stopLoss)}
        </div>
        {tpEntries.slice(0, 3).map(([label, price, idx]) => (
          <Fragment key={idx}>
            <div className="font-body text-muted-foreground">{label}</div>
            <div className="font-mono text-right text-accent-foreground font-semibold">
              {priceFormat(price)}
            </div>
          </Fragment>
        ))}
        {riskReward != null && (
          <>
            <div className="font-body text-muted-foreground">R:R</div>
            <div className="font-mono text-right text-foreground font-semibold">
              {riskReward.toFixed(2)}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5" data-ocid="trade_levels">
      <LevelRow
        label="Entry Point"
        price={entryPrice}
        type="entry"
        badge="BUY/SELL"
      />
      <LevelRow label="Stop Loss" price={stopLoss} type="sl" />
      {tpEntries.map(([label, price, idx]) => (
        <LevelRow
          key={idx}
          label={label}
          price={price}
          type="tp"
          tpIndex={idx}
        />
      ))}
      {riskReward != null && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/40 bg-muted/30 mt-2">
          <span className="text-xs font-body text-muted-foreground">
            Risk / Reward Ratio
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {riskReward.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
