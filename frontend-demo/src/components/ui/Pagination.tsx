import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    onPageChange: (page: number) => void
    onPerPageChange?: (perPage: number) => void
    showPerPageSelector?: boolean
    className?: string
}

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    perPage,
    onPageChange,
    onPerPageChange,
    showPerPageSelector = false,
    className = ''
}: PaginationProps) => {
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page)
        }
    }

    const startItem = (currentPage - 1) * perPage + 1
    const endItem = Math.min(currentPage * perPage, totalItems)

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {/* Informações da página */}
            <div className="text-sm text-secondary-600">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span> de{' '}
                <span className="font-medium">{totalItems}</span> resultados
            </div>

            {/* Seletor de itens por página */}
            {showPerPageSelector && onPerPageChange && (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-600">Itens por página:</span>
                    <select
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            )}

            {/* Navegação de páginas */}
            <div className="flex items-center space-x-1">
                {/* Botão Anterior */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-secondary-100 transition-colors duration-200"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {/* Números das páginas */}
                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${page === currentPage
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : page === '...'
                                ? 'text-secondary-400 cursor-default'
                                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Botão Próximo */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-secondary-100 transition-colors duration-200"
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}

export default Pagination
