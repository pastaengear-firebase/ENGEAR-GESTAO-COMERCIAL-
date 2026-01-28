// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main dashboard. AuthGate will handle unauthenticated users.
  redirect('/dashboard');
}
