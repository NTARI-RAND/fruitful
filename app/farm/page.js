'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

// Producer side of the network (whitepaper §4.5.3.2-.6). Posting flows land in Phase 2.
const SECTIONS = [
  { icon: '🌱', title: 'Producer Plans', desc: 'Plant→harvest plans buyers can contract against, with scheduled PING updates.' },
  { icon: '🥕', title: 'Direct Market', desc: 'Harvested goods listed for immediate sale.' },
  { icon: '📦', title: 'Products', desc: 'Value-added goods, seeds & young plants, tools, infrastructure, soil inputs.' },
  { icon: '🌾', title: 'Agrotourism', desc: 'Market gardens, events, tours, education, and volunteering.' },
];

export default function MyFarm() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    setUser(u);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(20px,3vw,40px) var(--page-pad)' }}>
        <h1 className="font-serif text-3xl font-black text-soil mb-1">{t('Minha Fazenda')}</h1>
        <p className="text-sm text-text3 mb-6">{t('Gerencie sua produção: planos, produtos, venda direta e agroturismo.')}</p>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px,100%),1fr))' }}>
          {SECTIONS.map(s => (
            <div key={s.title} className="card-agro p-5 flex flex-col">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-semibold text-soil">{s.title}</div>
              <div className="text-sm text-text3 mt-1 flex-1">{s.desc}</div>
              <span className="badge-agro badge-wheat text-[10px] mt-3 self-start">{t('Em breve')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
