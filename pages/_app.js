import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark'
    setTheme(initialTheme)
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark')
    document.documentElement.classList.add(`theme-${theme}`)
    window.localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <SessionProvider session={session}>
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="theme-toggle"
        aria-label="Cambiar tema"
      >
        {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      </button>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
