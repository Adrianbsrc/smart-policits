import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export function Input({
  className,
  label,
  error,
  hint,
  id,
  startAdornment,
  endAdornment,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {startAdornment && (
          <div className="pointer-events-none absolute left-3 text-muted-foreground">
            {startAdornment}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-strong",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/30",
            startAdornment && "pl-9",
            endAdornment && "pr-9",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 text-muted-foreground">
            {endAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1 text-xs text-destructive">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
