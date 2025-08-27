import { useMemo } from 'react';
import type { SaleWithItems } from '../../services/sales.service';

type SummaryStepProps = {
  sale: SaleWithItems | null | undefined;
  onBackToItems?: () => void;
  onFinish?: () => void; // e.g. navigate('/vendas')
};

const formatBRL = (n: number) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SummaryStep({ sale, onBackToItems, onFinish }: SummaryStepProps) {
  const items = sale?.items ?? [];
  const itemsCount = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0),
    [items],
  );
  const total = Number(sale?.totalValue || 0);

  // Extract client with proper typing
  const client = sale?.client;

  return (
    <div className="space-y-8">
      {/* Header badge row */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge label="Cliente" ok={!!client?.id} />
        <StatusBadge label="Itens" ok={items.length > 0 && total > 0} />
        <StatusBadge label="Pagamento" ok={sale?.paymentStatus === 'PAID'} />
        <div className="ml-auto text-sm text-secondary-600">
          Última atualização:{' '}
          <span className="font-medium text-secondary-800">
            {sale?.updatedAt ? new Date(sale.updatedAt).toLocaleString('pt-BR') : '—'}
          </span>
        </div>
      </div>

      {/* Top overview card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Status da Venda"
          value={
            <span
              className={`px-2.5 py-1 rounded-full text-sm font-semibold ${
                sale?.paymentStatus === 'PAID'
                  ? 'bg-success-50 text-success-700 border border-success-200'
                  : 'bg-warning-50 text-warning-800 border border-warning-200'
              }`}
            >
              {sale?.paymentStatus === 'PAID' ? 'PAGA' : 'PENDENTE'}
            </span>
          }
        />
        <OverviewCard title="Itens" value={`${itemsCount} item${itemsCount !== 1 ? 's' : ''}`} />
        <OverviewCard
          title="Total"
          value={<span className="text-primary-700">{formatBRL(total)}</span>}
        />
      </div>

      {/* Client info (disabled-form look) */}
      <section className="rounded-xl border border-secondary-200 bg-secondary-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Dados do Cliente</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadField label="Nome completo" value={client?.name} />
          <ReadField label="CPF" value={client?.cpf} />
          <ReadField label="Email" value={client?.email} />
          <ReadField label="Telefone" value={client?.phone} />
          <ReadField label="CEP" value={client?.cep} />
          <ReadField label="Cidade" value={client?.city} />
          <ReadField label="Bairro" value={client?.neighborhood} />
          <ReadField label="Estado" value={client?.state} />
          <ReadField className="md:col-span-2" label="Rua" value={client?.street} />
          <ReadField label="Número" value={client?.number} />
        </div>
      </section>

      {/* Items table */}
      <section className="rounded-xl border border-secondary-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Itens da Venda</h3>
          <span className="px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-800 text-sm">
            {items.length} produto{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-secondary-600">Nenhum item selecionado.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-secondary-600">
                    <th className="text-left font-medium py-2 pr-4">Produto</th>
                    <th className="text-left font-medium py-2 pr-4">SKU</th>
                    <th className="text-right font-medium py-2 pr-4">Qtd</th>
                    <th className="text-right font-medium py-2 pr-4">Preço unitário</th>
                    <th className="text-right font-medium py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {items.map((it) => {
                    const unit = Number(it.unitPrice || 0);
                    const sub = unit * Number(it.quantity || 0);
                    return (
                      <tr key={`${it.productId}-${it.id ?? ''}`}>
                        <td className="py-3 pr-4 text-secondary-900">{it.product?.name ?? '—'}</td>
                        <td className="py-3 pr-4 text-secondary-600">{it.product?.sku ?? '—'}</td>
                        <td className="py-3 pr-4 text-right text-secondary-900">{it.quantity}</td>
                        <td className="py-3 pr-4 text-right text-secondary-900">
                          {formatBRL(unit)}
                        </td>
                        <td className="py-3 text-right font-semibold text-secondary-900">
                          {formatBRL(sub)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200 flex items-center justify-end">
              <div className="text-right">
                <div className="text-sm text-secondary-600">Total</div>
                <div className="text-2xl font-bold text-primary-700">{formatBRL(total)}</div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Payment block */}
      <section className="rounded-xl border border-secondary-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Pagamento</h3>
        {sale?.paymentStatus === 'PAID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadField label="Status" value="Pago" success />
            <ReadField label="Método" value={sale?.paymentMethod || '—'} />
            <ReadField
              label="Data"
              value={
                sale?.paymentDate ? new Date(sale.paymentDate).toLocaleDateString('pt-BR') : '—'
              }
            />
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-warning-200 bg-warning-50 text-warning-900">
            Pagamento ainda não registrado. Conclua o pagamento na etapa anterior.
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-secondary-600">
          ID da venda:{' '}
          <span className="font-medium text-secondary-900">{sale?.id?.slice?.(-8) ?? '—'}</span>
        </div>
        <div className="flex items-center gap-3">
          {onBackToItems && (
            <button
              className="px-4 py-2 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-100"
              onClick={onBackToItems}
            >
              ← Voltar aos Itens
            </button>
          )}
          {onFinish && (
            <button
              className="px-4 py-2 rounded-lg border border-primary-600 text-primary-700 hover:bg-primary-50"
              onClick={onFinish}
            >
              Finalizar Venda
            </button>
          )}
          <button
            className="px-4 py-2 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-100"
            onClick={() => window.print()}
          >
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- small subcomponents ---------- */

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${
        ok
          ? 'bg-success-50 text-success-700 border-success-200'
          : 'bg-secondary-100 text-secondary-800 border-secondary-200'
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-success-500' : 'bg-secondary-400'}`} />
      {label}
    </span>
  );
}

function OverviewCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-5">
      <div className="text-sm text-secondary-600">{title}</div>
      <div className="mt-1 text-xl font-semibold text-secondary-900">{value}</div>
    </div>
  );
}

function ReadField({
  label,
  value,
  className = '',
  success = false,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
  success?: boolean;
  multiline?: boolean;
}) {
  const v = value == null || String(value).trim() === '' ? '—' : String(value);
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-secondary-700 mb-2">{label}</label>
      {multiline ? (
        <div
          className={`min-h-[44px] rounded-lg border px-3 py-2 bg-white/60 shadow-inner text-secondary-900 ${
            success ? 'border-success-300 text-success-800' : 'border-secondary-200'
          }`}
        >
          {v}
        </div>
      ) : (
        <input
          readOnly
          disabled
          value={v}
          className={`w-full rounded-lg border px-3 py-2 bg-white/60 shadow-inner cursor-not-allowed text-secondary-900 ${
            success ? 'border-success-300 text-success-800' : 'border-secondary-200'
          }`}
        />
      )}
    </div>
  );
}
