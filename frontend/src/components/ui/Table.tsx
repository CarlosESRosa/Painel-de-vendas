import type { ReactNode } from 'react'

interface Column<T> {
    key: string
    header: string
    render?: (item: T) => ReactNode
    className?: string
    sortable?: boolean
}

interface TableProps<T> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    emptyMessage?: string
    onRowClick?: (item: T) => void
    className?: string
}

const Table = <T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    emptyMessage = 'Nenhum item encontrado',
    onRowClick,
    className = ''
}: TableProps<T>) => {
    const getDefaultValue = (item: T, key: string) => {
        const keys = key.split('.')
        let value: any = item

        for (const k of keys) {
            value = value?.[k]
            if (value === undefined || value === null) break
        }

        return value
    }

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden ${className}`}>
                <div className="animate-pulse">
                    <div className="bg-secondary-100 h-12"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-t border-secondary-200">
                            <div className="bg-white h-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className={`bg-white rounded-xl shadow-soft border border-secondary-200 p-8 text-center ${className}`}>
                <div className="text-secondary-500">
                    <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-secondary-900">{emptyMessage}</h3>
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                onClick={() => onRowClick?.(item)}
                                className={`${onRowClick ? 'cursor-pointer hover:bg-primary-50 transition-colors duration-150' : ''}`}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 whitespace-nowrap text-sm text-secondary-900 ${column.className || ''}`}
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : getDefaultValue(item, column.key)
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Table
