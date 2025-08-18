import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    ShoppingCartIcon,
    UserIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline'

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navigation = [
        { name: 'Dashboard', href: '/', icon: '📊' },
        { name: 'Vendas', href: '/vendas', icon: '💰' },
        { name: 'Clientes', href: '/clientes', icon: '👥' },
        { name: 'Vendedores', href: '/vendedores', icon: '👨‍💼' },
    ]

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-200 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-tech group-hover:shadow-glow transition-all duration-300">
                                <ShoppingCartIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-secondary-800 to-primary-600 bg-clip-text text-transparent">
                                    Painel de Vendas
                                </h1>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side - Profile & Mobile menu button */}
                    <div className="flex items-center space-x-4">
                        {/* Profile Icon */}
                        <button className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                            <UserIcon className="w-6 h-6" />
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-secondary-200 shadow-lg animate-slide-up">
                    <div className="px-4 py-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive(item.href)
                                    ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-500'
                                    : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
