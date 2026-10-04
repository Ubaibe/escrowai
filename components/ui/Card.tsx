import { type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  title?: string;
  description?: string;
}

export function Card({ className, children, title, description, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-card p-6 text-card-foreground",
        className,
      )}
      {...props}
    >
      {title && (
        <div className="mb-1 space-y-0.5">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
