'use client';
import { useEffect, useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/format';

const RATE_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

// Contract detail: PING schedule + the producer's progress updates, plus role
// actions — the seller posts updates, the buyer can sell (transfer) the position.
export default function ContractModal({ transaction: tx, me, onClose, onChanged }) {
  const toast = useToast();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [note, setNote] = useState('');
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [price, setPrice] = useState('');
  const [transferring, setTransferring] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || '';
  const isSeller = me?.id === tx.seller_id;
  const isBuyer = me?.id === tx.buyer_id;
  const live = tx.status === 'paid' && (tx.escrow_locked === 1 || tx.escrow_locked === true);

  async function load() {
    try { setData(await api(`/transactions/${tx.id}/pings`)); }
    catch (e) { toast(e.message, 'error'); setData({ schedule: [], reports: [] }); }
  }
  useEffect(() => { load(); }, []);

  async function onFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        const headers = { Authorization: 'Bearer ' + getToken() };
        if (process.env.NEXT_PUBLIC_API_KEY) headers['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY;
        const res = await fetch(API + '/posts/upload-media', { method: 'POST', headers, body: fd });
        const d = await res.json();
        if (d.url) urls.push(d.url);
      } catch { /* skip */ }
    }
    setMedia((m) => [...m, ...urls].slice(0, 5));
    setUploading(false);
  }

  async function postUpdate() {
    if (!note.trim() && media.length === 0) return toast(t('Nota da atualização'), 'error');
    setPosting(true);
    try {
      await api(`/transactions/${tx.id}/pings`, 'POST', { note: note.trim() || undefined, media });
      toast(t('Atualização publicada!'));
      setNote(''); setMedia([]);
      load();
    } catch (e) { toast(e.message, 'error'); }
    finally { setPosting(false); }
  }

  async function transfer() {
    const p = parseFloat(price);
    if (!toEmail.trim()) return toast(t('E-mail do comprador'), 'error');
    if (!p || p <= 0) return toast(t('Preço de venda (R$)'), 'error');
    setTransferring(true);
    try {
      await api(`/transactions/${tx.id}/transfer`, 'POST', { toEmail: toEmail.trim(), price: p });
      toast(t('Contrato transferido!'));
      onClose();
      onChanged?.();
    } catch (e) { toast(e.message, 'error'); }
    finally { setTransferring(false); }
  }

  const schedule = data?.schedule || [];
  const reports = data?.reports || [];
  const past = schedule.filter((s) => s.status === 'past').length;
  const next = schedule.find((s) => s.status === 'upcoming');
  const reportTimes = reports.map((r) => new Date(r.created_at).getTime());

  // Did the producer post a report within this checkpoint's window?
  function reportedAt(i) {
    const start = new Date(schedule[i].date).getTime();
    const end = i + 1 < schedule.length ? new Date(schedule[i + 1].date).getTime() : Infinity;
    return reportTimes.some((t2) => t2 >= start && t2 < end);
  }

  return (
    <Modal onClose={onClose} maxWidth="560px">
      <ModalHeader title={tx.listing_title || t('Contrato')} onClose={onClose} />

      {tx.settle_at && (
        <p className="text-xs text-rust mb-3">🔒 {t('Liquidação na maturidade')}: {String(tx.settle_at).slice(0, 10)}</p>
      )}

      {/* PING calendar */}
      {schedule.length > 0 && (
        <div className="bg-cream2 border border-[var(--border-c)] rounded-lg p-3 mb-4 text-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text3 mb-1">{t('Cronograma PING')}</div>
          <div className="text-soil mb-2">
            {t('Cadência')}: {t(RATE_LABEL[data?.ping_rate] || 'Weekly')} · {past}/{schedule.length} {t('checkpoints')}
            {next && <> · {t('Próximo')}: {next.date}</>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {schedule.map((s, i) => {
              const isNext = next && s.date === next.date;
              const reported = reportedAt(i);
              return (
                <span
                  key={s.date}
                  title={reported ? t('Atualização publicada') : s.status === 'past' ? t('checkpoints') : t('Próximo')}
                  className={`text-[11px] px-2 py-1 rounded-md border tabular-nums ${
                    reported ? 'bg-moss-light border-moss/40 text-soil'
                      : s.status === 'past' ? 'bg-cream border-[var(--border-c)] text-text3'
                      : 'border-[var(--border-c)] text-text3'
                  } ${isNext ? 'ring-1 ring-moss' : ''}`}>
                  {s.date.slice(5)}{reported ? ' 📷' : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* reports timeline */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text3 mb-2">{t('Atualizações')}</div>
        {data === null ? (
          <div className="skeleton h-12 rounded" />
        ) : reports.length === 0 ? (
          <p className="text-xs text-text3">{t('Nenhuma atualização ainda')}</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {reports.map((r) => (
              <div key={r.id} className="border-l-2 border-moss/40 pl-3">
                <div className="text-xs text-text3">{formatDate(r.created_at)}</div>
                {r.note && <div className="text-sm text-soil mt-0.5">{r.note}</div>}
                {r.media?.length > 0 && (
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {r.media.map((u, i) => <img key={i} src={u} alt="" className="w-14 h-14 object-cover rounded-lg border border-[var(--border-c)]" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* seller: post an update */}
      {isSeller && live && (
        <div className="border-t border-[var(--border-c)] pt-4 mb-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text3 mb-2">{t('Publicar atualização')}</div>
          <textarea className="form-input text-sm min-h-[60px] resize-y" placeholder={t('Nota da atualização')} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex items-center gap-2 mt-2">
            <input type="file" accept="image/*" multiple onChange={onFiles} className="text-xs" />
            {uploading && <span className="text-xs text-text3">{t('Enviando...')}</span>}
          </div>
          {media.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {media.map((u, i) => <img key={i} src={u} alt="" className="w-12 h-12 object-cover rounded-lg border border-[var(--border-c)]" />)}
            </div>
          )}
          <button className="btn btn-primary btn-sm mt-2" onClick={postUpdate} disabled={posting}>{posting ? t('Enviando...') : t('Publicar atualização')}</button>
        </div>
      )}

      {/* buyer: sell / transfer the position */}
      {isBuyer && live && (
        <div className="border-t border-[var(--border-c)] pt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text3 mb-1">{t('Vender contrato')}</div>
          <p className="text-xs text-text3 mb-2">{t('Transfira sua posição a outro comprador pelo preço acordado. O PING acompanha a titularidade.')}</p>
          <div className="flex gap-2 flex-wrap">
            <input type="email" className="form-input text-sm flex-1 min-w-[160px]" placeholder={t('E-mail do comprador')} value={toEmail} onChange={(e) => setToEmail(e.target.value)} />
            <input type="number" min="1" step="0.01" className="form-input text-sm w-32" placeholder={t('Preço de venda (R$)')} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          {price && parseFloat(price) > 0 && tx.amount != null && (
            <div className="text-xs text-text3 mt-1">
              {t('Pago originalmente')}: {formatCurrency(tx.amount)} → {t('venda')}: {formatCurrency(parseFloat(price))}
            </div>
          )}
          <button className="btn btn-outline btn-sm mt-2" onClick={transfer} disabled={transferring}>{transferring ? t('Enviando...') : t('Transferir')}</button>
        </div>
      )}
    </Modal>
  );
}
