'use client';

import { useRouter } from 'next/navigation';
import VintageLanding from '@/components/VintageLanding';

export default function Home() {
  const router = useRouter();

  const handleEnterViewer = (targetCode) => {
    if (targetCode) {
      router.push(`/viewer?code=${encodeURIComponent(targetCode)}`);
    } else {
      router.push('/viewer');
    }
  };

  return (
    <VintageLanding
      onEnterViewer={handleEnterViewer}
    />
  );
}
