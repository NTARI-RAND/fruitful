'use client';
import { useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { LEVELS, LEVEL_LABELS, LEVEL_DESCRIPTIONS, MAX_COMMENT_WORDS, wordCount, signed } from '@/lib/lbtas';

/**
 * LBTAS rating prompt. Bidirectional: one -1..+4 rating per transaction per side.
 * A -1 ("No Trust") requires a justifying comment of <=500 words (enforced here and
 * again at the API boundary).
 */
export default function RatePrompt({ transactionId, title, counterparty, releasesEscrow = false, onClose, onRated }) {
  const toast = useToast();
  const { t } = useI18n();
  const [value, setValue] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const wc = wordCount(comment);
  const needsComment = value === -1;
  const commentTooLong = wc > MAX_COMMENT_WORDS;
  const blocked = value === null || (needsComment && !comment.trim()) || commentTooLong;

  async function submit() {
    if (value === null) return toast(t('Selecione uma avaliação'), 'error');
    if (needsComment && !comment.trim()) return toast(t('Uma avaliação -1 exige um comentário'), 'error');
    if (commentTooLong) return toast(t('Comentário muito longo'), 'error');
    setLoading(true);
    try {
      const res = await api('/ratings/transactions/' + transactionId, 'POST', {
        rating: value,
        comment: comment.trim() || undefined,
      });
      toast(res?.escrowReleased ? t('Pagamento liberado ao vendedor!') : t('Avaliação registrada!'));
      onClose();
      onRated?.();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="520px">
      <ModalHeader title={t('Avaliar transação')} onClose={onClose} />

      {title && <p className="text-sm font-semibold text-soil mb-0.5">{title}</p>}
      {counterparty && <p className="text-xs text-text3 mb-4">{t('Avaliando')}: {counterparty}</p>}

      {releasesEscrow && (
        <div className="mb-4 text-xs bg-wheat/10 border border-wheat/40 rounded-lg p-2.5 text-soil leading-snug">
          🔒 {t('Ao confirmar, o pagamento retido é liberado ao vendedor.')}
        </div>
      )}

      {/* level selector — same -1..+4 order as the display */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {LEVELS.map((level) => {
          const active = value === level;
          const isHarm = level === -1;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setValue(level)}
              title={LEVEL_LABELS[String(level)]}
              className={`flex items-center justify-center py-3 rounded-lg border transition-colors font-serif text-xl font-black ${
                active
                  ? isHarm ? 'border-rust bg-rust/10 text-rust' : 'border-moss bg-moss-light text-soil'
                  : `border-[var(--border-c)] hover:border-moss ${isHarm ? 'text-rust' : 'text-soil'}`
              }`}>
              {signed(level)}
            </button>
          );
        })}
      </div>

      {value !== null && (
        <div className="mt-3 text-sm leading-snug">
          <span className="font-semibold text-soil">{LEVEL_LABELS[String(value)]}</span>
          <span className="text-text3"> — {LEVEL_DESCRIPTIONS[String(value)]}</span>
        </div>
      )}

      {/* comment — mandatory on -1 */}
      <div className="form-group mt-4">
        <label className="form-label">
          {t('Comentário')}{' '}
          {needsComment
            ? <span className="text-rust">({t('obrigatório')})</span>
            : <span className="text-text3">({t('opcional')})</span>}
        </label>
        <textarea
          className="form-input min-h-[80px] resize-y"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={needsComment ? t('Explique o que houve (máx. 500 palavras)') : ''} />
        <div className={`text-xs mt-1 text-right ${commentTooLong ? 'text-rust' : 'text-text3'}`}>
          {wc}/{MAX_COMMENT_WORDS}
        </div>
      </div>

      <button className="btn btn-primary w-full mt-2" onClick={submit} disabled={loading || blocked}>
        {loading ? t('Enviando...') : releasesEscrow ? t('Confirmar e liberar') : t('Enviar avaliação')}
      </button>
    </Modal>
  );
}
