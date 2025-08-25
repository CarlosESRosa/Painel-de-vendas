import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StageCard } from '../components/ui';
import { SalesService, type SaleWithItems } from '../services/sales.service';

type StageKey = 'client' | 'items' | 'payment' | 'summary';

const EditarVenda = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Which form is currently displayed (can be completed or the actual open one)
  const [viewStage, setViewStage] = useState<StageKey>('client');

  // Track if the user manually changed the viewed stage
  const [hasUserNavigated, setHasUserNavigated] = useState(false);

  // ---- Load sale -----------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        setHasUserNavigated(false); // reset when opening a sale
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Token não encontrado');

        const data = await SalesService.getSaleById(id, token);
        setSale(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar venda');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ---- Derive stage states purely from `sale` ------------------------------
  const stageState = useMemo(() => {
    const s = sale;

    const clientCompleted = Boolean(s?.client?.id);
    const itemsCompleted = (s?.items?.length ?? 0) > 0 && Number(s?.totalValue ?? 0) > 0;
    const paymentCompleted = s?.paymentStatus === 'PAID' && Boolean(s?.paymentMethod);

    let active: StageKey = 'client';
    if (!clientCompleted) active = 'client';
    else if (!itemsCompleted) active = 'items';
    else if (!paymentCompleted) active = 'payment';
    else active = 'summary';

    const summaryCompleted = clientCompleted && itemsCompleted && paymentCompleted;

    return {
      active, // the one blue card
      map: {
        client: { isCompleted: clientCompleted, isActive: active === 'client' },
        items: { isCompleted: itemsCompleted, isActive: active === 'items' },
        payment: { isCompleted: paymentCompleted, isActive: active === 'payment' },
        summary: { isCompleted: summaryCompleted, isActive: active === 'summary' },
      } as Record<StageKey, { isCompleted: boolean; isActive: boolean }>,
    };
  }, [sale]);

  // 1) On initial load (or when active changes) show the ACTIVE stage,
  //    but only if the user hasn't manually navigated yet.
  useEffect(() => {
    if (!sale) return;
    if (!hasUserNavigated) {
      setViewStage(stageState.active);
    }
  }, [sale, stageState.active, hasUserNavigated]);

  // 2) If the currently viewed stage becomes blocked due to a sale change,
  //    snap back to the active stage.
  useEffect(() => {
    const current = stageState.map[viewStage];
    if (!current || (!current.isActive && !current.isCompleted)) {
      setViewStage(stageState.active);
    }
  }, [sale, stageState.active]); // run on sale changes or when the active stage changes

  // ---- Navigation: only allow completed or active cards --------------------
  const navigateToStage = (stage: StageKey) => {
    const target = stageState.map[stage];
    if (!target) return;
    if (target.isActive || target.isCompleted) {
      setHasUserNavigated(true); // user took control
      setViewStage(stage); // only changes displayed form
    }
  };

  const stageConfig: { stage: StageKey; title: string; description: string }[] = [
    { stage: 'client', title: 'Cliente', description: 'Dados do cliente' },
    { stage: 'items', title: 'Itens da Venda', description: 'Produtos e quantidades' },
    { stage: 'payment', title: 'Pagamento', description: 'Informações de pagamento' },
    { stage: 'summary', title: 'Resumo', description: 'Resumo da venda' },
  ];

  const completedCount = useMemo(
    () => Object.values(stageState.map).filter((s) => s.isCompleted).length,
    [stageState.map],
  );
  const totalStages = 4;

  // ---- UI ------------------------------------------------------------------
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

  if (error || !sale) {
    return (
      <div className="animate-fade-in">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                <span className="text-danger-600 text-sm">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-danger-800 font-medium">Erro ao carregar venda</p>
              <p className="text-sm text-danger-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={() => navigate('/vendas')} className="btn-secondary">
              Voltar para Vendas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Editar Venda #{sale.id.slice(-8)}
          </h1>
          <p className="mt-2 text-secondary-600">
            Edite os dados da venda seguindo os estágios abaixo
          </p>
        </div>
        <button onClick={() => navigate('/vendas')} className="btn-secondary px-4 py-2">
          ← Voltar para Vendas
        </button>
      </div>

      {/* Stage cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stageConfig.map((cfg) => (
            <StageCard
              key={cfg.stage}
              stage={cfg.stage}
              title={cfg.title}
              description={cfg.description}
              isCompleted={stageState.map[cfg.stage].isCompleted}
              isActive={stageState.map[cfg.stage].isActive} // <- from sale only
              className="h-24"
              onClick={() => navigateToStage(cfg.stage)}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
            <span>Progresso da venda</span>
            <span>
              {completedCount} de {totalStages} estágios
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / totalStages) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content: only what you're viewing */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
        {viewStage === 'client' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-secondary-900">Formulário: Cliente</h2>
            <p className="text-secondary-600 mt-2">
              Conteúdo do formulário de cliente será exibido aqui.
            </p>
          </div>
        )}

        {viewStage === 'items' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-secondary-900">Formulário: Itens da Venda</h2>
            <p className="text-secondary-600 mt-2">Seleção e edição de itens será exibida aqui.</p>
          </div>
        )}

        {viewStage === 'payment' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-secondary-900">Formulário: Pagamento</h2>
            <p className="text-secondary-600 mt-2">
              Dados e confirmação de pagamento serão exibidos aqui.
            </p>
          </div>
        )}

        {viewStage === 'summary' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-secondary-900">Formulário: Resumo</h2>
            <p className="text-secondary-600 mt-2">Resumo final da venda será exibido aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarVenda;
