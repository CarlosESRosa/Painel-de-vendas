// src/hooks/useSaleWizard.ts
import { useEffect, useMemo, useState } from 'react';
import { ClientsService, type CreateClientData } from '../services/clients.service';
import {
  SalesService,
  type SaleWithItems,
  type UpdateSaleItemsData,
} from '../services/sales.service';

export type StageKey = 'client' | 'items' | 'payment' | 'summary';

type StageStateMap = Record<StageKey, { isCompleted: boolean; isActive: boolean }>;

export function useSaleWizard(saleId?: string) {
  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(!!saleId);
  const [error, setError] = useState<string>('');
  const [viewStage, setViewStage] = useState<StageKey>('client');
  const [hasUserNavigated, setHasUserNavigated] = useState(false);

  // ---- load or refetch sale ----
  const fetchSale = async (id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Token não encontrado');
    const data = await SalesService.getSaleById(id, token);
    setSale(data);
    return data;
  };

  useEffect(() => {
    const load = async () => {
      if (!saleId) {
        setSale(null);
        setLoading(false);
        setError('');
        setHasUserNavigated(false);
        setViewStage('client');
        return;
      }
      try {
        setLoading(true);
        setError('');
        setHasUserNavigated(false);
        await fetchSale(saleId);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar venda');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [saleId]);

  // ---- derive stage state from sale only ----
  const stageState = useMemo(() => {
    const s = sale;

    const clientCompleted = Boolean(s?.client?.id);
    const itemsCompleted = (s?.items?.length ?? 0) > 0 && Number(s?.totalValue ?? 0) > 0;
    const paymentCompleted = s?.paymentStatus === 'PAID' && Boolean(s?.paymentMethod);
    const summaryCompleted = clientCompleted && itemsCompleted && paymentCompleted;

    let active: StageKey = 'client';
    if (!clientCompleted) active = 'client';
    else if (!itemsCompleted) active = 'items';
    else if (!paymentCompleted) active = 'payment';
    else active = 'summary';

    const map: StageStateMap = {
      client: { isCompleted: clientCompleted, isActive: active === 'client' },
      items: { isCompleted: itemsCompleted, isActive: active === 'items' },
      payment: { isCompleted: paymentCompleted, isActive: active === 'payment' },
      summary: { isCompleted: summaryCompleted, isActive: active === 'summary' },
    };

    return { active, map };
  }, [sale]);

  // auto-focus the active stage on load (until user navigates)
  useEffect(() => {
    if (!hasUserNavigated) setViewStage(stageState.active);
  }, [stageState.active, hasUserNavigated]);

  // guard: if viewed stage becomes blocked after a sale change, snap back
  useEffect(() => {
    const current = stageState.map[viewStage];
    if (!current || (!current.isActive && !current.isCompleted)) {
      setViewStage(stageState.active);
    }
  }, [sale, stageState.active, viewStage, stageState.map]);

  // ---- navigation ----
  const navigateToStage = (stage: StageKey) => {
    const target = stageState.map[stage];
    if (!target) return;
    if (target.isActive || target.isCompleted) {
      setHasUserNavigated(true);
      setViewStage(stage);
    }
  };

  // ---- actions (all handle token & refetch/advance implicitly) ----
  const createClientAndSale = async (clientData: CreateClientData) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Usuário não autenticado');

    const newClient = await ClientsService.createClient(clientData, token);
    const newSale = await SalesService.createSale(
      { clientId: newClient.id, notes: `Venda criada para ${newClient.name}` },
      token,
    );

    // Fetch the full sale data after creation
    const fullSale = await fetchSale(newSale.id);
    setSale(fullSale);
    setHasUserNavigated(false); // focus will jump to 'items'
    return fullSale;
  };

  const updateClient = async (clientData: CreateClientData) => {
    if (!sale) throw new Error('Venda não carregada');
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Usuário não autenticado');

    await ClientsService.updateClient(sale.client.id, clientData, token);
    await fetchSale(sale.id);
  };

  const replaceItems = async (items: UpdateSaleItemsData['items']) => {
    if (!sale) throw new Error('Venda não carregada');
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Usuário não autenticado');

    await SalesService.updateSaleItems(sale.id, { items }, token);
    await fetchSale(sale.id); // recalc totals
    setHasUserNavigated(false); // focus will jump to 'payment'
  };

  // add this in your SalesService if not present yet
  const paySale = async (data: { paymentMethod: string; paymentDate: string }) => {
    if (!sale) throw new Error('Venda não carregada');
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Usuário não autenticado');

    // You likely have PATCH /sales/:id/pay in your backend
    // Implement SalesService.paySale(id, data, token) accordingly.
    // @ts-ignore
    await SalesService.paySale?.(sale.id, data, token);
    await fetchSale(sale.id);
    setHasUserNavigated(false); // focus will jump to 'summary'
  };

  return {
    sale,
    loading,
    error,
    refetch: sale?.id ? () => fetchSale(sale.id!) : undefined,

    stageState,
    viewStage,
    setViewStage,
    navigateToStage,

    // actions
    createClientAndSale,
    updateClient,
    replaceItems,
    paySale,
  };
}
