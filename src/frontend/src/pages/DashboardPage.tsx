import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAnalysisHistory } from "@/hooks/useHistory";
import { useNavigate } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { BarChart2, History, ScanSearch, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const QUICK_ACTIONS = [
  {
    icon: ScanSearch,
    title: "New Analysis",
    description:
      "Upload a forex chart image for AI-powered analysis with entry, SL & TP levels.",
    href: "/analyze",
    primary: true,
  },
  {
    icon: History,
    title: "View History",
    description: "Browse your past chart analyses and trade setups.",
    href: "/history",
    primary: false,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    items: analyses,
    total,
    isLoading: historyLoading,
  } = useAnalysisHistory();

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto" data-ocid="dashboard.page">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-body text-sm">
          Welcome to ForexLens AI — your intelligent trading chart analysis
          platform.
        </p>
      </div>

      {/* Stats overview row */}
      {(() => {
        const avgRR =
          analyses.length > 0
            ? analyses.reduce((sum, a) => sum + a.riskReward, 0) /
              analyses.length
            : null;
        const lastAnalysis =
          analyses.length > 0
            ? formatDistanceToNow(
                new Date(Number(analyses[0].createdAt) / 1_000_000),
                { addSuffix: true },
              )
            : null;
        const stats = [
          {
            label: "Total Analyses",
            value: historyLoading ? "…" : String(total),
            icon: BarChart2,
            color: "text-primary",
          },
          {
            label: "Avg. Risk/Reward",
            value: historyLoading
              ? "…"
              : avgRR !== null
                ? `${avgRR.toFixed(2)}R`
                : "—",
            icon: TrendingUp,
            color: "text-accent",
          },
          {
            label: "Last Analysis",
            value: historyLoading ? "…" : (lastAnalysis ?? "—"),
            icon: History,
            color: "text-muted-foreground",
          },
        ];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <Card
                key={label}
                className="p-4 flex items-center gap-3"
                data-ocid={`dashboard.stat.${label.toLowerCase().replace(/[^a-z]/g, "_")}`}
              >
                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body">
                    {label}
                  </p>
                  <p className="text-xl font-display font-bold text-foreground truncate">
                    {value}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        );
      })()}

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-semibold text-base text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.href}
                className={`p-5 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-card/80 ${
                  action.primary ? "border-primary/20 bg-primary/5" : ""
                }`}
                onClick={() => navigate({ to: action.href })}
                data-ocid={`dashboard.action.${i + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      action.primary
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-muted/50 border border-border"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${action.primary ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant={action.primary ? "default" : "outline"}
                    className="w-full"
                    data-ocid={`dashboard.action.${i + 1}.button`}
                    type="button"
                  >
                    {action.title}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Risk/Reward Trend Chart */}
      <div data-ocid="dashboard.rr_trend_section">
        <h2 className="font-display font-semibold text-base text-foreground mb-3">
          Risk/Reward Trend
        </h2>
        <Card className="p-5">
          {analyses.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="dashboard.rr_trend.empty_state"
            >
              <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-body">
                No trade history yet
              </p>
              <p className="text-xs text-muted-foreground/60 font-body mt-1">
                Complete your first analysis to see trends here.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={[...analyses]
                  .sort((a, b) => Number(a.createdAt) - Number(b.createdAt))
                  .map((a) => ({
                    date: format(
                      new Date(Number(a.createdAt) / 1_000_000),
                      "MMM d",
                    ),
                    rr: Number.parseFloat(a.riskReward.toFixed(2)),
                  }))}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                    fontFamily: "var(--font-body)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                    fontFamily: "var(--font-body)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}R`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                  }}
                  labelStyle={{ color: "oklch(var(--muted-foreground))" }}
                  formatter={(value: number) => [`${value}R`, "Risk/Reward"]}
                />
                <ReferenceLine
                  y={1}
                  stroke="oklch(var(--destructive))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: "1R",
                    fill: "oklch(var(--destructive))",
                    fontSize: 10,
                    fontFamily: "var(--font-body)",
                  }}
                />
                <ReferenceLine
                  y={2}
                  stroke="oklch(var(--accent))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: "2R target",
                    fill: "oklch(var(--accent))",
                    fontSize: 10,
                    fontFamily: "var(--font-body)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rr"
                  stroke="oklch(var(--primary))"
                  strokeWidth={2}
                  fill="url(#rrGradient)"
                  dot={{ r: 3, fill: "oklch(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Getting started */}
      <Card
        className="p-5 border-primary/20 bg-primary/5"
        data-ocid="dashboard.getting_started"
      >
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground text-sm">
              Get Started
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
              Upload a chart screenshot from MT4, MT5, TradingView, or any
              platform. Our AI will identify the trend, calculate entry price,
              stop loss, and 5 take-profit levels.
            </p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => navigate({ to: "/analyze" })}
              data-ocid="dashboard.getting_started.cta"
            >
              Analyze Your First Chart
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
