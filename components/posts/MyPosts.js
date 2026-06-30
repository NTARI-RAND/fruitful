'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import ListingCard from '@/components/listings/ListingCard';
import ListingDetail from '@/components/listings/ListingDetail';
import NewPostModal from '@/components/posts/NewPostModal';

// Shared owner view: lists the current user's posts of the given types,
// with a create button (NewPostModal) and per-card delete. Used by My Farm & My Services.
export default function MyPosts({ title, subtitle, types, defaultType, newLabel }) {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    setUser(u);
  }, []);

  async function load() {
    if (!user) return;
    setPosts(null);
    try {
      const data = await api('/posts?user_id=' + encodeURIComponent(user.id) + '&limit=100');
      const items = (data.posts || data.listings || data || []).filter((p) => types.includes(p.post_type));
      setPosts(items);
    } catch {
      setPosts([]);
    }
  }

  useEffect(() => { if (user) load(); }, [user]);

  async function onDelete(id) {
    if (!confirm(t('Remover este anúncio?'))) return;
    try {
      await api('/posts/' + id, 'DELETE');
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(20px,3vw,40px) var(--page-pad)' }}>
        <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
          <div>
            <h1 className="font-serif text-3xl font-black text-soil mb-1">{t(title)}</h1>
            <p className="text-sm text-text3">{t(subtitle)}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>+ {t(newLabel)}</button>
        </div>

        {posts === null ? (
          <p className="text-text3 text-sm">{t('Buscando...')}</p>
        ) : posts.length === 0 ? (
          <div className="card-agro p-8 text-center text-text3">
            <div className="text-4xl mb-2">🌱</div>
            <p className="text-sm mb-3">{t('Você ainda não tem nada por aqui.')}</p>
            <button className="btn btn-outline btn-sm" onClick={() => setCreating(true)}>+ {t(newLabel)}</button>
          </div>
        ) : (
          <div className="listing-grid">
            {posts.map((p) => (
              <div key={p.id} className="relative group">
                <ListingCard listing={p} onClick={setSelected} />
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-rust hover:text-white rounded-full w-7 h-7 text-sm shadow opacity-0 group-hover:opacity-100 transition"
                  title={t('Remover')}>✕</button>
                {p.status && p.status !== 'active' && (
                  <span className="absolute top-2 left-2 z-10 badge-agro badge-wheat text-[10px]">{p.status}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
      {creating && <NewPostModal initialType={defaultType} onClose={() => setCreating(false)} onCreated={load} />}
    </div>
  );
}
