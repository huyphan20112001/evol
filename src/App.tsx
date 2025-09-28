import { Outlet, useLocation } from 'react-router-dom'
import { AuthProvider } from './components/auth-context'
import { Header } from './components/layout/header'
import { PATHNAME } from './constants/common'

function App() {
  const location = useLocation()

  const hideHeader = [PATHNAME.HOME, PATHNAME.LOGIN, PATHNAME.SIGNUP].includes(
    location.pathname,
  )

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {!hideHeader && <Header />}
        <main className={hideHeader ? '' : 'pt-0'}>
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
