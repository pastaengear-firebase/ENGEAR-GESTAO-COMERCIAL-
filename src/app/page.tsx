// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // This component's only job is to redirect to the login page.
  // The redirect function is more efficient than using useEffect with useRouter.
  redirect('/login');
}
