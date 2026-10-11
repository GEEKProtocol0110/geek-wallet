'use client';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Logo({ size = 'medium', className = '' }: LogoProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-32 h-32',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* GEEK Logo - Purple & Blue Gradient */}
        <defs>
          <linearGradient id="geekGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="geekInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
        
        {/* Outer Circle */}
        <circle cx="50" cy="50" r="45" fill="url(#geekGradient)" />
        
        {/* Inner G shape */}
        <path
          d="M 50 20 C 35 20, 25 30, 25 45 C 25 60, 35 70, 50 70 C 60 70, 68 65, 70 57 L 55 57 L 55 48 L 75 48 C 75 68, 63 80, 50 80 C 29 80, 15 66, 15 45 C 15 24, 29 10, 50 10 C 63 10, 73 17, 78 28 L 68 33 C 65 25, 58 20, 50 20 Z"
          fill="white"
        />
        
        {/* Small accent circle */}
        <circle cx="72" cy="28" r="5" fill="url(#geekInner)" opacity="0.8" />
      </svg>
    </div>
  );
}
