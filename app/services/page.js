'use client';
import MyPosts from '@/components/posts/MyPosts';

// Service posts (whitepaper §4.5.3.1): labor, logistics, processing, composting, environmental.
export default function MyServices() {
  return (
    <MyPosts
      title="Meus Serviços"
      subtitle="Ofereça serviços à rede: trabalho, logística, processamento e mais."
      types={['service']}
      defaultType="service"
      newLabel="Novo serviço"
    />
  );
}
