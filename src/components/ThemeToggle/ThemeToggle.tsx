'use client'

import { Half2Icon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-muted transition standard:hover:text-color-secondary"
      title="Toggle theme"
    >
      {theme === "light" ? <Half2Icon /> : <SunIcon />}
    </button>
  )
}