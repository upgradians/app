import React from "react";
import { cn } from "../utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const paddingStyles = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({ glow, hover, padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-surface-card border border-border transition-all duration-300",
        hover && "hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10 cursor-pointer",
        glow  && "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-brand/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none",
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between mb-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-bold text-text-1 tracking-tight", className)} {...props}>{children}</h3>;
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-text-2 text-sm leading-relaxed", className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between pt-4 mt-4 border-t border-border", className)} {...props}>{children}</div>;
}
