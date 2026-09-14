'use client';
import { motion } from 'framer-motion';
import { catLabel, CAT_EMOJI, formatCurrency } from '@/lib/format';
import { useI18n } from '@/lib/i18n';

const CAT_BG = {
  graos:    'from-amber-50 to-yellow-100',
  frutas:   'from-orange-50 to-amber-100',
  gado:     'from-green-50 to-emerald-100',
  maquinas: 'from-slate-50 to-gray-100',
  outros:   'from-cream to-cream2',
};

// Post-type presentation (whitepaper taxonomy). Falls back to legacy category styling.
const TYPE_LABEL = { service: 'Service', direct_market: 'Market', product: 'Product', plan_consumer: 'Plan', plan_producer: 'Plan', agrotourism: 'Agrotourism' };
const TYPE_EMOJI = { service: '🧰', direct_market: '🥕', product: '📦', plan_consumer: '📋', plan_producer: '📋', agrotourism: '🌄' };
const TYPE_BG = { service: 'from-sky-50 to-cyan-100', product: 'from-violet-50 to-purple-100', agrotourism: 'from-lime-50 to-green-100' };

export default function ListingCard({ listing, onClick }) {
  const { t } = useI18n();
  const l = listing;
  const img = l.media?.[0] || l.images?.[0];
  const bg = TYPE_BG[l.post_type] || CAT_BG[l.category] || CAT_BG.outros;
  const emoji = TYPE_EMOJI[l.post_type] || CAT_EMOJI[l.category] || '📦';
  const badge = l.post_type ? (TYPE_LABEL[l.post_type] || l.post_type) : catLabel(l.category);
  const hasPrice = l.price !== null && l.price !== undefined && l.price !== '';
  const qty = Number(l.quantity_available);
  const hasQty = Number.isFinite(qty) && qty > 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(44,31,14,.12)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="listing-card cursor-pointer"
      onClick={() => onClick?.(l)}>

      {/* IMAGE / EMOJI AREA */}
      <div className={`listing-img bg-gradient-to-br ${bg} relative`}>
        {img
          ? <img src={img} alt={l.title} className="w-full h-full object-cover" />
          : <span className="text-5xl select-none">{emoji}</span>
        }
        <div className="absolute top-2.5 left-2.5">
          <span className="badge-agro badge-green text-[10px]">{t(badge)}</span>
        </div>
        {hasQty && qty <= 10 && (
          <div className="absolute top-2.5 right-2.5">
            <span className="badge-agro badge-rust text-[10px]">{t('Últimas unidades')}</span>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="listing-body">
        <div className="listing-title line-clamp-2">{l.title}</div>
        {(l.city || l.state) && (
          <div className="listing-loc">
            <span className="text-xs">📍</span> {[l.city, l.state].filter(Boolean).join(', ')}
          </div>
        )}
        {hasPrice ? (
          <div className="flex items-baseline gap-1 mt-auto pt-2">
            <span className="listing-price">{formatCurrency(l.price)}</span>
            {l.unit && <span className="listing-unit">/{l.unit}</span>}
          </div>
        ) : l.terms ? (
          <div className="listing-unit mt-auto pt-2 line-clamp-1">{l.terms}</div>
        ) : null}
        {hasQty && (
          <div className="listing-qty">
            {qty.toLocaleString('pt-BR')} {t('disponível')}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border-c)]">
      <div className="skeleton h-36" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="skeleton h-3.5 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-2/5 rounded mt-1" />
      </div>
    </div>
  );
}
