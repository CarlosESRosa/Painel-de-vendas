import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import Table from '../components/ui/Table';
import { useDebounce } from '../hooks/useDebounce';
import { SellersService } from '../services/sellers.service';
import type { Seller, SellersFilters, SellersQuery } from '../types/sellers.types';
import { getAuthToken } from '../utils/auth';

const Vendedores = () => {
  const navigate = useNavigate();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<SellersFilters>({
    search: '',
    page: 1,
    perPage: 15,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
  });

  // Ensure sellers is always an array
  const safeSellers = sellers || [];

  const columns = [
    {
      key: 'name',
      header: 'VENDEDOR',
      render: (s: Seller) => (
        <div>
          <div className="font-medium text-secondary-900">{s.name}</div>
          <div className="text-sm text-secondary-500">Role: {s.role}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'CONTATO',
      render: (s: Seller) => (
        <div className="text-secondary-900">
          <div className="text-sm">{s.email || '—'}</div>
          <div className="text-sm text-secondary-500">Status: {s.status}</div>
        </div>
      ),
    },
    {
      key: 'commission',
      header: 'COMISSÃO',
      render: (s: Seller) => (
        <div className="text-secondary-900">
          {s.commissionPercent ? `${(parseFloat(s.commissionPercent) * 100).toFixed(1)}%` : '—'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'CRIADO EM',
      render: (s: Seller) => (
        <div className="text-secondary-900">
          {s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}
        </div>
      ),
    },
  ];

  const loadSellers = useCallback(async (f: SellersFilters) => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const query: SellersQuery = {
        page: f.page,
        perPage: f.perPage,
        q: f.search || undefined,
      };

      const res = await SellersService.getSellers(query, token);

      // Ensure we have a valid response with items array
      if (res && Array.isArray(res.items)) {
        setSellers(res.items);
        setPagination({
          currentPage: res.page || 1,
          totalPages: res.totalPages || 1,
          totalItems: res.total || 0,
          perPage: res.perPage || 15,
        });
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', res);
        setSellers([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 15,
        });
        setError('Formato de resposta inesperado da API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendedores');
      console.error('Erro ao carregar vendedores:', err);
      // Ensure sellers is set to empty array on error
      setSellers([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 15,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = { ...filters, search: debouncedSearch };
    loadSellers(q);
  }, [debouncedSearch, filters.page, filters.perPage, loadSellers]);

  const handleRowClick = (seller: Seller) => {
    navigate(`/vendedores/editar/${seller.id}`);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({ ...prev, search: '', page: 1 }));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Vendedores</h1>
          <p className="mt-2 text-secondary-600">Consulte e gerencie os vendedores cadastrados</p>
        </div>
        {/* sem botão de criar aqui */}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Input
              label="Buscar (nome ou e-mail)"
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

      {/* Tabela */}
      <div className="mb-6">
        <Table
          columns={columns}
          data={safeSellers}
          loading={loading}
          emptyMessage="Nenhum vendedor encontrado"
          onRowClick={handleRowClick}
        />
      </div>

      {/* Paginação */}
      {!loading && safeSellers.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          perPage={pagination.perPage}
          onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
          onPerPageChange={(perPage) => setFilters((p) => ({ ...p, perPage, page: 1 }))}
          showPerPageSelector
        />
      )}

      {/* Erro */}
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

      {/* Resumo de filtros */}
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
                {pagination.totalItems} vendedor{pagination.totalItems !== 1 ? 'es' : ''} encontrado
                {pagination.totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendedores;
