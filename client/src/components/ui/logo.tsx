interface LogoProps {
  variant?: 'default' | 'admin' | 'user';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ variant = 'default', size = 'md', showTagline = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getWordmarkClass = () => {
    switch (variant) {
      case 'admin':
        return 'ownitwise-wordmark-modern';
      default:
        return 'ownitwise-wordmark';
    }
  };

  return (
    <div className="flex flex-col items-start">
      <div className={`${sizeClasses[size]} ${getWordmarkClass()}`}>
        <span className="own-it">Own It</span>
        <span className="wise">Wise</span>
      </div>
      {showTagline && (
        <p className={`text-muted-foreground font-medium -mt-1 ${taglineSizeClasses[size]}`}>
          Own homes With Confidence
        </p>
      )}
    </div>
  );
}