// src/components/common/logo.tsx
// VERSÃO SIMPLIFICADA PARA DIAGNÓSTICO DO ERRO 500
// Esta versão NÃO tenta carregar NEWLOGO.JPG da pasta /public.
// Exibe um SVG inline simples.
import type React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 140, height = 40 }) => {
  // Se o erro 500 persistir com esta versão, a causa NÃO está no código
  // deste componente tentando carregar uma imagem da pasta /public.
  // O problema é mais profundo, relacionado à própria pasta /public
  // ou a configurações do servidor/ambiente.
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center border border-dashed border-red-500 p-2',
        className
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
      title="Logo Component (Debug Mode - SVG)"
    >
      <svg
        viewBox="0 0 200 60"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ENGEAR Logo Placeholder"
      >
        <rect width="200" height="60" fill="white" />
        <circle cx="30" cy="30" r="20" fill="#8A0F0F" /> {/* Maroon circle */}
        <text
          x="60"
          y="35"
          fontFamily="Arial, sans-serif"
          fontSize="20"
          fontWeight="bold"
          fill="#D4AF37" // Golden Yellow
        >
          ENGEAR
        </text>
      </svg>
    </div>
  );
};

export default Logo;