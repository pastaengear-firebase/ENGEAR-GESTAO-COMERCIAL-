/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configura o Next.js para gerar um site estático na pasta 'out'
  output: 'export',

  // Adiciona uma barra final (ex: /sobre/) aos links. 
  // Isso melhora a compatibilidade com hospedagens de sites estáticos.
  trailingSlash: true,
};

export default nextConfig;
