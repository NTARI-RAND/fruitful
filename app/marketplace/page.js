'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import MarketplaceResults from '@/components/listings/MarketplaceResults';
import MarketplaceFilters from '@/components/listings/MarketplaceFilters';
import ListingDetail from '@/components/listings/ListingDetail';
import NewListingModal from '@/components/listings/NewListingModal';
import { useI18n } from '@/lib/i18n';

const CATEGORIES = [
  { value: '',          label: 'Todos',      emoji: '🌿' },
  { value: 'graos',    label: 'Grãos',      emoji: '🌾' },
  { value: 'frutas',   label: 'Frutas',     emoji: '🍊' },
  { value: 'gado',     label: 'Pecuária',   emoji: '🐄' },
  { value: 'maquinas', label: 'Máquinas',   emoji: '🚜' },
  { value: 'outros',   label: 'Outros',     emoji: '📦' },
];

async function fetchListings({ category, state, minPrice, maxPrice }) {
  let query = '?status=active&limit=40';
  if (category) query += '&category=' + category;
  if (state) query += '&state=' + state;
  if (minPrice) query += '&minPrice=' + minPrice;
  if (maxPrice) query += '&maxPrice=' + maxPrice;
  const data = await api('/listings' + query);
  const items = Array.isArray(data) ? data : data?.listings;
  if (!Array.isArray(items)) throw new Error('Invalid listings response');
  return items;
}

function MarketplaceInner() {
  const params = useSearchParams();
  const [listings, setListings] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const latestRequest = useRef(0);
  const [selected, setSelected]   = useState(null);
  const [newListing, setNewListing] = useState(false);
  const [cat, setCat]   = useState(params.get('cat') || '');
  const [search, setSearch] = useState('');
  const [stateF, setStateF] = useState('');
  const [minP, setMinP] = useState('');
  const [maxP, setMaxP] = useState('');
  const [sort, setSort] = useState('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useI18n();

  async function load() {
    const requestId = ++latestRequest.current;
    setListings(null);
    setLoadError(false);
    try {
      const items = await fetchListings({ category: cat, state: stateF, minPrice: minP, maxPrice: maxP });
      if (requestId === latestRequest.current) setListings(items);
    } catch {
      if (requestId === latestRequest.current) {
        setListings([]);
        setLoadError(true);
      }
    }
  }

  useEffect(() => {
    load();
    return () => { latestRequest.current += 1; };
  }, [cat, stateF, sort]);

  function openNew() {
    if (!getToken()) return alert(t('Faça login para anunciar'));
    setNewListing(true);
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ── HERO HEADER ── */}
      <div className="bg-cream2 border-b border-[var(--border-c)]" style={{ padding: 'clamp(24px,4vw,48px) var(--page-pad) clamp(20px,3vw,36px)' }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-soil mb-1">{t('Marketplace')}</h1>
          <p className="text-sm text-text3">{t('Produtos agrícolas de produtores de todo o Brasil')}</p>
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .1 }}
          className="flex gap-2 mt-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[480px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text3 text-sm">🔍</span>
            <input
              type="text"
              placeholder={t('Buscar produto ou cidade...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
              className="form-input pl-9 w-full"
            />
          </div>
          <button className="btn btn-primary" onClick={load}>{t('Buscar')}</button>
          <button className="btn btn-outline" onClick={openNew}>+ {t('Anunciar')}</button>
          <button
            className="btn btn-ghost md:hidden"
            onClick={() => setFiltersOpen(v => !v)}>
            ⚙ {t('Filtros')}
          </button>
        </motion.div>

        {/* CATEGORY PILLS */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4, delay: .2 }}
          className="flex gap-2 mt-4 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`cat-pill ${cat === c.value ? 'active' : ''}`}>
              <span>{c.emoji}</span> {t(c.label)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: 'clamp(20px,3vw,40px) var(--page-pad)', display: 'grid', gridTemplateColumns: 'clamp(200px,22vw,260px) 1fr', gap: 'clamp(16px,2.5vw,32px)', alignItems: 'start' }}
        className="max-md:grid-cols-1">

        {/* ── SIDEBAR FILTERS (desktop always visible, mobile toggle) ── */}
        <MarketplaceFilters
          state={stateF} onStateChange={setStateF}
          minPrice={minP} maxPrice={maxP}
          onMinPriceChange={setMinP} onMaxPriceChange={setMaxP}
          sort={sort} onSortChange={setSort} visible={filtersOpen} onApply={load}
        />

        <MarketplaceResults
          listings={listings} loadError={loadError} search={search}
          onRetry={load} onSelect={setSelected}
          onClear={() => { setCat(''); setSearch(''); setStateF(''); load(); }}
        />
      </div>

      {selected   && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
      {newListing && <NewListingModal onClose={() => setNewListing(false)} onCreated={load} />}
    </div>
  );
}

export default function Marketplace() {
  return <Suspense><MarketplaceInner /></Suspense>;
}
