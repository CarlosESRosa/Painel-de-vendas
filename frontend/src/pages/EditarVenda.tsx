import { useAuth } from '../contexts/AuthContext'

const EditarVenda = () => {
    const { user } = useAuth()

    return (
        <div className="animate-fade-in">
            {/* Header da página */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Editar Venda</h1>
                <p className="mt-2 text-secondary-600">
                    Edite os dados da venda
                </p>
            </div>

            {/* Conteúdo placeholder */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
                <p className="text-secondary-600 text-center">
                    Formulário de edição de venda será implementado aqui...
                </p>
            </div>
        </div>
    )
}

export default EditarVenda
