import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DatePicker from '../components/ui/DatePicker';
import Tabs from '../components/ui/Tabs';
import { SalesService } from '../services/sales.service';
import type { Sale } from '../types/sales.types';

// ---------------------------------------------------------------------------
// helpers

type DateRange = { start: string; end: string } | undefined;
type Granularity = 'day' | 'week' | 'month';

const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCompactBRL = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${Math.round(n)}`;
};

const toISO = (d: Date) => d.toISOString().slice(0, 10);

const lastNDays = (n = 30): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));
  return { start: toISO(start), end: toISO(end) };
};

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const delta = (day + 6) % 7; // make Monday start
  x.setDate(x.getDate() - delta);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

// Enumerate buckets by granularity, returning ISO keys and short labels
const enumerateBuckets = (range: DateRange, gran: Granularity) => {
  if (!range) return [] as { key: string; label: string; tooltip: string }[];

  const out: { key: string; label: string; tooltip: string }[] = [];
  const start = new Date(range.start);
  const end = new Date(range.end);

  if (gran === 'day') {
    const cur = new Date(start);
    while (cur <= end) {
      const key = toISO(cur);
      out.push({
        key,
        label: cur.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tooltip: cur.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      });
      cur.setDate(cur.getDate() + 1);
    }
  } else if (gran === 'week') {
    const cur = startOfWeek(start);
    while (cur <= end) {
      const key = toISO(cur);
      out.push({
        key,
        label: cur.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tooltip: `Semana de ${cur.toLocaleDateString('pt-BR')}`,
      });
      cur.setDate(cur.getDate() + 7);
    }
  } else {
    // month
    let cur = startOfMonth(start);
    while (cur <= end) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-01`;
      out.push({
        key,
        label: cur.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
        tooltip: cur.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      });
      cur = startOfMonth(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
    }
  }
  return out;
};

// Adaptive moving average window
const windowFor = (gran: Granularity) => (gran === 'day' ? 7 : gran === 'week' ? 4 : 3);

// ---------------------------------------------------------------------------
// page

const Dashboard = () => {
  const navigate = useNavigate();

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>(lastNDays(30));
  const [status, setStatus] = useState<'ALL' | 'PAID' | 'PENDING' | 'CANCELED'>('ALL');
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [showOrdersBars, setShowOrdersBars] = useState(true);

  // Data
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    canceled: 0,
  });

  // Quick ranges (optional shortcuts)
  const quickRanges = [
    { id: '7d', label: '7d', range: lastNDays(7) },
    { id: '30d', label: '30d', range: lastNDays(30) },
    { id: '90d', label: '90d', range: lastNDays(90) },
    {
      id: 'ytd',
      label: 'YTD',
      range: (() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return { start: toISO(start), end: toISO(now) };
      })(),
    },
  ];

  // Load status counts
  const loadStatusCounts = useCallback(async (range: DateRange) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const counts = await SalesService.getStatusCounts(
        { startDate: range?.start, endDate: range?.end },
        token,
      );
      setStatusCounts(counts);
    } catch {
      setStatusCounts({ total: 0, paid: 0, pending: 0, canceled: 0 });
    }
  }, []);

  // Load ALL sales within range (+ optional status)
  const loadSales = useCallback(
    async (range: DateRange, st: 'ALL' | 'PAID' | 'PENDING' | 'CANCELED') => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Token não encontrado');

        const perPage = 100; // backend limit
        let page = 1;
        let items: Sale[] = [];
        let hasMore = true;

        while (hasMore && page <= 10) {
          const res = await SalesService.getSales(
            {
              page,
              perPage,
              startDate: range?.start,
              endDate: range?.end,
              paymentStatus: st === 'ALL' ? undefined : st,
            },
            token,
          );
          items = items.concat(res.items);
          hasMore = page < res.totalPages && res.items.length === perPage;
          page++;
        }

        setSales(items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
        setSales([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // initial + on filter change
  useEffect(() => {
    loadStatusCounts(dateRange);
    loadSales(dateRange, status);
  }, [dateRange?.start, dateRange?.end, status, loadSales, loadStatusCounts]);

  // Derived data
  const paidSales = useMemo(() => sales.filter((s) => s.paymentStatus === 'PAID'), [sales]);

  const revenue = useMemo(
    () => paidSales.reduce((acc, s) => acc + (parseFloat(s.totalValue) || 0), 0),
    [paidSales],
  );

  const orders = useMemo(() => sales.length, [sales]);

  const ticketMedio = useMemo(() => {
    const count = paidSales.length || 1;
    return revenue / count;
  }, [revenue, paidSales]);

  const paidRate = useMemo(() => {
    const total = statusCounts.total || 1;
    return (statusCounts.paid / total) * 100;
  }, [statusCounts]);

  // --- Big chart series (adaptive) -----------------------------------------
  type Point = {
    key: string;
    label: string;
    tooltip: string;
    receita: number;
    vendas: number;
    media: number;
  };

  const composedSeries: Point[] = useMemo(() => {
    const buckets = enumerateBuckets(dateRange, granularity);

    // Aggregate into buckets
    const acc = new Map<string, { receita: number; vendas: number }>();
    buckets.forEach((b) => acc.set(b.key, { receita: 0, vendas: 0 }));

    // Helper to compute bucket key for a given sale date
    const keyFor = (iso: string) => {
      const d = new Date(iso);
      if (granularity === 'day') return toISO(d);
      if (granularity === 'week') return toISO(startOfWeek(d));
      const m = startOfMonth(d);
      return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-01`;
    };

    // Fill totals
    sales.forEach((s) => {
      const k = keyFor(s.date);
      if (!acc.has(k)) acc.set(k, { receita: 0, vendas: 0 });
      const a = acc.get(k)!;
      a.vendas += 1;
      if (s.paymentStatus === 'PAID') a.receita += parseFloat(s.totalValue) || 0;
    });

    // Build ordered series
    const raw = buckets.map((b) => ({
      key: b.key,
      label: b.label,
      tooltip: b.tooltip,
      receita: acc.get(b.key)?.receita || 0,
      vendas: acc.get(b.key)?.vendas || 0,
    }));

    // Moving average over receita
    const win = windowFor(granularity);
    const out: Point[] = raw.map((p, i) => {
      const from = Math.max(0, i - (win - 1));
      const slice = raw.slice(from, i + 1);
      const sum = slice.reduce((sum, x) => sum + x.receita, 0);
      const media = sum / slice.length;
      return { ...p, media };
    });

    return out;
  }, [sales, dateRange, granularity]);

  // Payment methods (donut)
  const paymentMethodData = useMemo(() => {
    const count: Record<string, number> = {};
    paidSales.forEach((s) => {
      const m = s.paymentMethod || 'OUTRO';
      count[m] = (count[m] || 0) + 1;
    });
    return Object.keys(count).map((k) => ({ name: k, value: count[k] }));
  }, [paidSales]);

  // Top sellers (by revenue, paid only)
  const topSellers = useMemo(() => {
    const m = new Map<string, { name: string; revenue: number; orders: number }>();
    paidSales.forEach((s) => {
      const id = s.seller?.id || '—';
      const name = s.seller?.name || 'Sem vendedor';
      const r = parseFloat(s.totalValue) || 0;
      const prev = m.get(id) || { name, revenue: 0, orders: 0 };
      m.set(id, { name, revenue: prev.revenue + r, orders: prev.orders + 1 });
    });
    return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [paidSales]);

  // Recent sales
  const recentSales = useMemo(() => {
    const copy = [...sales];
    copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return copy.slice(0, 8);
  }, [sales]);

  // Status tabs config
  const paymentStatusTabs = [
    { id: 'ALL', label: 'Todas', count: statusCounts.total, color: 'default' as const },
    { id: 'PAID', label: 'Pagas', count: statusCounts.paid, color: 'success' as const },
    { id: 'PENDING', label: 'Pendentes', count: statusCounts.pending, color: 'warning' as const },
    { id: 'CANCELED', label: 'Canceladas', count: statusCounts.canceled, color: 'danger' as const },
  ];

  const pieColors = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#7c3aed', '#0ea5e9'];

  return (
    <div className="animate-fade-in">
      {/* Header (unchanged) */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="mt-2 text-secondary-600">Visão geral do seu painel de vendas</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => navigate('/clientes')}>
            Ver Clientes
          </button>
          <button className="btn-secondary" onClick={() => navigate('/vendas')}>
            Ver Vendas
          </button>
          <button className="btn-primary" onClick={() => navigate('/vendas/nova')}>
            Nova Venda
          </button>
        </div>
      </div>

      {/* Filters (unchanged + quick ranges & granularity) */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6 mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-end">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <DatePicker
                label="Período"
                placeholder="Selecione um período"
                value={dateRange}
                onChange={(dr: DateRange) => setDateRange(dr)}
              />
            </div>
            <div className="hidden md:flex gap-2">
              {quickRanges.map((q) => {
                const active = dateRange?.start === q.range.start && dateRange?.end === q.range.end;
                return (
                  <button
                    key={q.id}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                    }`}
                    onClick={() => setDateRange(q.range)}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-secondary-700">Status de Pagamento</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600">Granularidade:</span>
                <div className="flex rounded-lg border border-secondary-300 overflow-hidden">
                  {(['day', 'week', 'month'] as Granularity[]).map((g) => (
                    <button
                      key={g}
                      className={`px-3 py-1.5 text-sm ${
                        granularity === g ? 'bg-secondary-200 text-secondary-900' : 'bg-white'
                      }`}
                      onClick={() => setGranularity(g)}
                    >
                      {g === 'day' ? 'Dia' : g === 'week' ? 'Semana' : 'Mês'}
                    </button>
                  ))}
                </div>
                <label className="ml-3 text-sm text-secondary-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOrdersBars}
                    onChange={(e) => setShowOrdersBars(e.target.checked)}
                  />
                  Mostrar barras de vendas
                </label>
              </div>
            </div>

            <Tabs
              variant="pills"
              tabs={paymentStatusTabs}
              activeTab={status}
              onTabChange={(s) => setStatus((s as any) ?? 'ALL')}
            />
          </div>
        </div>
      </div>

      {/* KPIs (unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Faturamento"
          value={formatBRL(revenue)}
          hint="Pagas no período"
          loading={loading}
        />
        <KpiCard
          title="Total de Vendas"
          value={orders.toString()}
          hint="Todas no período"
          loading={loading}
        />
        <KpiCard
          title="Ticket médio"
          value={formatBRL(ticketMedio)}
          hint="Somente pagas"
          loading={loading}
        />
        <KpiCard
          title="% Pago"
          value={`${paidRate.toFixed(0)}%`}
          hint="Pagas / Total"
          loading={loading}
        />
      </div>

      {/* HERO CHART: full width */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Desempenho no período</h3>
          <span className="text-sm text-secondary-600">
            {dateRange
              ? `${new Date(dateRange.start).toLocaleDateString('pt-BR')} — ${new Date(
                  dateRange.end,
                ).toLocaleDateString('pt-BR')}`
              : '—'}
          </span>
        </div>
        <div className="h-[520px]">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-secondary-100 rounded-lg" />
          ) : (
            <ResponsiveContainer>
              <ComposedChart
                data={composedSeries}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={22}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => formatCompactBRL(Number(v))}
                  width={70}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${v}`}
                  width={40}
                  hide={!showOrdersBars}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const p = payload[0].payload as any;
                    return (
                      <div className="rounded-lg bg-white border border-secondary-200 shadow-lg px-3 py-2">
                        <div className="text-xs text-secondary-600">{p.tooltip}</div>
                        <div className="mt-1 font-semibold text-secondary-900">
                          Receita: {formatBRL(p.receita)}
                        </div>
                        {showOrdersBars && (
                          <div className="text-sm text-secondary-700">Vendas: {p.vendas}</div>
                        )}
                        <div className="text-xs text-secondary-600">
                          Média móvel: {formatBRL(p.media)}
                        </div>
                      </div>
                    );
                  }}
                />
                {showOrdersBars && (
                  <Bar
                    yAxisId="right"
                    name="Vendas"
                    dataKey="vendas"
                    fill="#94a3b8"
                    opacity={0.7}
                    barSize={granularity === 'day' ? 8 : granularity === 'week' ? 14 : 18}
                  />
                )}
                <Area
                  yAxisId="left"
                  name="Receita"
                  type="monotone"
                  dataKey="receita"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rev)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="left"
                  name="Média móvel"
                  type="monotone"
                  dataKey="media"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />

                {composedSeries.length > 45 && (
                  <Brush
                    dataKey="label"
                    height={26}
                    travellerWidth={10}
                    stroke="#cbd5e1"
                    className="rounded-md"
                  />
                )}
                <Legend verticalAlign="top" height={24} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SUPPORT ROW (3 compact cards) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        {/* Métodos de pagamento */}
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Métodos de pagamento (pagas)
            </h3>
            <span className="text-sm text-secondary-600">{paidSales.length} venda(s)</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="w-full h-full animate-pulse bg-secondary-100 rounded-lg" />
            ) : paymentMethodData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary-600">
                Sem dados para o período.
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={85}
                    label
                  >
                    {paymentMethodData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Vendedores */}
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Top Vendedores</h3>
          </div>
          {loading ? (
            <div className="h-40 animate-pulse bg-secondary-100 rounded-lg" />
          ) : topSellers.length === 0 ? (
            <div className="text-secondary-600">Sem dados para o período.</div>
          ) : (
            <ul className="divide-y divide-secondary-200">
              {topSellers.map((v, idx) => (
                <li key={v.name + idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-secondary-100 text-secondary-800 flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <div className="font-medium text-secondary-900">{v.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-secondary-900">{formatBRL(v.revenue)}</div>
                    <div className="text-sm text-secondary-600">{v.orders} venda(s)</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimas vendas */}
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Últimas vendas</h3>
            <button
              className="text-primary-600 hover:underline"
              onClick={() => navigate('/vendas')}
            >
              Ver todas
            </button>
          </div>
          {loading ? (
            <div className="h-40 animate-pulse bg-secondary-100 rounded-lg" />
          ) : recentSales.length === 0 ? (
            <div className="text-secondary-600">Sem vendas no período.</div>
          ) : (
            <ul className="divide-y divide-secondary-200">
              {recentSales.map((s) => (
                <li
                  key={s.id}
                  className="py-3 flex items-center justify-between hover:bg-secondary-50 rounded-lg px-2 cursor-pointer"
                  onClick={() => navigate(`/vendas/editar/${s.id}`)}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-secondary-900 truncate">
                      {s.client?.name || 'Cliente'}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {new Date(s.date).toLocaleDateString('pt-BR')} • {s.paymentMethod || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-secondary-900">
                      {formatBRL(parseFloat(s.totalValue) || 0)}
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full border ${
                        s.paymentStatus === 'PAID'
                          ? 'bg-success-100 text-success-800 border-success-200'
                          : s.paymentStatus === 'PENDING'
                          ? 'bg-warning-100 text-warning-800 border-warning-200'
                          : 'bg-danger-100 text-danger-800 border-danger-200'
                      }`}
                    >
                      {s.paymentStatus === 'PAID'
                        ? 'Paga'
                        : s.paymentStatus === 'PENDING'
                        ? 'Pendente'
                        : 'Cancelada'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

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
    </div>
  );
};

// ---------------------------------------------------------------------------
// small, reusable KPI card

function KpiCard({
  title,
  value,
  hint,
  loading,
}: {
  title: string;
  value: string;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-5">
      <p className="text-sm text-secondary-600">{title}</p>
      {loading ? (
        <div className="mt-3 h-8 w-3/4 bg-secondary-100 animate-pulse rounded" />
      ) : (
        <p className="mt-2 text-2xl font-bold text-secondary-900">{value}</p>
      )}
      {hint && <p className="text-xs text-secondary-500 mt-1">{hint}</p>}
    </div>
  );
}

export default Dashboard;
