import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { useEffect } from "react";

const FEATURES = [
  { icon: BarChart2, text: "GPT-4o Vision chart analysis" },
  { icon: Zap, text: "Entry, SL & 5 take-profit levels" },
  { icon: ShieldCheck, text: "Secure Internet Identity auth" },
];

export default function LoginPage() {
  const { login, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      data-ocid="login.page"
      style={{
        backgroundImage: "url('/assets/generated/forex-hero.dim_1600x900.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <Card className="p-8 border-border/60 bg-card/95 shadow-2xl space-y-7">
          {/* Logo + brand */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
                ForexLens AI
              </h1>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Professional forex chart analysis powered by AI
              </p>
            </div>
          </div>

          {/* Feature list */}
          <ul className="space-y-2.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground/80 font-body">
                  {text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={login}
              disabled={isInitializing || isLoggingIn}
              className="w-full h-11 font-display font-semibold text-base"
              data-ocid="login.submit_button"
            >
              {isInitializing
                ? "Initializing..."
                : isLoggingIn
                  ? "Opening Internet Identity..."
                  : "Sign In with Internet Identity"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center font-body">
              Secure, decentralised authentication — no password required.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
