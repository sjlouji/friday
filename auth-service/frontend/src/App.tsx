import AppRouter from '@/routes/Router'
import { ThemeProvider, Header, Footer, Toaster } from '@friday/components'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="friday-theme">
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow">
          <AppRouter />
        </main>
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
