import { Outlet } from 'react-router-dom'
import { AuthProvider } from './components/auth-context'

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default App
