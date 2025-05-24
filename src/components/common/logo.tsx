// src/components/common/logo.tsx
import type React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 280, height = 80 }) => {
  // ATENÇÃO CRÍTICA - POR FAVOR, LEIA E AJUSTE SE NECESSÁRIO:
  //
  // 1. PASTA 'public' OBRIGATÓRIA NA RAIZ DO PROJETO:
  //    Para que o Next.js encontre imagens estáticas como o seu logo,
  //    DEVE existir uma pasta chamada 'public' na RAIZ do seu projeto.
  //    A raiz do projeto é onde ficam arquivos como 'package.json' e a pasta 'src'.
  //
  //    Se a pasta 'public' NÃO EXISTE na raiz do seu projeto,
  //    VOCÊ PRECISA CRIÁ-LA MANUALMENTE.
  //
  // 2. LOCALIZAÇÃO DO ARQUIVO DA IMAGEM DO LOGO:
  //    O arquivo da sua imagem do logo (agora definido como `NEWLOGO.jpg`)
  //    DEVE estar DENTRO desta pasta `public`.
  //    Caminho esperado: `public/NEWLOGO.jpg`
  //
  // 3. CAMINHO DA IMAGEM ABAIXO:
  //    A variável `logoImagePath` foi definida para "/NEWLOGO.jpg".
  //    Isso significa que o Next.js procurará por `NEWLOGO.jpg` diretamente
  //    dentro da pasta `public`.
  //
  //    Se o seu arquivo real na pasta `public` tiver um nome ou extensão diferente
  //    (ex: "newlogo.png", "Newlogo.jpg", "NEWLOGO.jpeg"), você DEVE ajustar
  //    a linha abaixo para corresponder.
  //
  //    Certifique-se de que a extensão do arquivo (.jpg, .png, .svg, etc.) está correta.
  //    VERIFIQUE TAMBÉM AS LETRAS MAIÚSCULAS E MINÚSCULAS NO NOME DO ARQUIVO.
  //    O nome do arquivo é SENSÍVEL A MAIÚSCULAS/MINÚSCULAS em muitos sistemas.

  const logoImagePath = "/NEWLOGO.jpg"; // <--- VERIFIQUE ESTE CAMINHO E NOME DE ARQUIVO!

  return (
    <div className={className ? `${className} bg-white` : "bg-white"} style={{ display: 'inline-block', padding: '5px', borderRadius: '4px' }}>
      <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative' }}>
        <Image
          src={logoImagePath}
          alt="ENGEAR Logo" // O texto alternativo é importante para acessibilidade.
          layout="fill"
          objectFit="contain"
          priority // Carrega a imagem do logo com prioridade
          unoptimized={true} // Adicionado para evitar otimização e corrigir erro 400
        />
      </div>
    </div>
  );
};

export default Logo;
