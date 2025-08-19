import { useAuth } from '../contexts/AuthContext'

const NovaVenda = () => {
    const { user } = useAuth()

    return (
        <div className="animate-fade-in">
            {/* Header da página */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Nova Venda</h1>
                <p className="mt-2 text-secondary-600">
                    Crie uma nova venda no sistema
                </p>
            </div>

            {/* Conteúdo placeholder */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
                <p className="text-secondary-600 text-center">
                    Formulário de nova venda será implementado aqui...
                </p>
            </div>
        </div>
    )
}

export default NovaVenda
