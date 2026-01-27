// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // The new entry point is the login page.
  redirect('/login');
}
