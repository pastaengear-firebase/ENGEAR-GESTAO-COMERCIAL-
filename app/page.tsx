
// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redireciona para o dashboard como página inicial.
  redirect('/dashboard');
}
