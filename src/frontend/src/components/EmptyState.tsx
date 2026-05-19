import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  "data-ocid"?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  "data-ocid": ocid,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className,
      )}
      data-ocid={ocid}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-foreground text-lg mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          className="mt-5"
          onClick={onAction}
          data-ocid="empty_state.primary_button"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
