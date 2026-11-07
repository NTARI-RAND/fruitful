'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const STATES = ['SP','MG','PR','RS','GO','MT','MS','BA','SC','PE','CE','RO','PA'];

export default function MarketplaceFilters({
  state, onStateChange, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange,
  sort, onSortChange, visible, onApply,
}) {
  const { t } = useI18n();
  return (
    <AnimatePresence>
      <motion.aside
        key="sidebar"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: .35 }}
        className={`card-agro p-5 sticky top-20 max-md:static ${visible ? 'block' : 'max-md:hidden'}`}>

        <div className="text-xs font-semibold uppercase tracking-widest text-text3 mb-3">{t('Estado')}</div>
        <select className="form-input text-sm mb-5 w-full" value={state} onChange={e => { onStateChange(e.target.value); }}>
          <option value="">{t('Todos')}</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>

        <div className="text-xs font-semibold uppercase tracking-widest text-text3 mb-3">{t('Preço (R$)')}</div>
        <div className="flex gap-2 items-center mb-1">
          <input type="number" placeholder={t('Mín')} value={minPrice} onChange={e => onMinPriceChange(e.target.value)}
            className="form-input text-sm flex-1" />
          <span className="text-text3 text-sm">—</span>
          <input type="number" placeholder={t('Máx')} value={maxPrice} onChange={e => onMaxPriceChange(e.target.value)}
            className="form-input text-sm flex-1" />
        </div>
        <button className="btn btn-ghost btn-sm w-full mt-2" onClick={onApply}>{t('Aplicar filtros')}</button>

        <div className="divider my-4" />

        <div className="text-xs font-semibold uppercase tracking-widest text-text3 mb-3">{t('Ordenar por')}</div>
        {[['recent','Mais recentes'],['price_asc','Menor preço'],['price_desc','Maior preço']].map(([v,l]) => (
          <label key={v} className={`filter-option ${sort === v ? 'active' : ''}`}>
            <input type="radio" className="sr-only" checked={sort === v} onChange={() => onSortChange(v)} />
            <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${sort === v ? 'bg-moss border-moss' : 'border-[var(--border-c2)]'}`} />
            {t(l)}
          </label>
        ))}
      </motion.aside>
    </AnimatePresence>
  );
}
