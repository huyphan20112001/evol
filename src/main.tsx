import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { ProtectedRoute, PublicRoute } from './components/auth/auth-guard.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { PATHNAME, STORAGE_KEY_THEME } from './constants/common.ts'
import './index.css'
import { queryClient } from './lib/query-client.ts'
import { LoginPage } from './pages/login.tsx'
import NotFoundPage from './pages/not-fround.tsx'
import { PostDetailPage } from './pages/post-detail.tsx'
import { PostsPage } from './pages/posts.tsx'
import { SignupPage } from './pages/signup.tsx'

const router = createBrowserRouter([
  {
    element: (
      <ThemeProvider defaultTheme="dark" storageKey={STORAGE_KEY_THEME}>
        <Toaster richColors dir="ltr" position="top-right" />
        <App />
      </ThemeProvider>
    ),
    children: [
      // Public routes
      {
        path: PATHNAME.HOME,
        element: <Navigate to={PATHNAME.POSTS} replace />,
      },
      {
        path: PATHNAME.LOGIN,
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: PATHNAME.SIGNUP,
        element: (
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        ),
      },
      // Protected routes
      {
        path: PATHNAME.POSTS,
        element: (
          <ProtectedRoute>
            <PostsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: PATHNAME.POST_DETAIL,
        element: (
          <ProtectedRoute>
            <PostDetailPage />
          </ProtectedRoute>
        ),
      },
      // Catch all route
      {
        path: PATHNAME.NOT_FOUND,
        element: (
          <PublicRoute>
            <NotFoundPage />
          </PublicRoute>
        ),
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
