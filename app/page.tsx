import { cookies } from 'next/headers';
import { verifySession,sessionCookieName } from '@/lib/auth';
import JournalApp from '@/components/journal-app';
import LoginScreen from '@/components/login-screen';
export const runtime='nodejs';
export default async function Home(){const ok=await verifySession((await cookies()).get(sessionCookieName)?.value);return ok?<JournalApp/>:<LoginScreen/>}
