import { useMemo, useState } from 'react';
import type { SaleWithItems } from '../../services/sales.service';

type PaymentMethod = 'PIX' | 'CARTAO' | 'DINHEIRO' | 'BOLETO';

type PaymentForm = {
  paymentMethod: PaymentMethod | '';
  paymentDate: string; // YYYY-MM-DD
};

type PaymentStepProps = {
  sale: SaleWithItems | null | undefined;
  onConfirm: (data: { paymentMethod: string; paymentDate: string }) => Promise<void>;
};

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CARTAO', label: 'Cartão (Crédito/Débito)' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'BOLETO', label: 'Boleto' },
];

const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PaymentStep({ sale, onConfirm }: PaymentStepProps) {
  const isPaid = sale?.paymentStatus === 'PAID';

  // initial values from sale
  const initial: PaymentForm = useMemo(
    () => ({
      paymentMethod: (sale?.paymentMethod as PaymentMethod) || '',
      paymentDate: sale?.paymentDate
        ? sale.paymentDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    }),
    [sale],
  );

  const [editing, setEditing] = useState(!isPaid); // if not paid yet, open form by default
  const [form, setForm] = useState<PaymentForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const total = Number(sale?.totalValue || 0);

  const changed =
    form.paymentMethod !== initial.paymentMethod || form.paymentDate !== initial.paymentDate;

  const validate = (): string | null => {
    if (!form.paymentMethod) return 'Escolha um método de pagamento.';
    if (!form.paymentDate) return 'Informe a data do pagamento.';
    // simple “not-in-future” check (optional)
    if (new Date(form.paymentDate) > new Date()) return 'A data não pode ser no futuro.';
    return null;
  };

  const doConfirm = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    // if already paid and trying to change, require the confirm toggle
    if (isPaid && changed && !confirmOpen) {
      setConfirmOpen(true);
      setError('');
      return;
    }
    if (isPaid && confirmOpen && !confirmChecked) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await onConfirm({
        paymentMethod: form.paymentMethod,
        paymentDate: form.paymentDate,
      });
      setSuccess('Pagamento registrado com sucesso.');
      setEditing(false);
      setConfirmOpen(false);
      setConfirmChecked(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao registrar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const resetToInitial = () => {
    setForm(initial);
    setEditing(false);
    setError('');
    setSuccess('');
    setConfirmOpen(false);
    setConfirmChecked(false);
  };

  // ---------- UI ----------
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Pagamento</h2>
          <p className="mt-2 text-secondary-600">
            {isPaid && !editing
              ? 'Pagamento registrado. Você pode visualizar os dados abaixo.'
              : 'Informe o método e a data para marcar a venda como paga.'}
          </p>
        </div>

        {!editing && (
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            Alterar Pagamento
          </button>
        )}
      </div>

      {/* SUMMARY (read-only) */}
      {isPaid && !editing && (
        <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-secondary-600">Status</div>
              <div className="text-lg font-semibold text-success-700">PAGO</div>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Total</div>
              <div className="text-lg font-semibold text-secondary-900">{formatBRL(total)}</div>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Método</div>
              <div className="text-lg font-semibold text-secondary-900">
                {sale?.paymentMethod || '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Data</div>
              <div className="text-lg font-semibold text-secondary-900">
                {sale?.paymentDate ? new Date(sale.paymentDate).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
            {/* Backend doesn't support notes for payment */}
          </div>
        </div>
      )}

      {/* FORM (create / edit) */}
      {(!isPaid || editing) && (
        <div className="space-y-6">
          <div className="rounded-xl border border-secondary-200 bg-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Método de pagamento
                </label>
                <select
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))
                  }
                >
                  <option value="">Selecione...</option>
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Data do pagamento
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  value={form.paymentDate}
                  onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                />
              </div>

              {/* Backend doesn't support reference field for payment */}

              {/* Backend doesn't support notes field for payment */}
            </div>

            {/* Totals hint */}
            <div className="mt-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <div className="text-sm text-secondary-700">
                Total da venda: <span className="font-semibold">{formatBRL(total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            {isPaid && (
              <button className="btn-secondary" onClick={resetToInitial} disabled={saving}>
                Cancelar
              </button>
            )}
            <button
              className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={doConfirm}
              disabled={saving || (!changed && isPaid)}
            >
              {saving ? 'Salvando...' : isPaid ? 'Atualizar pagamento' : 'Confirmar pagamento'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-danger-50 text-danger-700 rounded-lg border border-danger-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-success-50 text-success-700 rounded-lg border border-success-200">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Two-step confirm (only when altering an already-paid sale) */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-xl shadow-xl border border-secondary-200">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-xl font-semibold text-secondary-900">Confirmar atualização</h3>
              <p className="mt-2 text-secondary-700">
                Você está alterando um pagamento já registrado. Isso pode impactar financeiro e
                relatórios.
              </p>
            </div>
            <div className="p-6 space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-secondary-800">
                  Entendo as consequências e desejo prosseguir com a atualização do pagamento.
                </span>
              </label>
            </div>
            <div className="p-6 border-t border-secondary-200 flex items-center justify-end gap-3">
              <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>
                Voltar
              </button>
              <button
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={doConfirm}
                disabled={!confirmChecked || saving}
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
