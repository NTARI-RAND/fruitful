'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

// Service posts (whitepaper §4.5.3.1). Posting flows land in Phase 2.
const SECTIONS = [
  { icon: '🧑‍🌾', title: 'Labor', desc: 'Planning & advising, setup & maintenance, planting & harvest.' },
  { icon: '🚚', title: 'Logistics', desc: 'Transport by range: under 10 km, over 10 km, over 20 km.' },
  { icon: '🏭', title: 'Processing', desc: 'Cottage / home-based, general, and animal processing.' },
  { icon: '♻️', title: 'Composting & Recycling', desc: 'Waste-to-soil and material recovery services.' },
  { icon: '🌿', title: 'Environmental Services', desc: 'Restoration, stewardship, and ecosystem services.' },
];

export default function MyServices() {
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
        <h1 className="font-serif text-3xl font-black text-soil mb-1">{t('Meus Serviços')}</h1>
        <p className="text-sm text-text3 mb-6">{t('Ofereça serviços à rede: trabalho, logística, processamento e mais.')}</p>
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
