// src/components/common/logo.tsx
// Usando uma imagem de placeholder online temporariamente.
// O erro 500 foi resolvido ao deletar a pasta /public.
// Isso indica um problema em como a pasta /public ou seu conteúdo era tratado pelo servidor.
// Estamos agora testando next/image com uma URL externa para isolar o problema.

import type React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 140, height = 40 }) => {
  // Usaremos as dimensões fornecidas para o placeholder, ou os padrões.
  const actualWidth = width || 140;
  const actualHeight = height || 40;
  const placeholderImageUrl = `https://placehold.co/${actualWidth}x${actualHeight}.png`;
  const placeholderAiHint = "company logo";

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-white p-1', // Fundo branco e padding
        className
      )}
      style={{ width: `${actualWidth}px`, height: `${actualHeight}px` }}
      title="ENGEAR Logo Placeholder"
    >
      <Image
        src={placeholderImageUrl}
        alt="ENGEAR Logo Placeholder"
        width={actualWidth}
        height={actualHeight}
        style={{ objectFit: 'contain' }} // Garante que a imagem se ajuste bem
        data-ai-hint={placeholderAiHint}
        // Se a imagem de placeholder também causar problemas, podemos adicionar unoptimized={true}
        // mas o ideal é testar o comportamento padrão do next/image com URLs externas primeiro.
      />
    </div>
  );
};

export default Logo;
