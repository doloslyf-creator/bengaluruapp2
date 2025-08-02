interface LogoProps {
  variant?: 'default' | 'admin' | 'user';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const variantStyles = {
    default: 'text-primary',
    admin: 'text-gray-900',
    user: 'text-primary'
  };

  return (
    <div className="flex flex-col items-start">
      <div className={`font-black tracking-tight ${sizeClasses[size]} ${variantStyles[variant]} logo-gradient`}>
        <span className="relative">
          Own
          <span className="text-orange-500">It</span>
          <span className="text-blue-600">Right</span>
        </span>
      </div>
      <p className={`text-gray-600 font-medium -mt-1 ${
        size === 'sm' ? 'text-xs' : 
        size === 'md' ? 'text-sm' : 
        'text-base'
      }`}>
        Curated Properties
      </p>
    </div>
  );
}