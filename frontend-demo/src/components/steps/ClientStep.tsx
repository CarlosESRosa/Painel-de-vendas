// src/components/steps/ClientStep.tsx
import { useMemo, useState } from 'react';
import type { CreateClientData } from '../../services/clients.service';
import type { SaleWithItems } from '../../services/sales.service';
import ClientForm from '../forms/ClientForm';

// Order + labels shown in both edit and read-only modes
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

type ClientStepProps = {
  sale: SaleWithItems | null | undefined;
  createClientAndSale: (data: CreateClientData) => Promise<SaleWithItems>;
  updateClient: (data: CreateClientData) => Promise<void>;
  onCreated?: (saleId: string) => void;
};

const ClientStep = ({ sale, createClientAndSale, updateClient, onCreated }: ClientStepProps) => {
  const isNewSale = !sale;

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Build initial data for the form (auto-fill all known fields)
  const initialData = useMemo<Partial<CreateClientData>>(() => {
    if (!sale?.client) return {};
    const src = sale.client as Record<string, string | null | undefined>;
    const out: Record<string, string> = {};
    [...FIELDS.personal, ...FIELDS.address].forEach(({ key }) => {
      const v = src[key];
      if (v !== undefined && v !== null) out[key] = String(v);
    });
    return out as Partial<CreateClientData>;
  }, [sale]);

  const handleCreate = async (clientData: CreateClientData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const createdSale = await createClientAndSale(clientData);
      setSuccess('Cliente e venda criados com sucesso.');
      if (createdSale?.id) onCreated?.(createdSale.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar cliente/venda');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (clientData: CreateClientData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateClient(clientData);
      setSuccess('Cliente atualizado com sucesso.');
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a value from sale.client
  const clientVal = (key: string) => {
    const client = sale?.client as Record<string, string | null | undefined>;
    return client?.[key] != null ? String(client[key]) : '';
  };

  // -------------------- RENDER --------------------

  // CREATE MODE
  if (isNewSale) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Etapa de Cliente</h2>
          <p className="mt-2 text-secondary-600">
            Preencha os dados do cliente para continuar com a venda
          </p>
        </div>

        <ClientForm onSubmit={handleCreate} loading={loading} />

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
    );
  }

  // VIEW/EDIT MODE
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Dados do Cliente</h2>
          <p className="mt-2 text-secondary-600">
            {editing ? 'Edite os dados do cliente' : 'Informações completas do cliente'}
          </p>
        </div>

        {!editing && (
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            Editar Cliente
          </button>
        )}
      </div>

      {editing ? (
        <>
          <ClientForm
            onSubmit={handleUpdate}
            loading={loading}
            initialData={initialData}
            isEditing={true}
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-100"
              onClick={() => {
                setEditing(false);
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        // READ-ONLY “disabled form” look
        <div className="space-y-6">
          {/* Personal */}
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

          {/* Address */}
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
  );
};

export default ClientStep;
