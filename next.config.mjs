/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ativa a exportação estática para compatibilidade com o plano Spark.
  output: 'export',

  // A otimização de imagens do Next.js não é suportada no modo de exportação estática.
  // Esta opção desativa a otimização para evitar erros.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
