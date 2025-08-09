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

  return (
    <div className="flex flex-col items-start">
      <div className={`font-black tracking-tight ${sizeClasses[size]} ownitwise-wordmark`}>
        <span className="text-blue-700 dark:text-blue-400">Ownit</span>
        <span className="text-emerald-600 dark:text-emerald-400">Wise</span>
      </div>
      {showTagline && (
        <p className={`text-gray-600 dark:text-gray-300 font-medium -mt-1 ${taglineSizeClasses[size]}`}>
          Own homes With Confidence
        </p>
      )}
    </div>
  );
}