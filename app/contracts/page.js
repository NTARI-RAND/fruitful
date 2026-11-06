'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import ReputationPanel from '@/components/ratings/ReputationPanel';
import RatePrompt from '@/components/ratings/RatePrompt';

// Contracts side (whitepaper §4.5.4-.5). Phase 3 surfaces the LBTAS prompt feed
// (transactions awaiting your rating) and your own reputation distribution.
export default function MyContracts() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(null);
  const [myRep, setMyRep] = useState(null);
  const [rateItem, setRateItem] = useState(null);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    setUser(u);
    load();
  }, []);

  async function load() {
    try {
      const [p, rep, rec] = await Promise.all([
        api('/ratings/me/pending').catch(() => ({ pending: [] })),
        api('/ratings/me').catch(() => null),
        api('/ratings/me/received').catch(() => ({ received: [] })),
      ]);
      setPending(p.pending || []);
      setMyRep(rep);
      setReceived(rec.received || []);
    } catch {
      setPending([]);
    }
  }

  async function contest(ratingId) {
    const reason = prompt(t('Por que esta avaliação é injusta?'));
    if (!reason || !reason.trim()) return;
    try {
      await api('/ratings/' + ratingId + '/contest', 'POST', { reason: reason.trim() });
      load();
    } catch (e) { alert(e.message); }
  }

  if (!user) return null;

  const openFlags = received.filter((r) => !r.voided);

  return (
    <div className="min-h-screen bg-cream">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(20px,3vw,40px) var(--page-pad)' }}>
        <h1 className="font-serif text-3xl font-black text-soil mb-1">{t('Meus Contratos')}</h1>
        <p className="text-sm text-text3 mb-6">{t('Acompanhe planos, PINGs, transações e avaliações LBTAS.')}</p>

        {/* ── MY REPUTATION ── */}
        <div className="card-agro p-5 mb-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-text3 mb-3">{t('Minha reputação')}</div>
          <ReputationPanel rep={myRep} size="md" />
          <p className="text-xs text-text3 mt-3 italic">{t('Reputação é uma distribuição por papel, nunca uma média.')}</p>
        </div>

        {/* ── PENDING RATINGS (the bidirectional prompt feed) ── */}
        <div className="card-agro p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-text3 mb-1">{t('Avaliações pendentes')}</div>
          <p className="text-xs text-text3 mb-4">{t('Avalie suas transações para construir confiança na rede.')}</p>

          {pending === null ? (
            <div className="flex flex-col gap-2">{Array(2).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <span className="text-3xl">✅</span>
              <p className="text-sm text-text3">{t('Nada pendente para avaliar')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map((item) => (
                <div key={item.transaction_id} className="tx-item">
                  <div className="tx-icon">⭐</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-soil leading-tight">{item.listing_title || t('Produto')}</div>
                    <div className="text-xs text-text3 mt-1">
                      {item.role === 'buyer' ? t('Compra') : t('Venda')} · {formatCurrency(item.amount)} · {formatDate(item.created_at)}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm self-center" onClick={() => setRateItem(item)}>{t('Avaliar')}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FLAGS RECEIVED (contest a -1 made against you — either direction) ── */}
        {openFlags.length > 0 && (
          <div className="card-agro p-5 mt-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-rust mb-1">{t('Sinalizações recebidas')}</div>
            <p className="text-xs text-text3 mb-4">{t('Uma avaliação “Sem confiança” contra você pode ser contestada para revisão.')}</p>
            <div className="flex flex-col gap-3">
              {openFlags.map((f) => (
                <div key={f.id} className="tx-item">
                  <div className="tx-icon text-rust">-1</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-soil">{t('Sem confiança')} · {f.rated_role}</div>
                    <div className="text-xs text-text3 mt-1">{formatDate(f.created_at)}{f.contested ? ' · ' + t('contestada') : ''}</div>
                  </div>
                  {f.contested
                    ? <span className="badge-agro badge-wheat text-[10px] self-center">{t('contestada')}</span>
                    : <button className="btn btn-outline btn-sm self-center" onClick={() => contest(f.id)}>{t('Contestar')}</button>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {rateItem && (
        <RatePrompt
          transactionId={rateItem.transaction_id}
          title={rateItem.listing_title}
          counterparty={rateItem.counterparty_id}
          releasesEscrow={rateItem.role === 'buyer' && rateItem.status === 'paid'}
          onClose={() => setRateItem(null)}
          onRated={load}
        />
      )}
    </div>
  );
}
