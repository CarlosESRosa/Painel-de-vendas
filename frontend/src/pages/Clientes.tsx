import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import Table from '../components/ui/Table';
import { useDebounce } from '../hooks/useDebounce';
import { ClientsService } from '../services/clients.service';
import type { Client, ClientsFilters, ClientsQuery } from '../types/clients.types';

const Clientes = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---- filters (simplified to only search) ----
  const [filters, setFilters] = useState<ClientsFilters>({
    search: '',
    page: 1,
    perPage: 15,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // ---- pagination meta ----
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
  });

  // ---- table columns ----
  const columns = [
    {
      key: 'name',
      header: 'CLIENTE',
      render: (c: Client) => (
        <div>
          <div className="font-medium text-secondary-900">{c.name}</div>
          <div className="text-sm text-secondary-500">CPF: {c.cpf}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'CONTATO',
      render: (c: Client) => (
        <div className="text-secondary-900">
          <div className="text-sm">{c.email || '—'}</div>
          <div className="text-sm text-secondary-500">{c.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'LOCALIDADE',
      render: (c: Client) => (
        <div className="text-secondary-900">
          {c.city || '—'}
          {c.state ? `, ${c.state}` : ''}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'CRIADO EM',
      render: (c: Client) => (
        <div className="text-secondary-900">
          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '—'}
        </div>
      ),
    },
  ];

  // ---- data loader ----
  const loadClients = useCallback(async (f: ClientsFilters) => {
    try {
      setLoading(true);
      setError('');

      const query: ClientsQuery = {
        page: f.page,
        perPage: f.perPage,
        q: f.search || undefined, // Backend expects 'q' for search
      };

      const res = await ClientsService.getClients(query);

      setClients(res.items);
      setPagination({
        currentPage: res.page,
        totalPages: res.totalPages,
        totalItems: res.total,
        perPage: res.perPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // load on filter changes
  useEffect(() => {
    const q = { ...filters, search: debouncedSearch };
    loadClients(q);
  }, [debouncedSearch, filters.page, filters.perPage, loadClients]);

  // ---- handlers ----
  const handleRowClick = (client: Client) => {
    // Redirect to your client edit page route
    navigate(`/clientes/editar/${client.id}`);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev: ClientsFilters) => ({ ...prev, search: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters((prev: ClientsFilters) => ({
      ...prev,
      search: '',
      page: 1,
    }));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Clientes</h1>
          <p className="mt-2 text-secondary-600">Consulte e gerencie os clientes cadastrados</p>
        </div>
        {/* No "create" button for this page */}
      </div>

      {/* Filters - Simplified to only search */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Input
              label="Buscar (nome, CPF ou e-mail)"
              placeholder="Digite para buscar"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon="search"
              variant="search"
            />
          </div>

          <div className="flex justify-center">
            <button className="btn-secondary px-4 py-3" onClick={clearFilters}>
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <Table
          columns={columns}
          data={clients}
          loading={loading}
          emptyMessage="Nenhum cliente encontrado"
          onRowClick={handleRowClick}
        />
      </div>

      {/* Pagination */}
      {!loading && clients.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          perPage={pagination.perPage}
          onPageChange={(page) => setFilters((p: ClientsFilters) => ({ ...p, page }))}
          onPerPageChange={(perPage) =>
            setFilters((p: ClientsFilters) => ({ ...p, perPage, page: 1 }))
          }
          showPerPageSelector
        />
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                <span className="text-danger-600 text-sm">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-danger-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {filters.search && (
        <div className="mt-4 bg-info-50 border border-info-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-info-100 rounded-full flex items-center justify-center">
              <span className="text-info-600 text-sm">i</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-info-800 font-medium">Filtros ativos:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 bg-info-100 text-info-800 text-xs rounded-full">
                  Busca: {filters.search}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-info-600 mb-1">Resultados filtrados:</p>
              <p className="text-sm font-medium text-info-800">
                {pagination.totalItems} cliente{pagination.totalItems !== 1 ? 's' : ''} encontrado
                {pagination.totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
