import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SalesService, type SaleWithItems, type UpdateSaleItemsData } from '../services/sales.service'
import { ClientsService, type CreateClientData } from '../services/clients.service'
import { StageCard, ProductSelector } from '../components/ui'
import ClientForm from '../components/forms/ClientForm'

const EditarVenda = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [sale, setSale] = useState<SaleWithItems | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentStage, setCurrentStage] = useState<'client' | 'items' | 'payment' | 'summary'>('client')

    // Estados dos estágios
    const [stages, setStages] = useState({
        client: { isCompleted: false, isActive: false },
        items: { isCompleted: false, isActive: false },
        payment: { isCompleted: false, isActive: false },
        summary: { isCompleted: false, isActive: false }
    })

    // Estados para edição
    const [editingClient, setEditingClient] = useState(false)
    const [showProductSelector, setShowProductSelector] = useState(false)
    const [loadingItems, setLoadingItems] = useState(false)

    // Estado para itens temporários selecionados
    const [tempSelectedItems, setTempSelectedItems] = useState<{ productId: string; quantity: number; product: any }[]>([])
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Configuração dos estágios
    const stageConfig = [
        {
            stage: 'client' as const,
            title: 'Cliente',
            description: 'Dados do cliente'
        },
        {
            stage: 'items' as const,
            title: 'Itens da Venda',
            description: 'Produtos e quantidades'
        },
        {
            stage: 'payment' as const,
            title: 'Pagamento',
            description: 'Informações de pagamento'
        },
        {
            stage: 'summary' as const,
            title: 'Resumo',
            description: 'Resumo da venda'
        }
    ]

    // Carregar venda
    useEffect(() => {
        const loadSale = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError('')

                const token = localStorage.getItem('access_token')
                if (!token) {
                    throw new Error('Token não encontrado')
                }

                const saleData = await SalesService.getSaleById(id, token)
                setSale(saleData)

                // Determinar estágio atual baseado nos dados da venda
                determineCurrentStage(saleData)

            } catch (err) {
                console.error('Erro ao carregar venda:', err)
                setError(err instanceof Error ? err.message : 'Erro ao carregar venda')
            } finally {
                setLoading(false)
            }
        }

        loadSale()
    }, [id])

    // Sincronizar estados quando a venda mudar
    useEffect(() => {
        if (sale) {
            determineCurrentStage(sale)

            // Inicializar itens temporários com os itens atuais da venda
            // Só se não houver alterações pendentes
            if (!hasUnsavedChanges && sale.items && sale.items.length > 0) {
                setTempSelectedItems(sale.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    product: {
                        id: item.productId,
                        name: item.product.name,
                        sku: item.product.sku,
                        price: item.unitPrice,
                        isActive: true,
                        createdAt: '',
                        updatedAt: ''
                    }
                })))
            }
        }
    }, [sale, hasUnsavedChanges])

    // Determinar estágio atual baseado nos dados da venda
    const determineCurrentStage = (saleData: SaleWithItems) => {
        let stage: 'client' | 'items' | 'payment' | 'summary' = 'client'
        let clientCompleted = false
        let itemsCompleted = false
        let paymentCompleted = false

        // Cliente sempre está preenchido (estágio 1)
        clientCompleted = true

        // Verificar se itens estão preenchidos (estágio 2)
        if (saleData.items && saleData.items.length > 0 && parseFloat(saleData.totalValue) > 0) {
            itemsCompleted = true
            stage = 'items'
        }

        // Verificar se pagamento está preenchido (estágio 3)
        if (saleData.paymentStatus === 'PAID' && saleData.paymentMethod) {
            paymentCompleted = true
            stage = 'payment'
        }

        // Se tudo estiver preenchido, está no resumo (estágio 4)
        if (clientCompleted && itemsCompleted && paymentCompleted) {
            stage = 'summary'
        }

        // Determinar o próximo estágio a ser ativado
        let nextStage: 'client' | 'items' | 'payment' | 'summary' = 'client'
        if (!itemsCompleted) {
            nextStage = 'items'
        } else if (!paymentCompleted) {
            nextStage = 'payment'
        } else if (clientCompleted && itemsCompleted && paymentCompleted) {
            nextStage = 'summary'
        }

        setCurrentStage(nextStage)
        setStages({
            client: { isCompleted: clientCompleted, isActive: nextStage === 'client' },
            items: { isCompleted: itemsCompleted, isActive: nextStage === 'items' },
            payment: { isCompleted: paymentCompleted, isActive: nextStage === 'payment' },
            summary: { isCompleted: clientCompleted && itemsCompleted && paymentCompleted, isActive: nextStage === 'summary' }
        })
    }

    // Handler para atualizar cliente
    const handleUpdateClient = async (clientData: CreateClientData) => {
        if (!sale) return

        setEditingClient(true)
        setError('')

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            // Validar dados antes de enviar
            if (!clientData.name.trim() || !clientData.cpf.trim()) {
                throw new Error('Nome e CPF são obrigatórios')
            }

            // Atualizar cliente
            await ClientsService.updateClient(sale.client.id, clientData, token)

            // Recarregar venda para obter dados atualizados
            const updatedSale = await SalesService.getSaleById(id!, token)
            setSale(updatedSale)

            // Marcar estágio do cliente como completo e avançar para itens
            setStages(prev => ({
                ...prev,
                client: { isCompleted: true, isActive: false },
                items: { isCompleted: false, isActive: true }
            }))
            setCurrentStage('items')

        } catch (err) {
            console.error('Erro ao atualizar cliente:', err)
            setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
        } finally {
            setEditingClient(false)
        }
    }

    // Handler para selecionar itens temporários (sem salvar ainda)
    const handleSelectItems = (selectedItems: { productId: string; quantity: number; product: any }[]) => {
        setTempSelectedItems(selectedItems)
        setHasUnsavedChanges(true)
        setShowProductSelector(false)
    }

    // Handler para alterar quantidade de um item diretamente na tela
    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) return

        setTempSelectedItems(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        )
        setHasUnsavedChanges(true)
    }

    // Handler para remover um item da seleção
    const handleRemoveItem = (productId: string) => {
        setTempSelectedItems(prev => prev.filter(item => item.productId !== productId))
        setHasUnsavedChanges(true)
    }

    // Handler para efetivar as mudanças dos itens da venda
    const handleSaveItems = async () => {
        if (!sale) return

        setLoadingItems(true)
        setError('')

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            // Validar dados antes de enviar
            if (!tempSelectedItems || tempSelectedItems.length === 0) {
                throw new Error('Selecione pelo menos um produto')
            }

            // Validar quantidades
            for (const item of tempSelectedItems) {
                if (item.quantity <= 0) {
                    throw new Error(`Quantidade inválida para o produto ${item.product.name}`)
                }
            }

            const itemsData: UpdateSaleItemsData = {
                items: tempSelectedItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            }

            // Atualizar itens da venda
            const updatedSale = await SalesService.updateSaleItems(sale.id, itemsData, token)
            setSale(updatedSale)

            // Limpar estados temporários
            setTempSelectedItems([])
            setHasUnsavedChanges(false)

            // Marcar estágio dos itens como completo e avançar para pagamento
            setStages(prev => ({
                ...prev,
                items: { isCompleted: true, isActive: false },
                payment: { isCompleted: false, isActive: true }
            }))
            setCurrentStage('payment')

        } catch (err) {
            console.error('Erro ao atualizar itens:', err)
            setError(err instanceof Error ? err.message : 'Erro ao atualizar itens da venda')
        } finally {
            setLoadingItems(false)
        }
    }

    // Calcular total dos itens temporários
    const calculateTempTotal = () => {
        if (tempSelectedItems.length === 0) return 0
        return tempSelectedItems.reduce((total, item) => {
            const price = parseFloat(item.product.price)
            return total + (price * item.quantity)
        }, 0)
    }

    // Verificar se há mudanças não salvas
    const hasChanges = () => {
        if (!sale?.items || tempSelectedItems.length === 0) return false

        // Comparar itens atuais com temporários
        if (sale.items.length !== tempSelectedItems.length) return true

        for (const tempItem of tempSelectedItems) {
            const currentItem = sale.items.find(item => item.productId === tempItem.productId)
            if (!currentItem || currentItem.quantity !== tempItem.quantity) return true
        }

        return false
    }

    // Navegar para estágio específico
    const navigateToStage = (stage: 'client' | 'items' | 'payment' | 'summary') => {
        // Só permite navegar para estágios anteriores ou o atual
        if (stage === 'client' ||
            (stage === 'items' && stages.client.isCompleted) ||
            (stage === 'payment' && stages.items.isCompleted) ||
            (stage === 'summary' && stages.payment.isCompleted)) {

            setStages(prev => ({
                ...prev,
                client: { ...prev.client, isActive: stage === 'client' },
                items: { ...prev.items, isActive: stage === 'items' },
                payment: { ...prev.payment, isActive: stage === 'payment' },
                summary: { ...prev.summary, isActive: stage === 'summary' }
            }))
            setCurrentStage(stage)
        }
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-lg font-medium text-secondary-700 mb-2">
                        Carregando venda...
                    </h3>
                    <p className="text-secondary-500">
                        Aguarde enquanto carregamos os dados da venda
                    </p>
                </div>
            </div>
        )
    }

    if (error || !sale) {
        return (
            <div className="animate-fade-in">
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                                <span className="text-danger-600 text-sm">!</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-danger-800 font-medium">Erro ao carregar venda</p>
                            <p className="text-sm text-danger-700 mt-1">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => navigate('/vendas')}
                            className="btn-secondary"
                        >
                            Voltar para Vendas
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header da página */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Editar Venda #{sale.id.slice(-8)}</h1>
                    <p className="mt-2 text-secondary-600">
                        Edite os dados da venda seguindo os estágios abaixo
                    </p>
                </div>
                <button
                    onClick={() => navigate('/vendas')}
                    className="btn-secondary px-4 py-2"
                >
                    ← Voltar para Vendas
                </button>
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
                            className="h-24 cursor-pointer"
                            onClick={() => navigateToStage(config.stage)}
                        />
                    ))}
                </div>

                {/* Indicador de progresso */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
                        <span>Progresso da venda</span>
                        <span>
                            {Object.values(stages).filter(s => s.isCompleted).length} de {Object.keys(stages).length} estágios
                        </span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${(Object.values(stages).filter(s => s.isCompleted).length / Object.keys(stages).length) * 100}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Conteúdo do estágio atual */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
                {/* Estágio: Cliente */}
                {stages.client.isActive && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-secondary-900">Dados do Cliente</h2>
                            <p className="mt-2 text-secondary-600">
                                {editingClient ? 'Edite os dados do cliente' : 'Visualize os dados do cliente'}
                            </p>
                        </div>

                        {editingClient ? (
                            <ClientForm
                                onSubmit={handleUpdateClient}
                                loading={editingClient}
                                initialData={{
                                    name: sale.client.name,
                                    cpf: sale.client.cpf
                                }}
                                isEditing={true}
                            />
                        ) : (
                            <div className="bg-secondary-50 rounded-lg p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                                            Nome do Cliente
                                        </label>
                                        <p className="text-lg text-secondary-900">{sale.client.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                                            CPF
                                        </label>
                                        <p className="text-lg text-secondary-900">{sale.client.cpf}</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setEditingClient(true)}
                                        className="btn-secondary"
                                    >
                                        Editar Cliente
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                                            <span className="text-danger-600 text-sm">!</span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium">Erro ao atualizar cliente:</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Estágio: Itens da Venda */}
                {stages.items.isActive && (
                    <div>
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">Itens da Venda</h2>
                                    <p className="mt-2 text-secondary-600">
                                        Selecione os produtos e quantidades para esta venda
                                    </p>
                                </div>
                                {hasUnsavedChanges && (
                                    <div className="px-4 py-2 bg-warning-100 text-warning-800 text-sm font-medium rounded-full border border-warning-200">
                                        ⚠️ Alterações pendentes
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resumo dos itens atuais */}
                        {sale.items && sale.items.length > 0 && !hasUnsavedChanges && (
                            <div className="mb-6 bg-secondary-50 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-secondary-900">Itens Atuais da Venda</h3>
                                    <span className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm font-medium rounded-full">
                                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {sale.items.map((item, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg border border-secondary-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-secondary-900">{item.product.name}</h4>
                                                    <p className="text-sm text-secondary-500">SKU: {item.product.sku}</p>
                                                    <p className="text-sm text-secondary-600">
                                                        Preço unitário: R$ {parseFloat(item.unitPrice).toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-secondary-600">
                                                        Quantidade: {item.quantity}
                                                    </p>
                                                    <p className="text-lg font-medium text-primary-600">
                                                        R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-secondary-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-secondary-900">Total da Venda:</span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            R$ {parseFloat(sale.totalValue).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado quando não há itens */}
                        {(!sale.items || sale.items.length === 0) && !hasUnsavedChanges && (
                            <div className="mb-6 bg-secondary-50 rounded-lg p-6 text-center">
                                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-secondary-700 mb-2">Nenhum item selecionado</h3>
                                <p className="text-secondary-500">
                                    Clique em "Selecionar Produtos" para adicionar itens à venda
                                </p>
                            </div>
                        )}

                        {/* Resumo dos itens temporários selecionados */}
                        {hasUnsavedChanges && tempSelectedItems.length > 0 && (
                            <div className="mb-6 bg-primary-50 rounded-lg p-6 border border-primary-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-primary-900">Itens Selecionados (Editar quantidades)</h3>
                                    <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                                        Alterações pendentes
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {tempSelectedItems.map((item, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg border border-primary-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-secondary-900">{item.product.name}</h4>
                                                    <p className="text-sm text-secondary-500">SKU: {item.product.sku}</p>
                                                    <p className="text-sm text-secondary-600">
                                                        Preço unitário: R$ {parseFloat(item.product.price).toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    {/* Controle de quantidade */}
                                                    <div className="flex items-center space-x-2">
                                                        <label className="text-sm font-medium text-secondary-700">Qtd:</label>
                                                        <div className="flex items-center border border-secondary-300 rounded-lg">
                                                            <button
                                                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="px-3 py-2 text-secondary-600 hover:text-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                                                                className="w-16 px-2 py-2 text-center border-x border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                            />
                                                            <button
                                                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                className="px-3 py-2 text-secondary-600 hover:text-secondary-800"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Subtotal do item */}
                                                    <div className="text-right min-w-[120px]">
                                                        <p className="text-sm text-secondary-600">
                                                            Subtotal
                                                        </p>
                                                        <p className="text-lg font-medium text-primary-600">
                                                            R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                                        </p>
                                                    </div>

                                                    {/* Botão remover */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                        className="p-2 text-danger-600 hover:text-danger-800 hover:bg-danger-50 rounded-lg transition-colors"
                                                        title="Remover item"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-primary-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-primary-900">Total da Venda:</span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            R$ {calculateTempTotal().toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botões de ação */}
                        <div className="text-center mb-6 flex justify-center space-x-4">
                            <button
                                onClick={() => setShowProductSelector(true)}
                                className={`px-8 py-3 rounded-lg font-medium transition-colors ${hasUnsavedChanges
                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                    : 'bg-secondary-600 text-white hover:bg-secondary-700'
                                    }`}
                                disabled={loadingItems}
                            >
                                {hasUnsavedChanges ? 'Editar Seleção' : (sale.items && sale.items.length > 0 ? 'Editar Itens' : 'Selecionar Produtos')}
                            </button>

                            {hasUnsavedChanges && (
                                <button
                                    onClick={() => {
                                        setTempSelectedItems([])
                                        setHasUnsavedChanges(false)
                                    }}
                                    className="px-4 py-3 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
                                    disabled={loadingItems}
                                >
                                    Descartar Alterações
                                </button>
                            )}
                        </div>

                        {/* Botão de confirmação final */}
                        {hasUnsavedChanges && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveItems}
                                    className="btn-primary px-8 py-3 flex items-center space-x-2"
                                    disabled={loadingItems}
                                >
                                    <span>{loadingItems ? 'Salvando...' : 'Confirmar Itens da Venda'}</span>
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                                            <span className="text-danger-600 text-sm">!</span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium">Erro ao atualizar itens:</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Estágio: Pagamento (placeholder) */}
                {stages.payment.isActive && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-lg font-medium text-secondary-700 mb-2">
                            Estágio de Pagamento
                        </h3>
                        <p className="text-secondary-500">
                            Funcionalidade será implementada em breve
                        </p>
                    </div>
                )}

                {/* Estágio: Resumo (placeholder) */}
                {stages.summary.isActive && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-lg font-medium text-secondary-700 mb-2">
                            Resumo da Venda
                        </h3>
                        <p className="text-secondary-500">
                            Funcionalidade será implementada em breve
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de seleção de produtos */}
            <ProductSelector
                isOpen={showProductSelector}
                onClose={() => setShowProductSelector(false)}
                onConfirm={handleSelectItems}
                currentItems={sale.items?.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })) || []}
            />
        </div>
    )
}

export default EditarVenda
