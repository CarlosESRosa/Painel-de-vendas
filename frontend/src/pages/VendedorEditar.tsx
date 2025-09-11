import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VendorForm, { type VendorFormData } from '../components/forms/VendorForm';
import { SellersService } from '../services/sellers.service';
import type { Seller } from '../types/sellers.types';

const FIELDS = [
  { key: 'name', label: 'Nome completo' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Função' },
  { key: 'status', label: 'Status' },
] as const;

const VendedorEditar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadSeller = async () => {
      try {
        setLoading(true);
        setError('');
        if (!id) throw new Error('ID do vendedor não informado');
        const data = await SellersService.getSellerById(id);
        setSeller(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro ao carregar dados do vendedor');
        }
      } finally {
        setLoading(false);
      }
    };
    loadSeller();
  }, [id]);

  const initialData = useMemo<Partial<VendorFormData>>(() => {
    if (!seller) return {};
    return {
      name: seller.name,
      email: seller.email,
    };
  }, [seller]);

  const val = (key: (typeof FIELDS)[number]['key']) =>
    seller ? seller[key as keyof Seller] || '' : '';

  const handleSubmit = async (data: VendorFormData) => {
    if (!seller) return;

    try {
      setError('');
      setSuccess('');
      const updated = await SellersService.updateSeller(seller.id, data);
      setSeller(updated);
      setSuccess('Vendedor atualizado com sucesso.');
      setEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao atualizar vendedor');
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !seller) {
    return (
      <div className="animate-fade-in">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <p className="text-danger-800 font-medium">Erro</p>
          <p className="text-danger-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Editar Vendedor</h1>
          <p className="mt-2 text-secondary-600">
            {editing ? 'Atualize os dados do vendedor' : 'Visualize as informações do vendedor'}
          </p>
        </div>
        <button onClick={() => navigate('/vendedores')} className="btn-secondary px-4 py-2">
          ← Voltar para Vendedores
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Dados do Vendedor</h2>
          </div>
          {!editing && (
            <button className="btn-secondary" onClick={() => setEditing(true)}>
              Editar Vendedor
            </button>
          )}
        </div>

        {editing ? (
          <VendorForm
            onSubmit={handleSubmit}
            loading={false} // Removed saving state
            initialData={initialData}
            isEditing={true}
            onCancel={() => {
              setEditing(false);
              setError('');
              setSuccess('');
            }}
          />
        ) : (
          <section className="rounded-xl border border-secondary-200 bg-secondary-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-medium text-secondary-700 mb-2">{label}</label>
                  <input
                    value={val(key)}
                    readOnly
                    disabled
                    className="w-full rounded-lg border border-secondary-200 bg-white/60 text-secondary-900 px-3 py-2
                               placeholder-secondary-400 shadow-inner cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {success && (
          <div className="mt-4 p-4 bg-success-50 text-success-700 rounded-lg border border-success-200">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendedorEditar;
