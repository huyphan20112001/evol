import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { STORAGE_KEY_THEME } from './constants/common.ts'
import './index.css'
import { queryClient } from './lib/query-client.ts'
import NotFoundPage from './pages/not-fround.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import Homepage from './pages/homepage.tsx'

const router = createBrowserRouter([
  {
    element: (
      <ThemeProvider defaultTheme="dark" storageKey={STORAGE_KEY_THEME}>
        <Toaster richColors dir="ltr" position="top-right" />
        <App />
      </ThemeProvider>
    ),
    children: [
      // auth route
      {
        path: '/',
        element: <Homepage />,
      },
      // protected route
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
