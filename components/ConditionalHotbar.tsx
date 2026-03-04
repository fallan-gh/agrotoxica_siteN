'use client';
import { usePathname } from 'next/navigation';
import Hotbar from './Hotbar';

export default function ConditionalHotbar() {
  const pathname = usePathname();
  
  // 🚀 Se estiver na raiz (Cofre), a Hotbar não é renderizada
  if (pathname === '/') return null;

  // Em qualquer outra página (Vitrine, Carrinho, etc), ela aparece
  return <Hotbar />;
}