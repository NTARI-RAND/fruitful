'use client';
import LbtasDistribution from './LbtasDistribution';
import { useI18n } from '@/lib/i18n';

// A user's reputation is SEPARATE per role — the same person can be an excellent
// market seller and a poor agrotourism host. Renders one distribution per role.
export default function ReputationPanel({ rep, size = 'sm' }) {
  const { t } = useI18n();
  const roles = rep?.roles || [];

  if (!roles.length) {
    return <div className="text-xs text-text3">{t('Sem avaliações ainda')}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {roles.map((r) => (
        <div key={r.role}>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text3 mb-1">{r.label}</div>
          <LbtasDistribution distribution={r.distribution} total={r.total} size={size} />
          {r.dismissed?.length > 0 && (
            <div className="text-[11px] text-text3 mt-1" title={r.dismissed.map((d) => `${d.value} — ${d.voided_reason || 'dismissed'}`).join('\n')}>
              {r.dismissed.length}× {t('avaliação anulada (registrada)')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
