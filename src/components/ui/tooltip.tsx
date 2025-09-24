import { cn } from "./utils";

export const TooltipProvider = ({ children, delayDuration = 0, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const Tooltip = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const TooltipTrigger = ({ asChild, children, ...props }: any) => {
  if (asChild) {
    return children;
  }
  return <div {...props}>{children}</div>;
};

export const TooltipContent = ({ className, ...props }: any) => (
  <div
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
);
