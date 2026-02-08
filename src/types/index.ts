// Common types for the application

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'vendedor' | 'gerente';
}

export interface Venda {
  id: string;
  clienteNome: string;
  valor: number;
  data: Date;
  vendedorId: string;
  vendedorNome: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  createdAt: Date;
  updatedAt: Date;
}
