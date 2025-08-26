// src/pages/VendaWizard.tsx
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientStep from '../components/steps/ClientStep';
import { StageCard } from '../components/ui';
import { useSaleWizard, type StageKey } from '../hooks/useSaleWizard';

const VendaWizard = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    sale,
    loading,
    error,
    stageState,
    viewStage,
    navigateToStage,
    createClientAndSale,
    updateClient, // <-- FIX: now coming from the hook
    // replaceItems, // (use here when you wire the Items step)
    // paySale,      // (use here when you wire the Payment step)
  } = useSaleWizard(id);

  const stageConfig: { stage: StageKey; title: string; description: string }[] = [
    { stage: 'client', title: 'Cliente', description: 'Preencher dados do cliente' },
    { stage: 'items', title: 'Itens da Venda', description: 'Selecionar produtos e quantidades' },
    { stage: 'payment', title: 'Pagamento', description: 'Upload do comprovante de pagamento' },
    { stage: 'summary', title: 'Resumo', description: 'Resumo de toda a venda' },
  ];

  const completedCount = useMemo(
    () => Object.values(stageState.map).filter((s) => s.isCompleted).length,
    [stageState.map],
  );

  // ---- UI: loading/error ----
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

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <p className="text-danger-800 font-medium">Erro</p>
          <p className="text-danger-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const title = id ? `Editar Venda #${sale?.id.slice(-8)}` : 'Nova Venda';
  const subtitle = id
    ? 'Edite os dados da venda seguindo os estágios abaixo'
    : 'Crie uma nova venda no sistema seguindo os estágios abaixo';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{title}</h1>
          <p className="mt-2 text-secondary-600">{subtitle}</p>
        </div>
        <button onClick={() => navigate('/vendas')} className="btn-secondary px-4 py-2">
          ← Voltar para Vendas
        </button>
      </div>

      {/* Stage navigation */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stageConfig.map((cfg) => (
            <StageCard
              key={cfg.stage}
              stage={cfg.stage}
              title={cfg.title}
              description={cfg.description}
              isCompleted={stageState.map[cfg.stage].isCompleted}
              isActive={stageState.map[cfg.stage].isActive}
              className="h-24"
              onClick={() => navigateToStage(cfg.stage)}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
            <span>Progresso</span>
            <span>
              {completedCount} de {4} estágios
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current step content */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-8">
        {/* STEP: CLIENT */}
        {viewStage === 'client' && (
          <ClientStep
            sale={sale}
            createClientAndSale={createClientAndSale}
            updateClient={updateClient}
            onCreated={(newSaleId) => navigate(`/vendas/editar/${newSaleId}`)}
          />
        )}

        {/* STEP: ITEMS (placeholder; plug your ProductSelector and call replaceItems) */}
        {viewStage === 'items' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-secondary-900">Itens da Venda</h2>
            <p className="text-secondary-600 mt-2">Selecione produtos e quantidades.</p>
            {/* Example when wiring:
                <ItemsStep sale={sale} onConfirm={(items) => replaceItems(items)} />
            */}
          </div>
        )}

        {/* STEP: PAYMENT (placeholder; call paySale) */}
        {viewStage === 'payment' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-secondary-900">Pagamento</h2>
            <p className="text-secondary-600 mt-2">Confirmar método e data do pagamento.</p>
            {/* Example when wiring:
                <PaymentStep onConfirm={(data) => paySale(data)} />
            */}
          </div>
        )}

        {/* STEP: SUMMARY */}
        {viewStage === 'summary' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-secondary-900">Resumo</h2>
            <p className="text-secondary-600 mt-2">Resumo final da venda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendaWizard;
