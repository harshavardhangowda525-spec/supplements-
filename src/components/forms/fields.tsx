import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-lime focus:outline-none aria-[invalid=true]:border-red-400";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="block text-xs font-medium text-white/80">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-white/60">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-300">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export function TextInput({ invalid, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      id={props.name}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${props.name}-error` : undefined}
      className={cn(control, "h-11", className)}
      {...props}
    />
  );
}

export function TextArea({ invalid, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      id={props.name}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${props.name}-error` : undefined}
      className={cn(control, "min-h-28 py-3", className)}
      {...props}
    />
  );
}

export function SelectInput({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select id={props.name} className={cn(control, "h-11 bg-charcoal", className)} {...props}>
      {children}
    </select>
  );
}

/** Hidden honeypot input for basic bot filtering. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function FormMessage({ status, message }: { status: string; message?: string }) {
  if (!message || status === "idle") return null;
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border p-3 text-sm",
        status === "success" ? "border-lime/30 bg-lime/10 text-lime" : "border-red-400/30 bg-red-400/10 text-red-200",
      )}
    >
      {message}
    </p>
  );
}
