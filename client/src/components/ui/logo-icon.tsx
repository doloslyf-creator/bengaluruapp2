import { Check, Key, Home } from "lucide-react";

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'color' | 'monochrome';
}

export default function LogoIcon({ size = 'md', variant = 'color' }: LogoIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: { home: 'w-3 h-3', key: 'w-2 h-2', check: 'w-1.5 h-1.5' },
    md: { home: 'w-4 h-4', key: 'w-2.5 h-2.5', check: 'w-2 h-2' },
    lg: { home: 'w-6 h-6', key: 'w-4 h-4', check: 'w-3 h-3' }
  };

  const getBackgroundStyle = () => {
    if (variant === 'monochrome') {
      return 'bg-current text-white';
    }
    return 'bg-gradient-to-br from-navy to-gold text-white';
  };

  return (
    <div className={`${sizeClasses[size]} ${getBackgroundStyle()} rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm`}>
      {/* Villa outline background */}
      <Home className={`${iconSizes[size].home} absolute opacity-20`} />
      
      {/* Key in center */}
      <Key className={`${iconSizes[size].key} relative z-10`} />
      
      {/* Checkmark badge */}
      <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5">
        <Check className={`${iconSizes[size].check} text-white`} strokeWidth={3} />
      </div>
    </div>
  );
}