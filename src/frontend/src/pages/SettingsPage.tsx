import { createActor } from "@/backend";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useClearOpenAIKey,
  useIsOpenAIConfigured,
  useSetOpenAIKey,
} from "@/hooks/useAnalysis";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

function ApiKeyStatusBadge({ configured }: { configured: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-medium ${
        configured
          ? "border border-primary/30 bg-primary/10 text-primary"
          : "border border-border/50 bg-muted/50 text-muted-foreground"
      }`}
      data-ocid="settings.api_key_status"
    >
      {configured ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Key configured
        </>
      ) : (
        <>
          <XCircle className="h-3.5 w-3.5" />
          Not configured
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { isFetching: actorLoading } = useActor(createActor);
  const { data: isKeyConfigured, isLoading: keyLoading } =
    useIsOpenAIConfigured();
  const setKey = useSetOpenAIKey();
  const clearKey = useClearOpenAIKey();

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const isLoading = actorLoading || keyLoading;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    await setKey.mutateAsync(apiKey.trim());
    setApiKey("");
  };

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearKey.mutateAsync();
    setConfirmClear(false);
  };

  return (
    <div className="px-6 py-8" data-ocid="settings.page">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Manage your API keys and account preferences.
        </p>
      </motion.div>

      {isLoading ? (
        <LoadingSpinner
          size="md"
          label="Loading settings..."
          className="py-20"
        />
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* OpenAI API Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-6"
            data-ocid="settings.api_key_card"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    OpenAI API Key
                  </h2>
                  <p className="font-body text-xs text-muted-foreground">
                    Required for chart analysis
                  </p>
                </div>
              </div>
              <ApiKeyStatusBadge configured={!!isKeyConfigured} />
            </div>

            {/* Why is this needed */}
            <div className="mb-5 rounded-lg border border-border/40 bg-muted/30 p-4">
              <p className="font-body text-sm text-muted-foreground">
                This app uses{" "}
                <span className="font-semibold text-foreground">
                  GPT-4o Vision
                </span>{" "}
                to analyse your forex charts and identify precise trade levels.
                Your API key is stored securely in your private canister and
                never shared.
              </p>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-body text-xs text-primary hover:underline"
                data-ocid="settings.openai_api_keys_link"
              >
                Get your API key at platform.openai.com/api-keys
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Input form */}
            <div className="space-y-3">
              <Label
                htmlFor="api-key-input"
                className="font-body text-sm font-medium text-foreground"
              >
                {isKeyConfigured ? "Replace API Key" : "Enter API Key"}
              </Label>
              <div className="relative">
                <Input
                  id="api-key-input"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="pr-10 font-mono text-sm"
                  autoComplete="off"
                  spellCheck={false}
                  data-ocid="settings.api_key_input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowKey(!showKey)}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  data-ocid="settings.toggle_key_visibility"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={!apiKey.trim() || setKey.isPending}
                  data-ocid="settings.save_key_button"
                >
                  {setKey.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Saving...
                    </span>
                  ) : (
                    "Save API Key"
                  )}
                </Button>

                {isKeyConfigured && (
                  <Button
                    type="button"
                    variant={confirmClear ? "destructive" : "outline"}
                    onClick={handleClear}
                    disabled={clearKey.isPending}
                    onBlur={() => setConfirmClear(false)}
                    className="gap-2"
                    data-ocid="settings.clear_key_button"
                  >
                    <Trash2 className="h-4 w-4" />
                    {confirmClear ? "Confirm Clear" : "Clear Key"}
                  </Button>
                )}
              </div>

              {setKey.isSuccess && (
                <p
                  className="flex items-center gap-1.5 font-body text-xs text-primary"
                  data-ocid="settings.save_key_success_state"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  API key saved and ready to use.
                </p>
              )}

              {(setKey.isError || clearKey.isError) && (
                <p
                  className="flex items-center gap-1.5 font-body text-xs text-destructive"
                  data-ocid="settings.api_key_error_state"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Operation failed. Please try again.
                </p>
              )}
            </div>
          </motion.div>

          {/* Security note */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border border-border/40 bg-muted/20 p-4"
            data-ocid="settings.security_note"
          >
            <p className="font-body text-xs leading-relaxed text-muted-foreground">
              🔒{" "}
              <span className="font-medium text-foreground">
                Your API key is private.
              </span>{" "}
              It is stored in your personal Internet Computer canister,
              encrypted and accessible only to you. It is never transmitted to
              third parties or stored in any centralised database.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
