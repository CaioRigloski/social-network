import { NextIntlClientProvider } from 'next-intl'

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
  const messages = await getMessages(params.locale)

  return (
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      { children }
    </NextIntlClientProvider>
  )
}