import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientForm from '../components/forms/ClientForm';
import { ClientsService, type Client, type CreateClientData } from '../services/clients.service';

const FIELDS = {
  personal: [
    { key: 'name', label: 'Nome completo' },
    { key: 'cpf', label: 'CPF' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
  ],
  address: [
    { key: 'cep', label: 'CEP' },
    { key: 'city', label: 'Cidade' },
    { key: 'neighborhood', label: 'Bairro' },
    { key: 'state', label: 'Estado' },
    { key: 'street', label: 'Rua' },
    { key: 'number', label: 'Número' },
  ],
} as const;

const ClienteEditar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---- load client by id ----
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Token não encontrado');
        if (!id) throw new Error('ID do cliente não informado');
        const data = await ClientsService.getClientById(id, token);
        setClient(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar cliente');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ---- initial data for the form (auto-fill all known fields) ----
  const initialData = useMemo<Partial<CreateClientData>>(() => {
    if (!client) return {};
    const src = client as unknown as Record<string, string | null | undefined>;
    const out: Record<string, string> = {};
    [...FIELDS.personal, ...FIELDS.address].forEach(({ key }) => {
      const v = src[key];
      if (v !== undefined && v !== null) out[key] = String(v);
    });
    return out as Partial<CreateClientData>;
  }, [client]);

  // helper for readonly inputs
  const clientVal = (key: string) => {
    const src = client as unknown as Record<string, string | null | undefined>;
    const v = src?.[key];
    return v != null ? String(v) : '';
  };

  // ---- update handler ----
  const handleUpdate = async (data: CreateClientData) => {
    if (!client) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Token não encontrado');
      const updated = await ClientsService.updateClient(client.id, data, token);
      setClient(updated);
      setSuccess('Cliente atualizado com sucesso.');
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  // ---- UI ----
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

  if (error && !client) {
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
          <h1 className="text-3xl font-bold text-secondary-900">Editar Cliente</h1>
          <p className="mt-2 text-secondary-600">
            {editing ? 'Atualize os dados do cliente' : 'Visualize as informações do cliente'}
          </p>
        </div>
        <button onClick={() => navigate('/clientes')} className="btn-secondary px-4 py-2">
          ← Voltar para Clientes
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
        {/* Header inside card with Edit button */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Dados do Cliente</h2>
          </div>
          {!editing && (
            <button className="btn-secondary" onClick={() => setEditing(true)}>
              Editar Cliente
            </button>
          )}
        </div>

        {/* Content */}
        {editing ? (
          <>
            <ClientForm
              onSubmit={handleUpdate}
              loading={saving}
              initialData={initialData}
              isEditing={true}
              onCancel={() => {
                setEditing(false);
                setError('');
                setSuccess('');
              }}
            />
          </>
        ) : (
          // Read-only layout (form look but disabled)
          <div className="space-y-6">
            {/* Pessoais */}
            <section className="rounded-xl border border-secondary-200 bg-secondary-50 p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FIELDS.personal.map(({ key, label }) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-secondary-700 mb-2">{label}</label>
                    <input
                      value={clientVal(key)}
                      readOnly
                      disabled
                      className="w-full rounded-lg border border-secondary-200 bg-white/60 text-secondary-900 px-3 py-2
                                 placeholder-secondary-400 shadow-inner cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Endereço */}
            <section className="rounded-xl border border-secondary-200 bg-secondary-50 p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FIELDS.address.map(({ key, label }) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-secondary-700 mb-2">{label}</label>
                    <input
                      value={clientVal(key)}
                      readOnly
                      disabled
                      className="w-full rounded-lg border border-secondary-200 bg-white/60 text-secondary-900 px-3 py-2
                                 placeholder-secondary-400 shadow-inner cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Messages */}
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

export default ClienteEditar;
