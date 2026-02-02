// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // The AuthGate will handle redirection based on auth state.
  // We can optimistically redirect to dashboard.
  redirect('/dashboard');
}
