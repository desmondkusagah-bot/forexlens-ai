import { createActor } from "@/backend";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TradeLevels } from "@/components/TradeLevels";
import { Button } from "@/components/ui/button";
import { useAnalyzeChart, useIsOpenAIConfigured } from "@/hooks/useAnalysis";
import type { Analysis } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  History,
  ImageIcon,
  RefreshCw,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "MT4", label: "MetaTrader 4" },
  { value: "MT5", label: "MetaTrader 5" },
  { value: "TradingView", label: "TradingView" },
  { value: "Other", label: "Other Platform" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function NoApiKeyBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4"
      data-ocid="analyze.no_api_key_banner"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
      <div className="flex-1">
        <p className="font-display text-sm font-semibold text-foreground">
          OpenAI API Key Required
        </p>
        <p className="mt-0.5 font-body text-xs text-muted-foreground">
          You need to configure your OpenAI API key before running chart
          analysis.
        </p>
      </div>
      <Link to="/settings" data-ocid="analyze.settings_link">
        <Button variant="outline" size="sm" className="flex-shrink-0 gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          Configure Key
        </Button>
      </Link>
    </motion.div>
  );
}

function UploadZone({
  onFile,
  preview,
  onClear,
  disabled,
}: {
  onFile: (file: File) => void;
  preview: string | null;
  onClear: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border/50">
        <img
          src={preview}
          alt="Uploaded chart"
          className="h-full w-full object-contain"
          style={{ maxHeight: "480px" }}
        />
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove image"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-md transition-colors hover:bg-destructive hover:text-destructive-foreground"
            data-ocid="analyze.clear_image_button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="Upload chart image"
      className={`flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/50 hover:border-primary/50 hover:bg-primary/3"
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      data-ocid="analyze.dropzone"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
        <Upload className="h-7 w-7 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-foreground">
          Drop your chart here
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          PNG, JPG, or WEBP · Max 10MB
        </p>
      </div>
      <span
        className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5 font-body text-sm font-medium text-foreground shadow-sm transition-colors"
        aria-hidden="true"
      >
        <ImageIcon className="h-4 w-4" />
        Select chart file
      </span>
      <input
        ref={inputRef}
        id="chart-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </button>
  );
}

function PlatformSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      id="platform-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-lg border border-input bg-card px-3 py-2.5 font-body text-sm text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
      data-ocid="analyze.platform_select"
    >
      {PLATFORMS.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}

export default function AnalyzePage() {
  const { isFetching: actorLoading } = useActor(createActor);
  const { data: isKeyConfigured, isLoading: keyLoading } =
    useIsOpenAIConfigured();
  const analyzeChart = useAnalyzeChart();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState("TradingView");
  const [result, setResult] = useState<Analysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 10MB");
      return;
    }
    const base64 = await fileToBase64(file);
    setImagePreview(base64);
    setResult(null);
    setAnalyzeError(null);
  }, []);

  const handleClear = useCallback(() => {
    setImagePreview(null);
    setResult(null);
    setAnalyzeError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imagePreview) return;
    setAnalyzeError(null);
    try {
      const analysis = await analyzeChart.mutateAsync({
        imageKey: imagePreview,
        imageUrl: imagePreview,
        platform: platform || undefined,
      });
      setResult(analysis);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      if (msg === "NO_API_KEY") {
        setAnalyzeError(
          "OpenAI API key is not configured. Please go to Settings to add your key.",
        );
      } else {
        setAnalyzeError(msg);
      }
    }
  }, [imagePreview, platform, analyzeChart]);

  const isLoading = actorLoading || keyLoading;

  return (
    <div className="px-6 py-8" data-ocid="analyze.page">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          New Analysis
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Upload a forex chart image and get AI-powered trade levels instantly.
        </p>
      </motion.div>

      {isLoading ? (
        <LoadingSpinner size="md" label="Connecting..." className="py-20" />
      ) : (
        <>
          {!isKeyConfigured && <NoApiKeyBanner />}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upload + Platform panel */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="space-y-4 rounded-xl border border-border/50 bg-card p-5"
              data-ocid="analyze.upload_panel"
            >
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Chart Upload
                </h2>
              </div>

              <UploadZone
                onFile={handleFile}
                preview={imagePreview}
                onClear={handleClear}
                disabled={analyzeChart.isPending}
              />

              {imagePreview && !result && (
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="platform-selector"
                      className="mb-1.5 block font-body text-xs font-medium text-muted-foreground"
                    >
                      Trading Platform
                    </label>
                    <PlatformSelector value={platform} onChange={setPlatform} />
                  </div>

                  {analyzeError && (
                    <div
                      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
                      data-ocid="analyze.error_state"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                      <div className="flex-1">
                        <p className="font-body text-xs text-destructive">
                          {analyzeError}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnalyzeError(null)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Dismiss error"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={analyzeChart.isPending || !isKeyConfigured}
                    data-ocid="analyze.submit_button"
                  >
                    {analyzeChart.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analysing chart...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyse Chart
                      </>
                    )}
                  </Button>

                  {analyzeChart.isPending && (
                    <p
                      className="text-center font-body text-xs text-muted-foreground"
                      data-ocid="analyze.loading_state"
                    >
                      GPT-4o is reading your chart — this may take 15–30
                      seconds.
                    </p>
                  )}
                </div>
              )}

              {result && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleClear}
                  data-ocid="analyze.new_analysis_button"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Analyse a New Chart
                </Button>
              )}
            </motion.div>

            {/* Results panel (right column, visible before analysis too) */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-xl border border-border/50 bg-card p-5"
              data-ocid="analyze.results_panel"
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Analysis Results
                </h2>
              </div>

              {analyzeChart.isPending ? (
                <LoadingSpinner
                  size="lg"
                  label="GPT-4o is analysing your chart..."
                  className="py-16"
                />
              ) : result ? (
                <TradeLevels
                  entryPrice={result.entryPrice}
                  stopLoss={result.stopLoss}
                  takeProfits={result.takeProfits}
                  riskReward={result.riskReward}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  data-ocid="analyze.results.empty_state"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-display font-semibold text-foreground">
                    No analysis yet
                  </p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    Upload a chart and click Analyse to see results here.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Full-width results section after analysis */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-6 space-y-5"
              data-ocid="analyze.full_results"
            >
              {/* AI Summary */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Analysis Summary
                  </h2>
                </div>
                <p
                  className="font-body text-sm leading-relaxed text-foreground"
                  data-ocid="analyze.summary_text"
                >
                  {result.summary}
                </p>
              </div>

              {/* History CTA */}
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Analysis saved to history
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    View all past analyses in your history.
                  </p>
                </div>
                <Link to="/history" data-ocid="analyze.history_link">
                  <Button size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    View History
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
