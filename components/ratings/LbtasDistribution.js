'use client';
import { LEVELS, LEVEL_LABELS, totalOf, signed } from '@/lib/lbtas';
import { useI18n } from '@/lib/i18n';

/**
 * LBTAS reputation display — the canonical "How to Display LBTAS Ratings" layout:
 * a row of the six STATIC levels (-1..+4) with the DYNAMIC count beneath each,
 * separated by a single divider line. Counts are a distribution — never averaged.
 *
 * props: distribution ({ "-1":n, "0":n, ... }), total (optional), size, showTotal
 */
export default function LbtasDistribution({ distribution, total, size = 'md', showTotal = true }) {
  const { t } = useI18n();
  const dist = distribution || {};
  const sum = total != null ? total : totalOf(dist);
  const harm = Number(dist['-1'] || 0);

  const big = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl' }[size] || 'text-2xl';
  const small = { sm: 'text-[11px]', md: 'text-sm', lg: 'text-base' }[size] || 'text-sm';
  const gap = size === 'lg' ? 'gap-x-5' : 'gap-x-3';

  if (sum === 0) {
    return <div className="text-xs text-text3">{t('Sem avaliações ainda')}</div>;
  }

  return (
    <div className="inline-block">
      <div className={`grid ${gap} items-center`} style={{ gridTemplateColumns: `repeat(${LEVELS.length}, minmax(1.6em, 1fr))` }}>
        {/* static level row */}
        {LEVELS.map((level) => (
          <div
            key={`h${level}`}
            title={LEVEL_LABELS[String(level)]}
            className={`text-center font-serif font-black leading-none ${big} ${level === -1 ? 'text-rust' : 'text-soil'}`}>
            {signed(level)}
          </div>
        ))}

        {/* single divider spanning all columns */}
        <div style={{ gridColumn: '1 / -1' }} className="border-t border-[var(--border-c2)] my-1.5" />

        {/* dynamic count row */}
        {LEVELS.map((level) => {
          const count = Number(dist[String(level)] || 0);
          return (
            <div
              key={`c${level}`}
              className={`text-center tabular-nums ${small} ${level === -1 && count > 0 ? 'text-rust font-semibold' : 'text-text3'}`}>
              {count}
            </div>
          );
        })}
      </div>

      {showTotal && (
        <div className="mt-2 text-xs text-text3">
          {sum} {sum === 1 ? t('avaliação') : t('avaliações')}
          {harm > 0 && (
            <span className="text-rust font-semibold"> · {harm}× -1 {t('Sem confiança')}</span>
          )}
        </div>
      )}
    </div>
  );
}
