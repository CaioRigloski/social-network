import { useEffect, useState } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "standard">("light")

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "standard"
    if (saved) {
      setTheme(saved)
      document.body.classList.remove("light", "standard")
      document.body.classList.add(saved)
    }
  }, [])

  function toggleTheme() {
    const newTheme = theme === "light" ? "standard" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.body.classList.remove("light", "standard")
    document.body.classList.add(newTheme)
  }

  return { theme, toggleTheme }
}
