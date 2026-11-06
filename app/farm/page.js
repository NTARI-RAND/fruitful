'use client';
import MyPosts from '@/components/posts/MyPosts';

// Producer side of the network (whitepaper §4.5.3.2-.6).
// Phase 2 high-value types live here: Direct Market + Products (Plans & Agrotourism follow).
export default function MyFarm() {
  return (
    <MyPosts
      title="Minha Fazenda"
      subtitle="Gerencie sua produção: planos, produtos, venda direta e agroturismo."
      types={['direct_market', 'product', 'plan_producer', 'plan_consumer', 'agrotourism']}
      defaultType="direct_market"
      newLabel="Novo anúncio"
    />
  );
}
