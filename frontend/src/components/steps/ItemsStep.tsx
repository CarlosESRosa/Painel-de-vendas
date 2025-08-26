// src/components/steps/ItemsStep.tsx
import { useEffect, useMemo, useState } from 'react';
import { ProductsService } from '../../services/products.service';
import type { SaleWithItems } from '../../services/sales.service';

type Product = {
  id: string;
  name: string;
  sku: string;
  price: string; // backend returns string
  isActive?: boolean;
};

type SelectedItem = {
  productId: string;
  quantity: number;
  product: Product;
};

type ItemsStepProps = {
  sale: SaleWithItems | null | undefined;
  onConfirm: (items: { productId: string; quantity: number }[]) => Promise<void>;
};

const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ItemsStep({ sale, onConfirm }: ItemsStepProps) {
  // Modal: product picker
  const [isOpen, setIsOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');

  // Selection (working copy) + original (for diff/guard)
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [originalSelected, setOriginalSelected] = useState<SelectedItem[]>([]);

  // Confirm-to-backend
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Two-step confirmation on edit
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');

  // Prefill from sale items
  useEffect(() => {
    if (!sale?.items) return;
    const pre: SelectedItem[] = sale.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      product: {
        id: i.productId,
        name: i.product?.name ?? '',
        sku: i.product?.sku ?? '',
        price: String(i.unitPrice),
        isActive: true,
      },
    }));
    setSelected(pre);
    setOriginalSelected(pre);
    setError('');
  }, [sale?.id]);

  const hasExistingItems = (sale?.items?.length ?? 0) > 0;
  const primaryCtaLabel = hasExistingItems ? 'Editar Itens da Venda' : 'Confirmar Itens da Venda';
  const topButtonLabel = hasExistingItems ? 'Editar seleção' : 'Selecionar Produtos';

  // Diff check: only allow save when changed if it already had items
  const isChanged = useMemo(() => {
    if (selected.length !== originalSelected.length) return true;
    const a = [...selected].sort((x, y) => x.productId.localeCompare(y.productId));
    const b = [...originalSelected].sort((x, y) => x.productId.localeCompare(y.productId));
    for (let i = 0; i < a.length; i++) {
      if (a[i].productId !== b[i].productId) return true;
      if (a[i].quantity !== b[i].quantity) return true;
    }
    return false;
  }, [selected, originalSelected]);

  // Products modal
  const openModal = async () => {
    setIsOpen(true);
    setError('');
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Usuário não autenticado');
      const data = await ProductsService.getProducts(
        { page: 1, perPage: 100, isActive: true },
        token,
      );
      setProducts(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar produtos');
    } finally {
      setLoadingProducts(false);
    }
  };
  const closeModal = () => setIsOpen(false);

  // Selection helpers
  const upsertItem = (product: Product, quantity: number) => {
    setSelected((prev) => {
      const idx = prev.findIndex((x) => x.productId === product.id);
      const q = Math.max(1, quantity);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: q };
        return copy;
      }
      return [...prev, { productId: product.id, product, quantity: q }];
    });
  };
  const removeItem = (productId: string) =>
    setSelected((prev) => prev.filter((x) => x.productId !== productId));
  const changeQty = (productId: string, q: number) =>
    setSelected((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: Math.max(1, q) } : x)),
    );

  // Totals
  const total = useMemo(
    () => selected.reduce((acc, it) => acc + (parseFloat(it.product.price) || 0) * it.quantity, 0),
    [selected],
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q),
    );
  }, [products, query]);

  const isSelected = (id: string) => selected.some((s) => s.productId === id);

  // Save handlers
  const saleSuffix = (sale?.id || '').slice(-6);
  const confirmReady =
    confirmChecked &&
    (confirmCode.trim().toUpperCase() === 'ATUALIZAR' || confirmCode === saleSuffix);

  const reallyConfirmToBackend = async () => {
    setSaving(true);
    setError('');
    try {
      if (selected.length === 0) throw new Error('Selecione pelo menos um produto');
      const payload = selected.map((s) => ({ productId: s.productId, quantity: s.quantity }));
      await onConfirm(payload);
      // on success, new "original" equals current
      setOriginalSelected(selected);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar itens da venda');
    } finally {
      setSaving(false);
      setConfirmOpen(false);
      setConfirmChecked(false);
      setConfirmCode('');
    }
  };

  const handlePrimaryCta = async () => {
    if (!hasExistingItems) {
      await reallyConfirmToBackend(); // first time: save directly
      return;
    }
    if (!isChanged) return; // nothing to update
    setConfirmOpen(true); // require 2-step confirmation
  };

  // UI
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Itens da Venda</h2>
          <p className="mt-2 text-secondary-600">
            Selecione produtos e quantidades. Primeiro abra o seletor para escolher, depois confirme
            os itens.
          </p>
        </div>

        {/* Single top-right button (select or edit) */}
        <button onClick={openModal} className="btn-secondary px-4 py-2">
          {topButtonLabel}
        </button>
      </div>

      {/* Resume */}
      <div className="bg-secondary-50 rounded-xl border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Resumo dos Itens</h3>
          <span className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm font-medium rounded-full">
            {selected.length} item{selected.length !== 1 ? 's' : ''}
          </span>
        </div>

        {selected.length === 0 ? (
          <div className="text-secondary-600">
            Nenhum item selecionado. Clique em <strong>{topButtonLabel}</strong>.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {selected.map((it) => {
                const unit = parseFloat(it.product.price) || 0;
                const sub = unit * it.quantity;
                return (
                  <div
                    key={it.productId}
                    className="bg-white p-4 rounded-lg border border-secondary-200 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-secondary-900 truncate">{it.product.name}</h4>
                      <p className="text-sm text-secondary-500">SKU: {it.product.sku}</p>
                      <p className="text-sm text-secondary-600">
                        Preço unitário: {formatBRL(unit)}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Qty */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-secondary-700">Qtd</span>
                        <div className="flex items-center border border-secondary-300 rounded-lg">
                          <button
                            onClick={() => changeQty(it.productId, it.quantity - 1)}
                            disabled={it.quantity <= 1}
                            className="px-3 py-2 text-secondary-600 hover:text-secondary-800 disabled:opacity-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => changeQty(it.productId, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-2 text-center border-x border-secondary-300 focus:ring-2 focus:ring-primary-500"
                          />
                          <button
                            onClick={() => changeQty(it.productId, it.quantity + 1)}
                            className="px-3 py-2 text-secondary-600 hover:text-secondary-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[140px]">
                        <p className="text-sm text-secondary-600">Subtotal</p>
                        <p className="text-lg font-semibold text-primary-600">{formatBRL(sub)}</p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(it.productId)}
                        className="p-2 text-danger-600 hover:text-danger-800 hover:bg-danger-50 rounded-lg"
                        title="Remover item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200 flex items-center justify-between">
              <div />
              <div className="text-right">
                <p className="text-sm text-secondary-600">Total</p>
                <p className="text-2xl font-bold text-primary-600">{formatBRL(total)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer actions (NO "Editar seleção" here anymore) */}
      <div className="mt-6 flex items-center justify-end">
        <button
          className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePrimaryCta}
          disabled={
            saving || selected.length === 0 || (hasExistingItems && !isChanged) // must change to enable on existing sale
          }
          title={hasExistingItems && !isChanged ? 'Nenhuma alteração realizada' : undefined}
        >
          {saving ? 'Salvando...' : primaryCtaLabel}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
          {error}
        </div>
      )}

      {/* Products modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-5xl bg-white rounded-xl shadow-xl border border-secondary-200">
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">Selecionar Produtos</h3>
              <button onClick={closeModal} className="text-secondary-500 hover:text-secondary-800">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome ou SKU..."
                  className="flex-1 rounded-lg border border-secondary-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">
                  {filteredProducts.length} produto(s)
                </span>
              </div>

              {loadingProducts ? (
                <div className="py-16 text-center text-secondary-600">Carregando produtos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-secondary-600">
                  Nenhum produto encontrado.
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-auto divide-y divide-secondary-200 border border-secondary-200 rounded-lg">
                  {filteredProducts.map((p) => {
                    const unit = parseFloat(p.price) || 0;
                    const already = selected.find((s) => s.productId === p.id);
                    const qty = already?.quantity ?? 1;
                    const sub = unit * qty;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 p-4 bg-white"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-secondary-900 truncate">{p.name}</div>
                          <div className="text-sm text-secondary-500">SKU: {p.sku}</div>
                          <div className="text-sm text-secondary-600">
                            Preço unitário: {formatBRL(unit)}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Qty */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-secondary-700">Qtd</span>
                            <div className="flex items-center border border-secondary-300 rounded-lg">
                              <button
                                onClick={() => upsertItem(p, Math.max(1, qty - 1))}
                                className="px-3 py-2 text-secondary-600 hover:text-secondary-800"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={qty}
                                onChange={(e) =>
                                  upsertItem(p, Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-16 px-2 py-2 text-center border-x border-secondary-300 focus:ring-2 focus:ring-primary-500"
                              />
                              <button
                                onClick={() => upsertItem(p, qty + 1)}
                                className="px-3 py-2 text-secondary-600 hover:text-secondary-800"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-[140px]">
                            <p className="text-sm text-secondary-600">Subtotal</p>
                            <p className="text-lg font-semibold text-primary-600">
                              {formatBRL(sub)}
                            </p>
                          </div>

                          {/* Toggle select/remove */}
                          {isSelected(p.id) ? (
                            <button
                              onClick={() => removeItem(p.id)}
                              className="px-3 py-2 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 hover:bg-danger-100"
                            >
                              Remover
                            </button>
                          ) : (
                            <button
                              onClick={() => upsertItem(p, 1)}
                              className="px-3 py-2 rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-800 hover:bg-secondary-100"
                            >
                              Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-secondary-700">
                  Total selecionado: <span className="font-semibold">{formatBRL(total)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn-secondary" onClick={closeModal}>
                    Fechar
                  </button>
                  <button
                    className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={closeModal}
                    disabled={selected.length === 0}
                  >
                    Usar seleção
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two-step confirmation modal (only on edit of existing sale) */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-xl shadow-xl border border-secondary-200">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-xl font-semibold text-secondary-900">Confirmar atualização</h3>
              <p className="mt-2 text-secondary-700">
                Você está <span className="font-semibold">alterando os itens</span> de uma venda já
                criada. Isso pode impactar estoque, financeiro e relatórios.
              </p>
              <ul className="mt-3 list-disc list-inside text-secondary-700 text-sm space-y-1">
                <li>Os totais da venda serão recalculados.</li>
                <li>Itens removidos deixarão de compor a venda.</li>
                <li>Itens adicionados/alterados serão registrados no histórico.</li>
              </ul>
            </div>

            <div className="p-6 space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-secondary-800">
                  Entendo as consequências e desejo prosseguir com a atualização dos itens.
                </span>
              </label>

              <div>
                <p className="text-sm text-secondary-700 mb-2">
                  Para confirmar, digite{' '}
                  <code className="font-mono px-1 py-0.5 bg-secondary-100 rounded">ATUALIZAR</code>{' '}
                  ou os últimos <strong>6 dígitos</strong> do código desta venda:{' '}
                  <code className="font-mono px-1 py-0.5 bg-secondary-100 rounded">
                    {(sale?.id || '').slice(-6) || '------'}
                  </code>
                </p>
                <input
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="ATUALIZAR ou últimos 6 dígitos"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-secondary-200 flex items-center justify-end gap-3">
              <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </button>
              <button
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={reallyConfirmToBackend}
                disabled={!confirmReady || saving}
              >
                {saving ? 'Salvando...' : 'Confirmar atualização'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
