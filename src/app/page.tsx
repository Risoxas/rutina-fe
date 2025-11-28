import { GymManager } from '@/components/gym-manager';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Cast user to include roles (as we added it in auth.ts callback)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;

  return <GymManager user={user} />;
}
