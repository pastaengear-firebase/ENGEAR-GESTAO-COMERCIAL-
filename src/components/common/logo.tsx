// src/components/common/logo.tsx
import type React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width, height }) => {
  const logoImagePath = "https://i.ibb.co/GfWMfMY0/novologoe.png";
  const altText = "ENGEAR Logo";

  // If width and height are provided, use them to set the container size.
  const containerStyle = width && height ? { width, height } : {};

  return (
    <div className={cn(className)} style={containerStyle}>
      <img
        src={logoImagePath}
        alt={altText}
        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Logo;
