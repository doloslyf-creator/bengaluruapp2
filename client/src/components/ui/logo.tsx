import { Link } from "wouter";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export default function Logo({ className = "", variant = "default", size = "md", showTagline = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10", 
    lg: "h-12"
  };

  const variants = {
    default: "text-[#021C1E]",
    white: "text-white",
    dark: "text-[#021C1E]"
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} aspect-square`}>
        <svg 
          viewBox="0 0 50 50" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background organic circle */}
          <circle cx="25" cy="25" r="22" fill="#6FB98F" opacity="0.1"/>
          
          {/* Home icon with organic, rounded styling */}
          <path 
            d="M12 30 L25 17 L38 30 L35 30 L35 36 C35 37.1 34.1 38 33 38 L17 38 C15.9 38 15 37.1 15 36 L15 30 Z" 
            fill="#2C7873" 
            stroke="#004445" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
          />
          
          {/* Door with rounded corners */}
          <rect x="22" y="32" width="6" height="6" rx="1" fill="#004445"/>
          
          {/* Circular windows */}
          <circle cx="20" cy="28" r="1.8" fill="#004445" opacity="0.7"/>
          <circle cx="30" cy="28" r="1.8" fill="#004445" opacity="0.7"/>
          
          {/* Organic sprouting elements */}
          <path d="M17 24 Q15 21 17 19 Q19 21 17 24" fill="#6FB98F"/>
          <path d="M33 24 Q35 21 33 19 Q31 21 33 24" fill="#6FB98F"/>
          
          {/* Growth dots */}
          <circle cx="21" cy="16" r="1.2" fill="#6FB98F"/>
          <circle cx="29" cy="16" r="1.2" fill="#6FB98F"/>
        </svg>
      </div>
      
      <div className="flex flex-col font-serif">
        <div className="flex items-baseline space-x-1">
          <span className={`font-semibold text-lg leading-none ${variants[variant]} tracking-wide`}>
            OWN
          </span>
          <span className={`font-normal text-lg leading-none opacity-80 ${variants[variant]}`}>
            IT
          </span>
          <span className={`font-normal text-base leading-none ${variants[variant]} tracking-[2px] opacity-90`}>
            WISE
          </span>
        </div>
        {showTagline && (
          <span className={`text-xs opacity-60 leading-none mt-0.5 ${variants[variant]} tracking-wide`}>
            Be Wise Before You Buy
          </span>
        )}
      </div>
    </Link>
  );
}