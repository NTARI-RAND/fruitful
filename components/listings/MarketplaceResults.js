'use client';
import { motion, AnimatePresence } from 'framer-motion';
import ListingCard, { ListingCardSkeleton } from '@/components/listings/ListingCard';
import { useI18n } from '@/lib/i18n';

function matchingListings(listings, search) {
  return listings?.filter(listing =>
    !search || listing.title.toLowerCase().includes(search.toLowerCase()) ||
    listing.city?.toLowerCase().includes(search.toLowerCase())
  ) || [];
}

function ResultCount({ loading, count }) {
  const { t } = useI18n();
  return <span className="text-sm text-text3">{loading ? t('Buscando...')
    : `${count} ${count !== 1 ? t('produtos encontrados') : t('produto encontrado')}`}</span>;
}

function ListingGrid({ listings, onSelect }) {
  return <div className="listing-grid">
    {listings.map((listing, index) => (
      <motion.div key={listing.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .3, delay: index * .04 }}>
        <ListingCard listing={listing} onClick={onSelect} />
      </motion.div>
    ))}
  </div>;
}

export default function MarketplaceResults({ listings, loadError, search, onRetry, onSelect, onClear }) {
  const { t } = useI18n();
  const filtered = matchingListings(listings, search);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {!loadError && <ResultCount loading={listings === null} count={filtered.length} />}
      </div>
      <AnimatePresence mode="wait">
        {loadError ? (
          <motion.div key="error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-20 gap-3">
            <p className="text-text3 text-sm">{t('Não foi possível carregar os produtos.')}</p>
            <button className="btn btn-outline btn-sm" onClick={onRetry}>{t('Tentar novamente')}</button>
          </motion.div>
        ) : listings === null ? (
          <div key="skeletons" className="listing-grid">
            {Array(8).fill(0).map((_, index) => <ListingCardSkeleton key={index} />)}
          </div>
        ) : filtered.length ? (
          <ListingGrid key="grid" listings={filtered} onSelect={onSelect} />
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-20 gap-3">
            <span className="text-5xl">🌾</span>
            <p className="text-text3 text-sm">{t('Nenhum produto encontrado')}</p>
            <button className="btn btn-ghost btn-sm" onClick={onClear}>{t('Limpar filtros')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
