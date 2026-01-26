// src/components/common/logo.tsx
import type React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width, height }) => {
  const logoImagePath = "https://i.ibb.co/GfWMfMY/novologoe.png";
  const altText = "ENGEAR Logo";

  // If width and height are provided, use them to set the container size.
  // Otherwise, the size will be determined by the className.
  const containerStyle = width && height ? { width, height } : {};

  return (
    <div className={cn("relative", className)} style={containerStyle}>
      <Image
        src={logoImagePath}
        alt={altText}
        fill
        style={{ objectFit: 'contain' }}
        priority // Prioritize loading since it's a logo
      />
    </div>
  );
};

export default Logo;
