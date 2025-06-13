
import React from 'react';
import { MoonStar } from 'lucide-react'; // Changed from Leaf to MoonStar

interface AppLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const AppLogo: React.FC<AppLogoProps> = ({ className, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  const iconSizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-6 w-6',
    large: 'h-7 w-7',
  };

  return (
    <div className={`flex items-center font-headline font-bold text-primary ${sizeClasses[size]} ${className}`}>
      <MoonStar className={`mr-1 md:mr-2 ${iconSizeClasses[size]}`} /> {/* Changed icon here */}
      Lunara
    </div>
  );
};

export default AppLogo;
