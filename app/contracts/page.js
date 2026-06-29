'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

// Contracts/PING/transactions side (whitepaper §4.5.4-.5). The existing
// transactions view + the LBTAS-gated escrow release wire in here in Phases 3-4.
const SECTIONS = [
  { icon: '📑', title: 'Plans & PINGs', desc: 'Consumer/producer plans and the PING update schedule.' },
  { icon: '⇄', title: 'Transactions', desc: 'Purchases, escrow holds, and settlement status.' },
  { icon: '📅', title: 'PING Calendar', desc: 'Planting, harvest, and PING report dates.' },
  { icon: '⭐', title: 'LBTAS Ratings', desc: 'One −1…+4 rating per transaction; required before escrow release.' },
];

export default function MyContracts() {
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
        <h1 className="font-serif text-3xl font-black text-soil mb-1">{t('Meus Contratos')}</h1>
        <p className="text-sm text-text3 mb-6">{t('Acompanhe planos, PINGs, transações e avaliações LBTAS.')}</p>
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
