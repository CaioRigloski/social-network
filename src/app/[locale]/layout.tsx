import { NextIntlClientProvider } from 'next-intl'
import { auth } from '../api/auth/[nextauth]/route';
import Header from '@/components/Header/Header';
import { SessionProvider } from 'next-auth/react';
import { ChatProvider } from '@/contexts/ChatContext/ChatContext';
import { Toaster } from '@/components/ui/sonner';

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.log(error)
    return (await import(`@/messages/en.json`)).default;
  }
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: {locale: string}
}) {
  const session = await auth()
  const messages = await getMessages(params.locale)

  return (
  <SessionProvider session={session} key={session?.user?.id || null}>
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      <ChatProvider>
        { session?.user && <Header /> }
        { children }
        <Toaster />
      </ChatProvider>
    </NextIntlClientProvider>
  </SessionProvider>
  )
}