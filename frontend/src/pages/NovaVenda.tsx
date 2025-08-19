import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ClientsService, type CreateClientData } from '../services/clients.service'
import { SalesService } from '../services/sales.service'
import { StageCard } from '../components/ui'
import ClientForm from '../components/forms/ClientForm'

const NovaVenda = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Estados dos estágios
    const [stages, setStages] = useState({
        client: { isCompleted: false, isActive: true },
        items: { isCompleted: false, isActive: false },
        payment: { isCompleted: false, isActive: false },
        summary: { isCompleted: false, isActive: false }
    })

    // Dados do cliente criado
    const [createdClient, setCreatedClient] = useState<any>(null)

    // Configuração dos estágios
    const stageConfig = [
        {
            stage: 'client' as const,
            title: 'Cliente',
            description: 'Preencher dados do cliente'
        },
        {
            stage: 'items' as const,
            title: 'Itens da Venda',
            description: 'Selecionar produtos e quantidades'
        },
        {
            stage: 'payment' as const,
            title: 'Pagamento',
            description: 'Upload do comprovante de pagamento'
        },
        {
            stage: 'summary' as const,
            title: 'Resumo',
            description: 'Resumo de toda a venda com as informações de todas etapas'
        }
    ]

    // Handler para criar cliente
    const handleCreateClient = async (clientData: CreateClientData) => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            setError('Usuário não autenticado')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Primeiro, criar o cliente
            const newClient = await ClientsService.createClient(clientData, token)
            setCreatedClient(newClient)

            // Depois, criar a venda com o cliente
            const saleData = {
                clientId: newClient.id,
                notes: `Venda criada para ${newClient.name}`
            }

            const newSale = await SalesService.createSale(saleData, token)

            // Marcar estágio do cliente como completo
            setStages(prev => ({
                ...prev,
                client: { isCompleted: true, isActive: false },
                items: { isCompleted: false, isActive: true }
            }))

            // Redirecionar para a tela de editar venda
            navigate(`/vendas/editar/${newSale.id}`)

        } catch (err) {
            console.error('Erro ao criar cliente/venda:', err)
            setError(err instanceof Error ? err.message : 'Erro ao criar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header da página */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Nova Venda</h1>
                <p className="mt-2 text-secondary-600">
                    Crie uma nova venda no sistema seguindo os estágios abaixo
                </p>
            </div>

            {/* Estágios da venda */}
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stageConfig.map((config, index) => (
                        <StageCard
                            key={config.stage}
                            stage={config.stage}
                            title={config.title}
                            description={config.description}
                            isCompleted={stages[config.stage].isCompleted}
                            isActive={stages[config.stage].isActive}
                            className="h-24"
                        />
                    ))}
                </div>
            </div>

            {/* Conteúdo do estágio atual */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
                {stages.client.isActive && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-secondary-900">Etapa de Cliente</h2>
                            <p className="mt-2 text-secondary-600">
                                Preencha os dados do cliente para continuar com a venda
                            </p>
                        </div>

                        <ClientForm
                            onSubmit={handleCreateClient}
                            loading={loading}
                        />

                        {error && (
                            <div className="mt-4 p-4 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
                                <p className="font-medium">Erro ao criar cliente:</p>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {stages.items.isActive && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-lg font-medium text-secondary-700 mb-2">
                            Redirecionando para a venda...
                        </h3>
                        <p className="text-secondary-500">
                            Aguarde enquanto redirecionamos você para continuar com os itens da venda
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NovaVenda
