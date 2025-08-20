import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { ProductsService, type Product } from '../../services/products.service'
import { useDebounce } from '../../hooks/useDebounce'

interface ProductSelectorProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (selectedItems: { productId: string; quantity: number; product: Product }[]) => void
    currentItems?: { productId: string; quantity: number }[]
}

interface SelectedProduct {
    productId: string
    quantity: number
    product: Product
}

const ProductSelector = ({ isOpen, onClose, onConfirm, currentItems = [] }: ProductSelectorProps) => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    // Inicializar itens selecionados com os itens atuais da venda
    useEffect(() => {
        if (currentItems.length > 0) {
            // Buscar informações completas dos produtos
            const loadProductDetails = async () => {
                try {
                    const token = localStorage.getItem('access_token')
                    if (!token) return

                    const productPromises = currentItems.map(async (item) => {
                        try {
                            const product = await ProductsService.getProductById(item.productId, token)
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                product
                            }
                        } catch (error) {
                            console.error(`Erro ao buscar produto ${item.productId}:`, error)
                            // Fallback para dados básicos
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                product: {
                                    id: item.productId,
                                    name: 'Produto não encontrado',
                                    sku: 'N/A',
                                    price: '0',
                                    isActive: true,
                                    createdAt: '',
                                    updatedAt: ''
                                }
                            }
                        }
                    })

                    const productsWithDetails = await Promise.all(productPromises)
                    setSelectedItems(productsWithDetails)
                } catch (error) {
                    console.error('Erro ao carregar detalhes dos produtos:', error)
                }
            }

            loadProductDetails()
        } else {
            // Se não há itens atuais, limpar seleção
            setSelectedItems([])
        }
    }, [currentItems])

    // Buscar produtos
    useEffect(() => {
        const loadProducts = async () => {
            if (!isOpen) return

            setLoading(true)
            try {
                const token = localStorage.getItem('access_token')
                if (!token) return

                const response = await ProductsService.getProducts({
                    page: currentPage,
                    perPage: 20,
                    q: debouncedSearchTerm || undefined,
                    isActive: true
                }, token)

                setProducts(response.items)
                setTotalPages(response.totalPages)
            } catch (error) {
                console.error('Erro ao carregar produtos:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [isOpen, debouncedSearchTerm, currentPage])

    const handleProductToggle = (product: Product) => {
        setSelectedItems(prev => {
            const existingIndex = prev.findIndex(item => item.productId === product.id)

            if (existingIndex >= 0) {
                // Remove o produto se já estiver selecionado
                return prev.filter((_, index) => index !== existingIndex)
            } else {
                // Adiciona o produto com quantidade 1
                return [...prev, { productId: product.id, quantity: 1, product }]
            }
        })
    }

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (quantity <= 0) return

        setSelectedItems(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity }
                    : item
            )
        )
    }

    const handleConfirm = () => {
        onConfirm(selectedItems)
        onClose()
    }

    const isProductSelected = (productId: string) => {
        return selectedItems.some(item => item.productId === productId)
    }

    const getSelectedProductQuantity = (productId: string) => {
        const item = selectedItems.find(item => item.productId === productId)
        return item?.quantity || 0
    }

    const calculateTotal = () => {
        return selectedItems.reduce((total, item) => {
            const price = parseFloat(item.product.price)
            return total + (price * item.quantity)
        }, 0)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                    <div>
                        <h2 className="text-2xl font-bold text-secondary-900">Selecionar Produtos</h2>
                        <p className="text-secondary-600">Selecione os produtos e quantidades para a venda</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {selectedItems.length > 0 && (
                            <div className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                                {selectedItems.length} produto{selectedItems.length !== 1 ? 's' : ''} selecionado{selectedItems.length !== 1 ? 's' : ''}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-secondary-500" />
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Lista de produtos */}
                    <div className="flex-1 p-6 border-r border-secondary-200">
                        {/* Busca */}
                        <div className="mb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Lista de produtos */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="mt-2 text-secondary-600">Carregando produtos...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-secondary-600">Nenhum produto encontrado</p>
                                </div>
                            ) : (
                                products.map(product => (
                                    <div
                                        key={product.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${isProductSelected(product.id)
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-secondary-200 hover:border-secondary-300'
                                            }`}
                                        onClick={() => handleProductToggle(product)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-secondary-900">{product.name}</h3>
                                                <p className="text-sm text-secondary-500">SKU: {product.sku}</p>
                                                <p className="text-lg font-semibold text-primary-600">
                                                    R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {isProductSelected(product.id) && (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={getSelectedProductQuantity(product.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            handleQuantityChange(product.id, parseInt(e.target.value) || 1)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-20 px-3 py-2 border border-secondary-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                )}
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isProductSelected(product.id)
                                                    ? 'border-primary-500 bg-primary-500'
                                                    : 'border-secondary-300'
                                                    }`}>
                                                    {isProductSelected(product.id) && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 border border-secondary-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                                >
                                    Anterior
                                </button>
                                <span className="px-3 py-2 text-secondary-600">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 border border-secondary-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resumo dos itens selecionados */}
                    <div className="w-80 p-6 bg-secondary-50">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Itens Selecionados</h3>

                        {selectedItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBagIcon className="w-8 h-8 text-secondary-400" />
                                </div>
                                <p className="text-secondary-600 font-medium mb-2">Nenhum produto selecionado</p>
                                <p className="text-secondary-500 text-sm">
                                    Clique nos produtos da lista para selecioná-los
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {selectedItems.map(item => (
                                        <div key={item.productId} className="bg-white p-3 rounded-lg border border-secondary-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-secondary-900 text-sm">{item.product.name}</h4>
                                                    <p className="text-xs text-secondary-500">SKU: {item.product.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-secondary-600">Qtd: {item.quantity}</p>
                                                    <p className="text-sm font-medium text-primary-600">
                                                        R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-secondary-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold text-secondary-900">Total:</span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            R$ {calculateTotal().toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleConfirm}
                                        className="w-full btn-primary py-3"
                                    >
                                        {selectedItems.length === 0 ? 'Selecionar Produtos' : `Confirmar ${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductSelector
