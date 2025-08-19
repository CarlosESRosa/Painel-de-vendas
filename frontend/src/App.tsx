import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vendas from './pages/Vendas'
import NovaVenda from './pages/NovaVenda'
import EditarVenda from './pages/EditarVenda'
import Clientes from './pages/Clientes'
import Vendedores from './pages/Vendedores'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="vendas/nova" element={<NovaVenda />} />
        <Route path="vendas/editar/:id" element={<EditarVenda />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="vendedores" element={<Vendedores />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
