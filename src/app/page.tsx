// src/app/page.tsx
import { ChatContainer } from '@/components/ChatContainer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main className="w-full">
      <ChatContainer />
    </main>
  );
}
