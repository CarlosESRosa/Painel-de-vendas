import { UserPlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Input } from '../ui';

export interface VendorFormData {
  name: string;
  email: string;
}

interface VendorFormProps {
  onSubmit: (data: VendorFormData) => void;
  loading?: boolean;
  initialData?: Partial<VendorFormData>;
  isEditing?: boolean;
  onCancel?: () => void;
}

const VendorForm = ({
  onSubmit,
  loading = false,
  initialData,
  isEditing = false,
  onCancel,
}: VendorFormProps) => {
  const [formData, setFormData] = useState<VendorFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
  });

  const [errors, setErrors] = useState<Partial<VendorFormData>>({});

  const handleInputChange = (field: keyof VendorFormData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<VendorFormData> = {};
    if (!formData.name.trim()) e.name = 'Nome é obrigatório';
    if (!formData.email.trim()) e.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Dados do Vendedor</h3>
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            placeholder="email@exemplo.com"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            className="btn-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>
            {loading
              ? isEditing
                ? 'Atualizando vendedor...'
                : 'Criando vendedor...'
              : isEditing
              ? 'Atualizar Vendedor'
              : 'Criar Vendedor'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default VendorForm;
