
import React from 'react';

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

  return (
    <div className={`font-headline font-bold text-primary ${sizeClasses[size]} ${className}`}>
      Lunara
    </div>
  );
};

export default AppLogo;
