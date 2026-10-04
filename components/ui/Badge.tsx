import { type HTMLAttributes } from "react";
import { clsx } from "clsx";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-arc-500/10 text-arc-400",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-muted-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
