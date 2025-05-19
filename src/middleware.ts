// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware configurado para permitir todas as requisições para fins de teste.
export function middleware(request: NextRequest) {
  // console.log(`Middleware: Allowing request to ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  // O matcher garante que o middleware execute para estas rotas,
  // mas a lógica interna agora é um passthrough.
  // Adicionado '/' para garantir que a HomePage seja processada pelo middleware
  // e, assim, as regras de roteamento do Next.js sejam aplicadas corretamente
  // a partir do ponto de entrada.
  matcher: ['/dashboard/:path*', '/inserir-venda/:path*', '/dados/:path*', '/login', '/'],
};
