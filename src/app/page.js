'use client';
import LoginPage from './login/page';
import { SessionProvider } from 'next-auth/react';

export default function Home() {
  return (
    <SessionProvider>
      <div>
        <LoginPage />
      </div>
    </SessionProvider>
  );
}
