import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  variant?: "default" | "white" | "dark";
}

export default function Logo({ 
  className, 
  size = "md", 
  showTagline = false,
  variant = "default"
}: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl", 
    lg: "text-3xl",
    xl: "text-4xl"
  };

  const taglineSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  };

  const variantClasses = {
    default: "text-blue-700 dark:text-blue-400",
    white: "text-white",
    dark: "text-gray-900"
  };

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <div className={cn(
        "font-bold tracking-tight ownitwise-wordmark",
        sizeClasses[size],
        variantClasses[variant]
      )}>
        <span className="text-blue-700 dark:text-blue-400">Ownit</span>
        <span className="text-emerald-600 dark:text-emerald-400">Wise</span>
      </div>
      {showTagline && (
        <div className={cn(
          "font-medium text-gray-600 dark:text-gray-300 mt-1",
          taglineSizeClasses[size]
        )}>
          Own homes With Confidence
        </div>
      )}
    </div>
  );
}