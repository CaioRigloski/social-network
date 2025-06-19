'use client'

import { Half2Icon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "@/hooks/use-theme"
import { useTranslations } from "next-intl"

export function ThemeToggle() {
  const t = useTranslations("header")

  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-muted transition standard:hover:text-color-secondary"
      title={t('toggleTheme')}
    >
      {theme === "light" ? <Half2Icon /> : <SunIcon />}
    </button>
  )
}