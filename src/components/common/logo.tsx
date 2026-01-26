// src/components/common/logo.tsx
import type React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 315, height = 90 }) => {
  // URL da imagem do logo fornecida pelo usuário
  const logoImagePath = "https://storage.googleapis.com/ecdt-logo-saida/14f838ca6736777a8b269b79cae43b2b84900eb9dd53c910eef80890010193ea/ENGEAR.webp";
  const altText = "ENGEAR Logo";

  const actualWidth = width || 315; // Default width increased by 50%
  const actualHeight = height || 90; // Default height increased by 50%

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-white p-1', // Fundo branco e padding
        className
      )}
      style={{ width: `${actualWidth}px`, height: `${actualHeight}px` }}
      title={altText}
    >
      <Image
        src={logoImagePath}
        alt={altText}
        width={actualWidth}
        height={actualHeight}
        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        priority
      />
    </div>
  );
};

export default Logo;
