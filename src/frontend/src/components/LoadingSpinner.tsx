interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  label,
  className = "",
}: LoadingSpinnerProps) {
  const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  const borderMap = { sm: "border-2", md: "border-2", lg: "border-[3px]" };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      data-ocid="loading_state"
    >
      <div
        className={`${sizeMap[size]} ${borderMap[size]} rounded-full border-primary/30 border-t-primary animate-spin`}
        aria-label={label ?? "Loading"}
        role="status"
      />
      {label && (
        <p className="text-sm text-muted-foreground font-body">{label}</p>
      )}
    </div>
  );
}
