// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // The entry point of the app is the login page.
  redirect('/login');
}
