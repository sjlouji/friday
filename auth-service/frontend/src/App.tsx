import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import AppRouter from '@/routes/Router'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="friday-theme">
      <AppRouter />
      <Toaster />
    </ThemeProvider>
  )
}

export default App
