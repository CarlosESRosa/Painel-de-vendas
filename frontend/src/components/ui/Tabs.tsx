import { ReactNode } from 'react'

interface Tab {
    id: string
    label: string
    count?: number
    color?: 'default' | 'success' | 'warning' | 'danger'
}

interface TabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    variant?: 'default' | 'pills' | 'underline'
    className?: string
}

const Tabs = ({ tabs, activeTab, onTabChange, variant = 'default', className = '' }: TabsProps) => {
    const getTabClasses = (tab: Tab, isActive: boolean, index: number) => {
        const baseClasses = "px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2"

        if (variant === 'pills') {
            const colorClasses = {
                default: isActive
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100',
                success: isActive
                    ? 'bg-success-100 text-success-700 border border-success-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100',
                warning: isActive
                    ? 'bg-warning-100 text-warning-700 border border-warning-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100',
                danger: isActive
                    ? 'bg-danger-100 text-danger-700 border border-danger-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
            }

            // Adiciona bordas especiais para criar o efeito agrupado
            let borderClasses = ''
            if (index === 0) {
                borderClasses = 'rounded-l-lg border-r-0'
            } else if (index === tabs.length - 1) {
                borderClasses = 'rounded-r-lg border-l-0'
            } else {
                borderClasses = 'border-l-0 border-r-0'
            }

            return `${baseClasses} ${colorClasses[tab.color || 'default']} ${borderClasses}`
        }

        if (variant === 'underline') {
            return `${baseClasses} ${isActive
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-secondary-600 hover:text-secondary-900'
                }`
        }

        // Default variant
        return `${baseClasses} ${isActive
            ? 'bg-primary-50 text-primary-700 border border-primary-200'
            : 'text-secondary-600 hover:text-secondary-900 hover:bg-primary-50'
            }`
    }

    const getColorClasses = (color?: string) => {
        switch (color) {
            case 'success':
                return 'bg-success-100 text-success-800 border-success-200'
            case 'warning':
                return 'bg-warning-100 text-warning-800 border-warning-200'
            case 'danger':
                return 'bg-danger-100 text-danger-800 border-danger-200'
            default:
                return 'bg-secondary-100 text-secondary-800 border-secondary-200'
        }
    }

    if (variant === 'pills') {
        return (
            <div className={`inline-flex rounded-lg border border-secondary-300 bg-white shadow-sm ${className}`}>
                {tabs.map((tab, index) => (
                    <div
                        key={tab.id}
                        className={getTabClasses(tab, activeTab === tab.id, index)}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getColorClasses(tab.color)}`}>
                                {tab.count}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={`flex space-x-1 ${className}`}>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={getTabClasses(tab, activeTab === tab.id, 0)}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getColorClasses(tab.color)}`}>
                            {tab.count}
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}

export default Tabs
