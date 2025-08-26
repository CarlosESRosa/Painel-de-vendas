import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import ClienteEditar from './pages/ClienteEditar';
import Clientes from './pages/Clientes';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Vendas from './pages/Vendas';
import VendaWizard from './pages/VendaWizard';
import VendedorEditar from './pages/VendedorEditar';
import Vendedores from './pages/Vendedores';

function AppRoutes() {
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
        <Route path="/vendas/nova" element={<VendaWizard key="nova" />} />
        <Route path="/vendas/editar/:id" element={<VendaWizard key="editar" />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/editar/:id" element={<ClienteEditar />} />
        <Route path="vendedores" element={<Vendedores />} />
        <Route path="vendedores/editar/:id" element={<VendedorEditar />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
