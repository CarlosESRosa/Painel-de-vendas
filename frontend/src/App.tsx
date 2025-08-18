import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vendas from './pages/Vendas'
import Clientes from './pages/Clientes'
import Vendedores from './pages/Vendedores'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="vendedores" element={<Vendedores />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
