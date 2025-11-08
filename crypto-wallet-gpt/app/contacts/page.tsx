import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { ContactsPageClient } from './ContactsPageClient';

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/');
  }

  return <ContactsPageClient userName={session.user.name || undefined} />;
}

