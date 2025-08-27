import { PlusIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/ui/DatePicker';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import Table from '../components/ui/Table';
import Tabs from '../components/ui/Tabs';
import { useDebounce } from '../hooks/useDebounce';
import { SalesService } from '../services/sales.service';
import type { Sale, SalesFilters, SalesQuery } from '../types/sales.types';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '../types/sales.types';
import { getAuthToken } from '../utils/auth';

const Vendas = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado dos filtros
  const [filters, setFilters] = useState<SalesFilters>({
    clientName: '',
    dateRange: undefined,
    paymentStatus: 'ALL',
    page: 1,
    perPage: 15,
  });

  // Estado da paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
  });

  // Estados dos contadores de status (afetados pelos filtros aplicados)
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    canceled: 0,
  });

  // Debounce para o filtro de nome do cliente (meio segundo)
  const debouncedClientName = useDebounce(filters.clientName, 500);

  // Tabs de status de pagamento com contadores dinâmicos (afetados pelos filtros)
  const paymentStatusTabs = [
    {
      id: 'ALL',
      label: 'Todas',
      count: statusCounts.total,
      color: 'default' as 'default' | 'success' | 'warning' | 'danger',
    },
    {
      id: 'PAID',
      label: PAYMENT_STATUS_LABELS.PAID,
      count: statusCounts.paid,
      color: PAYMENT_STATUS_COLORS.PAID as 'default' | 'success' | 'warning' | 'danger',
    },
    {
      id: 'PENDING',
      label: PAYMENT_STATUS_LABELS.PENDING,
      count: statusCounts.pending,
      color: PAYMENT_STATUS_COLORS.PENDING as 'default' | 'success' | 'warning' | 'danger',
    },
    {
      id: 'CANCELED',
      label: PAYMENT_STATUS_LABELS.CANCELED,
      count: statusCounts.canceled,
      color: PAYMENT_STATUS_COLORS.CANCELED as 'default' | 'success' | 'warning' | 'danger',
    },
  ];

  // Colunas da tabela
  const columns = [
    {
      key: 'client.name',
      header: 'CLIENTE',
      render: (sale: Sale) => (
        <div>
          <div className="font-medium text-secondary-900">{sale.client.name}</div>
          <div className="text-sm text-secondary-500">CPF: {sale.client.cpf}</div>
        </div>
      ),
    },
    {
      key: 'seller.name',
      header: 'VENDEDOR',
      render: (sale: Sale) => <div className="text-secondary-900">{sale.seller.name}</div>,
    },
    {
      key: 'date',
      header: 'DATA',
      render: (sale: Sale) => (
        <div className="text-secondary-900">{new Date(sale.date).toLocaleDateString('pt-BR')}</div>
      ),
    },
    {
      key: 'totalValue',
      header: 'VALOR TOTAL',
      render: (sale: Sale) => (
        <div className="font-medium text-secondary-900">
          R$ {parseFloat(sale.totalValue).toFixed(2).replace('.', ',')}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'MÉTODO PAGAMENTO',
      render: (sale: Sale) => (
        <div className="text-secondary-900">
          {PAYMENT_METHOD_LABELS[sale.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ||
            sale.paymentMethod}
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'STATUS PAGAMENTO',
      render: (sale: Sale) => {
        const statusConfig = {
          PAID: {
            label: PAYMENT_STATUS_LABELS.PAID,
            color: 'bg-success-100 text-success-800 border-success-200',
          },
          PENDING: {
            label: PAYMENT_STATUS_LABELS.PENDING,
            color: 'bg-warning-100 text-warning-800 border-warning-200',
          },
          CANCELED: {
            label: PAYMENT_STATUS_LABELS.CANCELED,
            color: 'bg-danger-100 text-danger-800 border-danger-200',
          },
        };

        const config = statusConfig[sale.paymentStatus];

        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
  ];

  // Carregar vendas com filtros otimizados
  const loadSales = useCallback(async (queryFilters: SalesFilters) => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const query: SalesQuery = {
        page: queryFilters.page,
        perPage: queryFilters.perPage,
        clientName: queryFilters.clientName || undefined,
        startDate: queryFilters.dateRange?.start,
        endDate: queryFilters.dateRange?.end,
        paymentStatus:
          queryFilters.paymentStatus === 'ALL' ? undefined : queryFilters.paymentStatus,
      };

      console.log('Vendas - Loading sales with query:', query);
      const response = await SalesService.getSales(query, token);
      console.log('Vendas - Sales response:', {
        itemsCount: response.items.length,
        total: response.total,
        totalPages: response.totalPages,
      });

      setSales(response.items);
      setPagination({
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        perPage: response.perPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
      console.error('Erro ao carregar vendas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar contadores de status baseado nos filtros atuais (precisos)
  const loadStatusCounts = useCallback(async (queryFilters?: SalesFilters) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      // Usar o endpoint específico para contadores (sem paginação)
      const query = {
        clientName: queryFilters?.clientName || undefined,
        startDate: queryFilters?.dateRange?.start,
        endDate: queryFilters?.dateRange?.end,
      };

      console.log('Vendas - Loading status counts with query:', query);
      const counts = await SalesService.getStatusCounts(query, token);
      console.log('Vendas - Status counts response:', counts);

      setStatusCounts(counts);
    } catch (err) {
      console.error('Erro ao carregar contadores de status:', err);

      // Em caso de erro, usar contadores padrão
      setStatusCounts({
        total: 0,
        paid: 0,
        pending: 0,
        canceled: 0,
      });
    }
  }, []);

  // Carregar contadores na inicialização (sem filtros)
  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  // Carregar vendas quando os filtros com debounce mudarem
  useEffect(() => {
    const queryFilters = {
      ...filters,
      clientName: debouncedClientName,
    };
    loadSales(queryFilters);
  }, [
    debouncedClientName,
    filters.dateRange,
    filters.paymentStatus,
    filters.page,
    filters.perPage,
    loadSales,
  ]);

  // Recalcular contadores quando filtros mudarem (exceto paginação)
  useEffect(() => {
    const queryFilters = {
      ...filters,
      clientName: debouncedClientName,
    };
    loadStatusCounts(queryFilters);
  }, [debouncedClientName, filters.dateRange, loadStatusCounts]);

  // Handlers dos filtros
  const handleClientNameChange = (value: string) => {
    setFilters((prev) => ({ ...prev, clientName: value, page: 1 }));
  };

  const handlePaymentStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      paymentStatus: status as 'PAID' | 'PENDING' | 'CANCELED' | 'ALL',
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setFilters((prev) => ({ ...prev, perPage, page: 1 }));
  };

  const handleRowClick = (sale: Sale) => {
    // Navega para a tela de editar venda
    navigate(`/vendas/editar/${sale.id}`);
  };

  const handleNovaVenda = () => {
    // Navega para a tela de nova venda
    navigate('/vendas/nova');
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      clientName: '',
      dateRange: undefined,
      paymentStatus: 'ALL',
      page: 1,
    }));

    // Recarregar contadores sem filtros
    loadStatusCounts();
  };

  return (
    <div className="animate-fade-in">
      {/* Header da página */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Vendas</h1>
          <p className="mt-2 text-secondary-600">Gerencie todas as vendas do sistema</p>
        </div>
        {/* Botão nova venda */}
        <button className="btn-primary flex items-center space-x-2" onClick={handleNovaVenda}>
          <PlusIcon className="w-5 h-5" />
          <span>Nova Venda</span>
        </button>
      </div>

      {/* Filtros e ações */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          {/* Filtro por nome do cliente */}
          <div>
            <Input
              label="Nome do cliente"
              placeholder="Digite o nome do cliente"
              value={filters.clientName}
              onChange={(e) => handleClientNameChange(e.target.value)}
              icon="search"
              variant="search"
            />
          </div>

          {/* Filtro por data */}
          <div>
            <DatePicker
              label="Período"
              placeholder="Selecione um período"
              value={filters.dateRange}
              onChange={(dateRange) => {
                setFilters((prev) => ({
                  ...prev,
                  dateRange,
                  page: 1,
                }));
              }}
            />
          </div>

          {/* Botão limpar filtros */}
          <div className="flex justify-center">
            <button onClick={clearFilters} className="btn-secondary px-4 py-3">
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Tabs de status de pagamento */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-secondary-700">Status de Pagamento</h3>
          </div>
          <Tabs
            tabs={paymentStatusTabs}
            activeTab={filters.paymentStatus || 'ALL'}
            onTabChange={handlePaymentStatusChange}
            variant="pills"
          />
        </div>
      </div>

      {/* Tabela de vendas */}
      <div className="mb-6">
        <Table
          columns={columns}
          data={sales}
          loading={loading}
          emptyMessage="Nenhuma venda encontrada"
          onRowClick={handleRowClick}
        />
      </div>

      {/* Paginação */}
      {!loading && sales.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          perPage={pagination.perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          showPerPageSelector
        />
      )}

      {/* Mensagem de erro */}
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

      {/* Informações dos filtros ativos */}
      {(filters.clientName || filters.dateRange?.start || filters.paymentStatus !== 'ALL') && (
        <div className="mt-4 bg-info-50 border border-info-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-info-100 rounded-full flex items-center justify-center">
              <span className="text-info-600 text-sm">i</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-info-800 font-medium">Filtros ativos:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {filters.clientName && (
                  <span className="px-2 py-1 bg-info-100 text-info-800 text-xs rounded-full">
                    Cliente: {filters.clientName}
                  </span>
                )}
                {filters.dateRange?.start && (
                  <span className="px-2 py-1 bg-info-100 text-info-800 text-xs rounded-full">
                    Data: {new Date(filters.dateRange.start).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {filters.paymentStatus !== 'ALL' && (
                  <span className="px-2 py-1 bg-info-100 text-info-800 text-xs rounded-full">
                    Status:{' '}
                    {
                      PAYMENT_STATUS_LABELS[
                        filters.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS
                      ]
                    }
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-info-600 mb-1">Resultados filtrados:</p>
              <p className="text-sm font-medium text-info-800">
                {statusCounts.total} venda{statusCounts.total !== 1 ? 's' : ''} encontrada
                {statusCounts.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendas;
