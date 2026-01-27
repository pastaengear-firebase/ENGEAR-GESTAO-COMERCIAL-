// src/app/login/page.tsx
import { redirect } from 'next/navigation';

export default function LoginPage() {
  // A página de login agora é a página raiz ('/').
  // Esta página apenas redireciona para a raiz para lidar com quaisquer links antigos.
  redirect('/');
}
