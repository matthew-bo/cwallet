import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { HelpPageClient } from './HelpPageClient';

export default async function HelpPage() {
  const session = await getServerSession(authOptions);

  return <HelpPageClient isAuthenticated={!!session} />;
}

