import { Outlet } from 'react-router-dom'
import Header from './Header'

const Layout = () => {
    return (
        <div className="min-h-screen bg-secondary-50">
            <Header />
            <main className="pt-20 px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
