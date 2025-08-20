import { useState } from 'react'
import { Input } from '../ui'
import { UserPlusIcon } from '@heroicons/react/24/outline'

interface ClientFormData {
    name: string
    cpf: string
    email: string
    phone: string
    cep: string
    city: string
    neighborhood: string
    street: string
    number: string
    state: string
}

interface ClientFormProps {
    onSubmit: (data: ClientFormData) => void
    loading?: boolean
    initialData?: Partial<ClientFormData>
    isEditing?: boolean
}

const ClientForm = ({ onSubmit, loading = false, initialData, isEditing = false }: ClientFormProps) => {
    const [formData, setFormData] = useState<ClientFormData>({
        name: initialData?.name || '',
        cpf: initialData?.cpf || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        cep: initialData?.cep || '',
        city: initialData?.city || '',
        neighborhood: initialData?.neighborhood || '',
        street: initialData?.street || '',
        number: initialData?.number || '',
        state: initialData?.state || ''
    })

    const [errors, setErrors] = useState<Partial<ClientFormData>>({})

    const validateForm = (): boolean => {
        const newErrors: Partial<ClientFormData> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório'
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = 'CPF é obrigatório'
        } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
            newErrors.cpf = 'CPF deve ter 11 dígitos'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefone é obrigatório'
        }

        if (!formData.cep.trim()) {
            newErrors.cep = 'CEP é obrigatório'
        }

        if (!formData.city.trim()) {
            newErrors.city = 'Cidade é obrigatória'
        }

        if (!formData.neighborhood.trim()) {
            newErrors.neighborhood = 'Bairro é obrigatório'
        }

        if (!formData.street.trim()) {
            newErrors.street = 'Rua é obrigatória'
        }

        if (!formData.number.trim()) {
            newErrors.number = 'Número é obrigatório'
        }

        if (!formData.state.trim()) {
            newErrors.state = 'Estado é obrigatório'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleInputChange = (field: keyof ClientFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        }
    }

    const formatCEP = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados pessoais */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={errors.name}
                        placeholder="Digite o nome completo"
                        required
                    />
                    <Input
                        label="CPF"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                        error={errors.cpf}
                        placeholder="000.000.000-00"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={errors.email}
                        placeholder="email@exemplo.com"
                        required
                    />
                    <Input
                        label="Telefone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                        error={errors.phone}
                        placeholder="(00) 00000-0000"
                        required
                    />
                </div>
            </div>

            {/* Endereço */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="CEP"
                        value={formData.cep}
                        onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                        error={errors.cep}
                        placeholder="00000-000"
                        required
                    />
                    <Input
                        label="Cidade"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        error={errors.city}
                        placeholder="Digite a cidade"
                        required
                    />
                    <Input
                        label="Bairro"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        error={errors.neighborhood}
                        placeholder="Digite o bairro"
                        required
                    />
                    <Input
                        label="Estado"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        error={errors.state}
                        placeholder="Digite o estado"
                        required
                    />
                    <div className="md:col-span-2">
                        <Input
                            label="Rua"
                            value={formData.street}
                            onChange={(e) => handleInputChange('street', e.target.value)}
                            error={errors.street}
                            placeholder="Digite a rua"
                            required
                        />
                    </div>
                    <Input
                        label="Número"
                        value={formData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        error={errors.number}
                        placeholder="Digite o número"
                        required
                    />
                </div>
            </div>

            {/* Botão de envio */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    <span>{loading ? (isEditing ? 'Atualizando cliente...' : 'Criando cliente...') : (isEditing ? 'Atualizar Cliente' : 'Criar Cliente')}</span>
                </button>
            </div>
        </form>
    )
}

export default ClientForm
