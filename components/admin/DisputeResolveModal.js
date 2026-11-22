'use client';
import { useEffect, useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { LEVELS, LEVEL_LABELS, signed, MAX_COMMENT_WORDS, wordCount } from '@/lib/lbtas';

const ROLE_LABEL = { buyer: 'Comprador', seller: 'Vendedor', admin: 'Admin' };

// Operator console for resolving a frozen dispute: review the transaction's ratings
// (incl. the disputed -1 + its justification), settle the money (release/refund),
// and on a bad-faith finding void the buyer's rating + issue a replacement.
export default function DisputeResolveModal({ dispute, onClose, onResolved }) {
  const toast = useToast();
  const { t } = useI18n();
  const [ratings, setRatings] = useState(null);
  const [resolution, setResolution] = useState('release');
  const [voidBuyer, setVoidBuyer] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [adminValue, setAdminValue] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dispute?.transaction_id) { setRatings([]); return; }
    api(`/ratings/transactions/${dispute.transaction_id}`)
      .then((r) => setRatings(r.ratings || []))
      .catch(() => setRatings([]));
  }, [dispute]);

  const adminNeedsComment = voidBuyer && adminValue === -1;
  const adminWc = wordCount(adminComment);
  const adminCommentTooLong = adminWc > MAX_COMMENT_WORDS;
  const blocked = loading || (adminNeedsComment && !adminComment.trim()) || adminCommentTooLong;

  async function submit() {
    setLoading(true);
    try {
      const payload = { resolution, voidBuyerRating: voidBuyer };
      if (voidBuyer) {
        if (voidReason.trim()) payload.voidReason = voidReason.trim();
        if (adminValue !== null) payload.adminRating = { value: adminValue, comment: adminComment.trim() || undefined };
      }
      await api(`/admin/disputes/${dispute.id}/resolve`, 'POST', payload);
      toast(t('Disputa resolvida'));
      onClose();
      onResolved?.();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="560px">
      <ModalHeader title={t('Resolver disputa')} onClose={onClose} />

      <div className="bg-rust/5 border border-rust/30 rounded-lg p-3 mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-rust mb-1">{t('Motivo')}</div>
        <div className="text-sm text-soil break-words">{dispute.reason}</div>
      </div>

      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text3 mb-2">{t('Avaliações desta transação')}</div>
        {ratings === null ? (
          <div className="skeleton h-12 rounded" />
        ) : ratings.length === 0 ? (
          <p className="text-xs text-text3">{t('Nenhuma avaliação nesta transação')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ratings.map((r) => (
              <div key={r.id} className={`text-sm border rounded-lg p-2.5 ${r.voided ? 'opacity-50 border-[var(--border-c)]' : r.value === -1 ? 'border-rust/40 bg-rust/5' : 'border-[var(--border-c)]'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-soil">{t(ROLE_LABEL[r.rater_role] || r.rater_role)}</span>
                  <span className={`font-serif font-black ${r.value === -1 ? 'text-rust' : 'text-soil'}`}>{signed(r.value)}</span>
                  <span className="text-xs text-text3">{LEVEL_LABELS[String(r.value)]}</span>
                  {r.voided ? <span className="text-[10px] uppercase tracking-wide text-text3 ml-auto">{t('Anulada')}</span> : null}
                </div>
                {r.narrative && <div className="text-xs text-text2 mt-1 break-words">{r.narrative}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <button className={`btn btn-sm flex-1 ${resolution === 'release' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setResolution('release')}>{t('Liberar ao vendedor')}</button>
        <button className={`btn btn-sm flex-1 ${resolution === 'refund' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setResolution('refund')}>{t('Reembolsar comprador')}</button>
      </div>

      <label className="flex items-center gap-2 text-sm text-soil mb-2 cursor-pointer">
        <input type="checkbox" checked={voidBuyer} onChange={(e) => setVoidBuyer(e.target.checked)} />
        {t('Comprador agiu de má-fé — anular sua avaliação')}
      </label>

      {voidBuyer && (
        <div className="border-l-2 border-rust/40 pl-3 ml-1 mb-3 flex flex-col gap-2">
          <input className="form-input text-sm" placeholder={t('Motivo da anulação (opcional)')} value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
          <div className="text-[11px] text-text3">{t('Emitir avaliação do vendedor (opcional)')}</div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {LEVELS.map((level) => {
              const active = adminValue === level;
              const isHarm = level === -1;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAdminValue(active ? null : level)}
                  title={LEVEL_LABELS[String(level)]}
                  className={`py-2 rounded-lg border font-serif font-black text-sm ${active ? (isHarm ? 'border-rust bg-rust/10 text-rust' : 'border-moss bg-moss-light text-soil') : `border-[var(--border-c)] ${isHarm ? 'text-rust' : 'text-soil'}`}`}>
                  {signed(level)}
                </button>
              );
            })}
          </div>
          {adminValue !== null && (
            <div>
              <textarea
                className="form-input text-sm min-h-[56px] resize-y"
                placeholder={adminNeedsComment ? t('Comentário obrigatório para -1') : t('Comentário (opcional)')}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)} />
              <div className={`text-[10px] text-right ${adminCommentTooLong ? 'text-rust' : 'text-text3'}`}>{adminWc}/{MAX_COMMENT_WORDS}</div>
            </div>
          )}
        </div>
      )}

      <button className="btn btn-primary w-full mt-2" onClick={submit} disabled={blocked}>
        {loading ? t('Enviando...') : t('Resolver disputa')}
      </button>
    </Modal>
  );
}
