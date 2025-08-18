import { useState } from 'react'
import {
  HomeIcon,
  UserIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    { name: 'Vendas Hoje', value: 'R$ 12.450', change: '+12%', changeType: 'positive', icon: ChartBarIcon },
    { name: 'Clientes Ativos', value: '1.234', change: '+5%', changeType: 'positive', icon: UserIcon },
    { name: 'Produtos', value: '567', change: '+2%', changeType: 'positive', icon: ShoppingCartIcon },
    { name: 'Meta Mensal', value: '85%', change: '+8%', changeType: 'positive', icon: HomeIcon },
  ]

  const recentSales = [
    { id: 1, client: 'João Silva', product: 'Produto A', value: 'R$ 150,00', status: 'completed' },
    { id: 2, client: 'Maria Santos', product: 'Produto B', value: 'R$ 89,90', status: 'pending' },
    { id: 3, client: 'Pedro Costa', product: 'Produto C', value: 'R$ 220,00', status: 'completed' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-success-500" />
      case 'pending':
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-secondary-500" />
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <ShoppingCartIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">Painel de Vendas</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors">
                <CogIcon className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-soft border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
              { id: 'sales', name: 'Vendas', icon: ShoppingCartIcon },
              { id: 'clients', name: 'Clientes', icon: UserIcon },
              { id: 'reports', name: 'Relatórios', icon: ChartBarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar produtos, clientes..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sales */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">Vendas Recentes</h2>
                <button className="btn-primary flex items-center space-x-2">
                  <PlusIcon className="w-4 h-4" />
                  <span>Nova Venda</span>
                </button>
              </div>

              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(sale.status)}
                      <div>
                        <p className="font-medium text-secondary-900">{sale.client}</p>
                        <p className="text-sm text-secondary-600">{sale.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary-900">{sale.value}</p>
                      <p className="text-sm text-secondary-500">
                        {sale.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Color Palette Demo */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-6">Paleta de Cores</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Primary (Azul)</h3>
                <div className="grid grid-cols-5 gap-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`w-8 h-8 rounded border border-secondary-200 bg-primary-${shade}`}
                      title={`primary-${shade}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Accent (Rosa)</h3>
                <div className="grid grid-cols-5 gap-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`w-8 h-8 rounded border border-secondary-200 bg-accent-${shade}`}
                      title={`accent-${shade}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Success (Verde)</h3>
                <div className="grid grid-cols-5 gap-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`w-8 h-8 rounded border border-secondary-200 bg-success-${shade}`}
                      title={`success-${shade}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Warning (Amarelo)</h3>
                <div className="grid grid-cols-5 gap-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`w-8 h-8 rounded border border-secondary-200 bg-warning-${shade}`}
                      title={`warning-${shade}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Danger (Vermelho)</h3>
                <div className="grid grid-cols-5 gap-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`w-8 h-8 rounded border border-secondary-200 bg-danger-${shade}`}
                      title={`danger-${shade}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Demo */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-6">Componentes de Botões</h2>

            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Botão Primário</button>
              <button className="btn-secondary">Botão Secundário</button>
              <button className="bg-success-600 hover:bg-success-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-soft">
                Sucesso
              </button>
              <button className="bg-warning-600 hover:bg-warning-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-soft">
                Aviso
              </button>
              <button className="bg-danger-600 hover:bg-danger-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-soft">
                Perigo
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
