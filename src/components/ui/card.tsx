import { cn } from "./utils";

export const Card = ({ className, ...props }: any) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
);

export const CardContent = ({ className, ...props }: any) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
